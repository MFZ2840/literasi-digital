// pages/api/admin/profile/update-password.ts
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

  const { newPassword, confirmNewPassword, currentPassword } = req.body;
  const userId = session.user.id;

  // Validasi input
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
  }
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Konfirmasi password baru tidak cocok.' });
  }
  if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
    return res.status(400).json({ message: 'Password saat ini diperlukan untuk konfirmasi.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, name: true, email: true, role: true, password: true }, // <--- Pastikan 'password' diambil!
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    // VERIFIKASI PASSWORD SAAT INI DENGAN BCRYPT.COMPARE()
    const passwordMatch = await bcrypt.compare(currentPassword, user.password); // <--- Ubah baris ini!

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Password saat ini salah.' });
    }

    // HASH PASSWORD BARU SEBELUM MENYIMPANNYA
    const hashedPassword = await bcrypt.hash(newPassword, 12); // <--- Ubah baris ini dengan hashing sebenarnya! (salt rounds 12)

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(200).json({ 
      message: 'Password berhasil diperbarui.', 
      user: {
        id: String(updatedUser.id),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Gagal memperbarui password.', error: error.message });
  }
}
