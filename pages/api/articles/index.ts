// pages/api/articles/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import prisma from '../../../lib/db';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/articles -----');
  console.log('Request Method:', req.method);
  console.log('Request Headers (Cookie):', req.headers.cookie);

  const session = await getServerSession(req, res, authOptions);

  console.log('Session object from getServerSession:', session);
  const isAdmin = session?.user?.role === 'admin';
  console.log('Is session user admin?', isAdmin);
  console.log('----- END API CALL DEBUG -----\n');

  if (!session || !isAdmin) {
    console.log(`ACCESS DENIED: Unauthorized or non-admin user trying to access /api/articles.`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        // 🔥 TAMBAHKAN INI: Include author relation
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // 🔥 TAMBAHKAN INI: Transform data untuk mengatasi mismatch tipe
      const transformedArticles = articles.map(article => ({
        ...article,
        author: article.author ? {
          id: article.author.id.toString(), // Convert number to string
          name: article.author.name,
          email: article.author.email,
        } : undefined,
      }));

      console.log('Articles with author:', transformedArticles[0]); // Debug log
      res.status(200).json(transformedArticles);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: 'Failed to fetch articles', error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, seriesSlug, order, image } = req.body;

      // VALIDASI: client-side sudah ada, tapi ini pengaman server-side
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Judul wajib diisi.', field: 'title' });
      }
      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ message: 'Konten wajib diisi.', field: 'content' });
      }

      // Validasi seriesSlug
      if (!seriesSlug || typeof seriesSlug !== 'string' || seriesSlug.trim() === '') {
        return res.status(400).json({ message: 'Series Slug wajib diisi.', field: 'seriesSlug' });
      }
      if (!/^[a-z0-9-]+$/.test(seriesSlug)) { // Pastikan slug formatnya benar
        return res.status(400).json({ message: 'Series Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-).', field: 'seriesSlug' });
      }

      // Validasi Order (pastikan angka positif)
      let articleOrder: number;
      if (typeof order !== 'number' || isNaN(order) || order < 1) {
        return res.status(400).json({ message: 'Urutan artikel harus berupa angka positif.', field: 'order' });
      }
      articleOrder = Number(order);

      // --- NEW: Validasi Unik Urutan Artikel dalam Seri (untuk POST) ---
      const existingArticleWithOrder = await prisma.article.findFirst({
        where: {
          seriesSlug: seriesSlug,
          order: articleOrder,
        },
      });

      if (existingArticleWithOrder) {
        return res.status(409).json({ // 409 Conflict: resource conflict (data already exists)
          message: `Artikel dengan urutan ${articleOrder} sudah ada dalam seri '${seriesSlug}'.`,
          field: 'order' // Memberi tahu frontend bahwa error ini terkait dengan field 'order'
        });
      }
      // --- END NEW LOGIC ---

      if (!session.user || !session.user.id) {
        return res.status(400).json({ message: 'User ID not found in session' });
      }

      const authorIdNum = Number(session.user.id);
      if (isNaN(authorIdNum)) {
        return res.status(400).json({ message: 'Invalid author ID in session' });
      }

      const newArticle = await prisma.article.create({
        data: {
          title,
          content,
          seriesSlug: seriesSlug,
          order: articleOrder,
          image: image || null,
          author: {
            connect: { id: authorIdNum },
          },
        },
        // 🔥 TAMBAHKAN INI: Include author saat create
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // 🔥 TAMBAHKAN INI: Transform data untuk mengatasi mismatch tipe
      const transformedArticle = {
        ...newArticle,
        author: newArticle.author ? {
          id: newArticle.author.id.toString(), // Convert number to string
          name: newArticle.author.name,
          email: newArticle.author.email,
        } : undefined,
      };

      res.status(201).json(transformedArticle);
    } catch (error: any) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Failed to create article', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}