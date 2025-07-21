// pages/api/public/articles/index.ts
// This is the PUBLIC API Route for fetching a list of articles (GET only)

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db'; // Ensure the path to 'db.ts' is correct

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/public/articles (PUBLIC) -----');
  console.log('Request Method:', req.method);

  // Only allow GET method for this public API
  if (req.method === 'GET') {
    try {
      const { take, skip, sortBy, seriesSlug, authorId, startDate, endDate } = req.query; // Get all filter parameters

      let parsedTake: number | undefined;
      let parsedSkip: number | undefined;
      let orderByClause: any = { createdAt: 'desc' }; // Default sort order: Latest
      let whereClause: any = {}; // Clause for filtering

      // Validate and parse the 'take' parameter
      if (take) {
        parsedTake = parseInt(take as string);
        if (isNaN(parsedTake) || parsedTake <= 0) {
          return res.status(400).json({ message: 'Invalid "take" parameter.' });
        }
      }

      // Validate and parse the 'skip' parameter
      if (skip) {
        parsedSkip = parseInt(skip as string);
        if (isNaN(parsedSkip) || parsedSkip < 0) {
          return res.status(400).json({ message: 'Invalid "skip" parameter.' });
        }
      }

      // Determine orderBy clause based on sortBy parameter
      if (typeof sortBy === 'string') {
        switch (sortBy) {
          case 'latest':
            orderByClause = { createdAt: 'desc' };
            break;
          case 'oldest':
            orderByClause = { createdAt: 'asc' };
            break;
          case 'az':
            orderByClause = { title: 'asc' };
            break;
          case 'za':
            orderByClause = { title: 'desc' };
            break;
          case 'popular': // New: Sort by views
            orderByClause = { views: 'desc' };
            break;
          default:
            // Fallback to default if sortBy is unknown
            orderByClause = { createdAt: 'desc' };
            break;
        }
      }

      // Filter by seriesSlug
      if (typeof seriesSlug === 'string' && seriesSlug.trim() !== '') {
        whereClause.seriesSlug = seriesSlug;
      }

      // Filter by authorId (kembali ke ID)
      if (typeof authorId === 'string' && authorId.trim() !== '') {
        const parsedAuthorId = parseInt(authorId);
        if (!isNaN(parsedAuthorId)) {
          whereClause.authorId = parsedAuthorId;
        } else {
          return res.status(400).json({ message: 'Invalid "authorId" parameter.' });
        }
      }

      // Filter by date range (createdAt)
      if (typeof startDate === 'string' && startDate.trim() !== '') {
        whereClause.createdAt = {
          ...whereClause.createdAt, // Preserve existing date conditions if any
          gte: new Date(startDate), // Greater than or equal to start date
        };
      }
      if (typeof endDate === 'string' && endDate.trim() !== '') {
        whereClause.createdAt = {
          ...whereClause.createdAt, // Preserve existing date conditions if any
          lte: new Date(endDate), // Less than or equal to end date
        };
        // Untuk endDate, tambahkan 23:59:59.999 agar mencakup seluruh hari
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endOfDay;
      }


      // Fetch articles with pagination, sorting, and filtering
      const articles = await prisma.article.findMany({
        where: whereClause, // Apply filtering conditions
        take: parsedTake, // Apply limit (take)
        skip: parsedSkip, // Apply offset (skip)
        include: {
          author: {
            select: { // Select user properties you want to display
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: orderByClause, // Apply the determined order by clause
      });

      // Fetch the total number of articles matching the filters (without pagination)
      const totalArticles = await prisma.article.count({
        where: whereClause, // Count based on the same filters
      });

      // Send articles and total article count
      res.status(200).json({ articles, totalArticles });
    } catch (error: any) {
      console.error('Error fetching public articles:', error);
      res.status(500).json({ message: 'Failed to fetch public articles list', error: error.message });
    }
  } else {
    // If other methods (POST, PUT, DELETE) try to access here, reject
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed for public access`);
  }
  console.log('----- END API CALL DEBUG -----\n');
}
