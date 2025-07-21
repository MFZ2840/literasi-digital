// pages/api/public/articles/[id].ts
// Ini adalah API Route PUBLIK untuk mengambil detail artikel tunggal (GET saja)

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db'; // Pastikan path ke 'db.ts' sudah benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/public/articles/[id] (PUBLIC) -----');
  console.log('Request Method:', req.method);

  const { id } = req.query;
  const articleId = Number(id);

  // Validasi ID artikel
  if (isNaN(articleId)) {
    console.log(`ERROR: Invalid article ID in public API: ${id}`);
    return res.status(400).json({ message: 'Invalid article ID' });
  }

  // Hanya izinkan method GET untuk API publik ini
  if (req.method === 'GET') {
    try {
      // Ambil artikel
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          author: {
            select: { // Pilih properti user yang ingin Anda tampilkan
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!article) {
        console.log(`Article not found for public ID: ${articleId}`);
        return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
      }

      // --- TAMBAHAN BARU: Increment views ---
      // Lakukan increment views setelah artikel berhasil ditemukan
      await prisma.article.update({
        where: { id: articleId },
        data: {
          views: {
            increment: 1, // Menambah 1 setiap kali artikel ini diakses
          },
        },
      });
      // --- AKHIR TAMBAHAN BARU ---

      res.status(200).json(article);
    } catch (error: any) {
      console.error('Error fetching public article detail:', error);
      res.status(500).json({ message: 'Failed to fetch public article', error: error.message });
    }
  } else {
    // Jika ada method lain (POST, PUT, DELETE) yang mencoba diakses di sini, tolak
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed for public access`);
  }
  console.log('----- END API CALL DEBUG -----\n');
}
