// pages/api/public/articles/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db'; // Pastikan path ke 'db.ts' sudah benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/public/articles/search (PUBLIC) -----');
  console.log('Request Method:', req.method);

  // Hanya izinkan method GET untuk API publik ini
  if (req.method === 'GET') {
    const { q } = req.query; // Ambil kueri dari URL

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Kueri pencarian tidak valid.' });
    }

    const searchQuery = q.toLowerCase();

    try {
      // Menggunakan Prisma untuk mencari artikel berdasarkan judul atau konten
      const articles = await prisma.article.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery, // Mencari di judul
                mode: 'insensitive', // Case-insensitive search
              },
            },
            {
              content: {
                contains: searchQuery, // Mencari di konten
                mode: 'insensitive', // Case-insensitive search
              },
            },
          ],
        },
        include: {
          author: {
            select: { // Pilih properti user yang ingin Anda tampilkan
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' }, // Urutkan berdasarkan tanggal terbaru secara default
      });

      // Prisma 'contains' akan mencari substring.
      // Untuk pencarian konten, Prisma akan mencari di teks HTML mentah.
      // Pembersihan HTML untuk sorting prioritas akan dilakukan di sisi klien (pages/search.tsx).

      res.status(200).json(articles);
    } catch (error: any) {
      console.error('Error fetching public articles search results:', error);
      res.status(500).json({ message: 'Failed to fetch public articles search results', error: error.message });
    }
  } else {
    // Jika ada method lain (POST, PUT, DELETE) yang mencoba diakses di sini, tolak
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed for public search access`);
  }
  console.log('----- END API CALL DEBUG -----\n');
}
