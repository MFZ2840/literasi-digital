// pages/api/public/authors/index.ts
// This is a PUBLIC API Route for fetching a list of authors (users who have published articles)

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db'; // Ensure the path to 'db.ts' is correct

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/public/authors (PUBLIC) -----');
  console.log('Request Method:', req.method);

  // Only allow GET method for this public API
  if (req.method === 'GET') {
    try {
      // Fetch users who have at least one article
      const authors = await prisma.user.findMany({
        where: {
          articles: {
            some: {}, // Ensures the user has at least one associated article
          },
        },
        select: {
          id: true,
          name: true,
          // You might want to include other relevant author info, but keep it minimal for a dropdown
        },
        orderBy: {
          name: 'asc', // Order authors alphabetically by name
        },
      });

      // Add a "Semua Penulis" (All Authors) option at the beginning
      // Ensure 'id' for "Semua Penulis" is an empty string as expected by frontend's `selectedAuthorId` state
      const allAuthorsOption = { id: '', name: 'All Authors' };
      const responseAuthors = [allAuthorsOption, ...authors];

      res.status(200).json(responseAuthors);
    } catch (error: any) {
      console.error('Error fetching public authors:', error);
      res.status(500).json({ message: 'Failed to fetch public authors list', error: error.message });
    }
  } else {
    // If other methods try to access here, reject
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed for public authors access`);
  }
  console.log('----- END API CALL DEBUG -----\n');
}
