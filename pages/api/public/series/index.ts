// pages/api/public/series/index.ts
// This is a PUBLIC API Route for fetching a list of unique series slugs from articles.

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db'; // Ensure the path to 'db.ts' is correct

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/public/series (PUBLIC) -----');
  console.log('Request Method:', req.method);

  // Only allow GET method for this public API
  if (req.method === 'GET') {
    try {
      // Find all unique series slugs
      const uniqueSeriesSlugs = await prisma.article.findMany({
        distinct: ['seriesSlug'], // Get only unique seriesSlug values
        select: {
          seriesSlug: true, // Select only the seriesSlug field
        },
        orderBy: {
          seriesSlug: 'asc', // Order alphabetically
        },
      });

      // Map the results to the desired format { slug: string, name: string }
      // For simplicity, we'll use seriesSlug as both slug and name for now.
      // In a more complex app, you might have a separate Series model with a proper name.
      const seriesOptions = uniqueSeriesSlugs.map(s => ({
        slug: s.seriesSlug,
        name: s.seriesSlug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') // Capitalize each word for display
      }));

      // Add a "Semua Seri" (All Series) option at the beginning
      const allSeriesOption = { slug: '', name: 'All Series' };
      const responseSeries = [allSeriesOption, ...seriesOptions];

      res.status(200).json(responseSeries);
    } catch (error: any) {
      console.error('Error fetching public series:', error);
      res.status(500).json({ message: 'Failed to fetch public series list', error: error.message });
    }
  } else {
    // If other methods try to access here, reject
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed for public series access`);
  }
  console.log('----- END API CALL DEBUG -----\n');
}
