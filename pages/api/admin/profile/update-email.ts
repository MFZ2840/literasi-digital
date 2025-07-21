// pages/api/admin/profile/update-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]'; // Sesuaikan path jika berbeda
import prisma from '../../../../lib/db'; // Sesuaikan path jika berbeda
import bcrypt from 'bcryptjs'; // <--- AKTIFKAN INI!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { newEmail, currentPassword } = req.body;
  const userId = session.user.id; // userId dari session sudah berupa string, perlu di-parse ke int untuk Prisma

  if (!newEmail || typeof newEmail !== 'string' || !newEmail.includes('@')) {
    return res.status(400).json({ message: 'Email baru tidak valid.' });
  }
  if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
    return res.status(400).json({ message: 'Password saat ini diperlukan untuk konfirmasi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }, // Pastikan ID di-parse ke integer jika kolom ID di Prisma adalah Int
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    // VERIFIKASI PASSWORD SAAT INI DENGAN BCRYPT.COMPARE()
    // Ini adalah perubahan utama yang perlu dilakukan
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Password saat ini salah.' });
    }

    // Cek apakah email baru sudah digunakan oleh pengguna lain
    const existingUserWithNewEmail = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUserWithNewEmail && existingUserWithNewEmail.id !== user.id) {
      return res.status(409).json({ message: 'Email ini sudah digunakan oleh akun lain.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { email: newEmail },
      select: { id: true, name: true, email: true, role: true }, // Pilih field yang ingin dikembalikan
    });

    res.status(200).json({ 
      message: 'Email berhasil diperbarui.', 
      user: {
        id: String(updatedUser.id), // Pastikan ID dikembalikan sebagai string
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Gagal memperbarui email.', error: error.message });
  }
}
