// pages/api/test-db.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Coba ambil user pertama dari database
      const userCount = await prisma.user.count();

      // >>>>>>> AKTIFKAN KODE INI UNTUK MEMBUAT USER BARU <<<<<<<
      const newUser = await prisma.user.create({
        data: {
          email: `test${Date.now()}@example.com`, // Email unik setiap kali dijalankan
          password: 'password123', // Ingat: gunakan bcrypt untuk password hashing di produksi!
          name: 'Test User',
          role: 'admin',
        },
      });
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      res.status(200).json({
        message: 'Koneksi database sukses!',
        userCount: userCount + 1, // Jika user baru dibuat
        newUser: newUser, // Menampilkan detail user baru
      });
    } catch (error: any) {
      console.error('Database connection error:', error);
      res.status(500).json({
        message: 'Gagal terkoneksi ke database atau terjadi error saat operasi.',
        error: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}