// pages/api/articles/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]';
import { Session } from 'next-auth';

// --- Import DOMPurify dan JSDOM ---
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('<!DOCTYPE html>');

const DOMPurifyWindow: Window & typeof globalThis = {
  Node: window.Node,
  Element: window.Element,
  DocumentFragment: window.DocumentFragment,
  HTMLTemplateElement: window.HTMLTemplateElement,
  NodeFilter: window.NodeFilter,
  NamedNodeMap: window.NamedNodeMap,
  HTMLFormElement: window.HTMLFormElement,
  DOMParser: window.DOMParser,
  document: window.document, // DOMPurify juga pasti butuh document
} as unknown as Window & typeof globalThis;

const purify = DOMPurify(DOMPurifyWindow);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n----- API CALL: /api/articles/[id] -----');
  console.log('Request Method:', req.method);
  console.log('Request Headers (Cookie):', req.headers.cookie);

  const { id } = req.query;
  const articleId = Number(id);

  const session = await getServerSession(req, res, authOptions) as Session | null;
  console.log('Session object from getServerSession in [id].ts:', session);

  if (isNaN(articleId)) {
    console.log(`ERROR: Invalid article ID: ${id}`);
    return res.status(400).json({ message: 'Invalid article ID' });
  }

  // Proteksi rute: Hanya admin yang bisa mengakses API ini
  if (!session || !session.user || session.user.role !== 'admin') {
    console.log(`ACCESS DENIED in [id].ts: Session valid: ${!!session}, User valid: ${!!session?.user}, User Role: ${session?.user?.role}`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
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
      
      if (!article) {
        console.log(`Article not found for ID: ${articleId}`);
        return res.status(404).json({ message: 'Article not found' });
      }

      // 🔥 TAMBAHKAN INI: Transform data untuk mengatasi mismatch tipe
      const transformedArticle = {
        ...article,
        author: article.author ? {
          id: article.author.id.toString(), // Convert number to string
          name: article.author.name,
          email: article.author.email,
        } : undefined,
      };

      res.status(200).json(transformedArticle);
    } catch (error: any) {
      console.error('Error fetching article:', error);
      res.status(500).json({ message: 'Failed to fetch article', error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      let { title, content, seriesSlug, order, image } = req.body; // Gunakan 'let' karena 'content' akan diubah

      // --- LAKUKAN SANITASI DI SINI UNTUK METODE PUT ---
      // Sanitasi konten HTML yang diterima dari CKEditor
      const sanitizedContent = purify.sanitize(content, { USE_PROFILES: { html: true } });
      content = sanitizedContent; // Timpa content dengan yang sudah disanitasi
      // --- AKHIR SANITASI ---

      // Basic validation for PUT (can expand as in POST if needed, but client-side should cover much of it)
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Judul wajib diisi.', field: 'title' });
      }
      // Validasi konten setelah sanitasi (misal: apakah masih ada teks?)
      const strippedContent = content.replace(/(<([^>]+)>)/gi, "").trim(); // Hapus tag HTML untuk validasi panjang teks
      if (!strippedContent) {
        return res.status(400).json({ message: 'Konten wajib diisi.', field: 'content' });
      }
      if (strippedContent.length < 10) {
        return res.status(400).json({ message: 'Konten minimal 10 karakter (teks asli tanpa format).', field: 'content' });
      }

      if (!seriesSlug || typeof seriesSlug !== 'string' || seriesSlug.trim() === '') {
        return res.status(400).json({ message: 'Series Slug wajib diisi.', field: 'seriesSlug' });
      }
      if (!/^[a-z0-9-]+$/.test(seriesSlug)) { // Pastikan slug formatnya benar
        return res.status(400).json({ message: 'Series Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-).', field: 'seriesSlug' });
      }
      
      let parsedOrder: number;
      if (typeof order !== 'number' || isNaN(order) || order < 1) {
        return res.status(400).json({ message: 'Urutan artikel harus berupa angka positif.', field: 'order' });
      }
      parsedOrder = Number(order);

      // --- NEW: Validasi Unik Urutan Artikel dalam Seri (untuk PUT) ---
      // Cari artikel lain yang memiliki seriesSlug dan order yang sama
      const existingArticleWithOrder = await prisma.article.findFirst({
        where: {
          seriesSlug: seriesSlug,
          order: parsedOrder,
          // PENTING: Kecualikan artikel yang sedang kita update saat ini
          NOT: {
            id: articleId,
          },
        },
      });

      if (existingArticleWithOrder) {
        return res.status(409).json({
          message: `Artikel dengan urutan ${parsedOrder} sudah ada dalam seri '${seriesSlug}' (oleh artikel lain).`,
          field: 'order'
        });
      }
      // --- END NEW LOGIC ---

      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: {
          title,
          content, // Gunakan 'content' yang sudah disanitasi
          seriesSlug,
          order: parsedOrder,
          image,
        },
        // 🔥 TAMBAHKAN INI: Include author saat update
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
        ...updatedArticle,
        author: updatedArticle.author ? {
          id: updatedArticle.author.id.toString(), // Convert number to string
          name: updatedArticle.author.name,
          email: updatedArticle.author.email,
        } : undefined,
      };

      res.status(200).json(transformedArticle);
    } catch (error: any) {
      console.error('Error updating article:', error);
      // Tangani error unik dari Prisma, misalnya P2002 (unique constraint violation)
      if (error.code === 'P2002') {
        if (error.meta?.target && Array.isArray(error.meta.target)) {
          if (error.meta.target.includes('seriesSlug')) {
            return res.status(409).json({ message: 'Series Slug sudah digunakan.', field: 'seriesSlug' });
          }
          // Asumsi Anda punya unique constraint pada kombinasi seriesSlug dan order
          if (error.meta.target.includes('seriesSlug') && error.meta.target.includes('order')) {
            return res.status(409).json({ message: 'Kombinasi Series Slug dan Order sudah ada.', field: 'order' });
          }
        }
      }
      res.status(500).json({ message: 'Failed to update article', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.article.delete({
        where: { id: articleId },
      });
      console.log(`Article with ID ${articleId} successfully deleted by admin.`);
      res.status(204).end(); // No Content
    } catch (error: any) {
      console.error('Error deleting article:', error);
      res.status(500).json({ message: 'Failed to delete article', error: error.message });
    }
  } else {
    console.log(`Method ${req.method} Not Allowed for /api/articles/[id]`);
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  console.log('----- END API CALL DEBUG -----\n');
}