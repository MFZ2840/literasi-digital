// pages/api/admin/profile/update-username.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]'; // Sesuaikan path jika berbeda
import prisma from '../../../../lib/db'; // Sesuaikan path jika berbeda
import bcrypt from 'bcryptjs'; // <--- Tambahkan ini!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { username, currentPassword } = req.body; // <--- Tambahkan currentPassword di sini!
  const userId = session.user.id; // ID pengguna dari sesi

  // Validasi input
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ message: 'Username tidak boleh kosong.' });
  }
  if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
    return res.status(400).json({ message: 'Password saat ini diperlukan untuk konfirmasi.' });
  }

  try {
    // Ambil pengguna dari database untuk verifikasi password dan ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      // Pastikan kolom 'password' disertakan untuk perbandingan
      select: { id: true, name: true, email: true, role: true, password: true }, // <--- Pastikan 'password' diambil!
    });

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    // Verifikasi password saat ini
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Password saat ini salah.' });
    }

    // Cek apakah username baru sudah digunakan oleh pengguna lain (selain diri sendiri)
    const existingUserWithNewUsername = await prisma.user.findFirst({
      where: { name: username },
    });

    if (existingUserWithNewUsername && existingUserWithNewUsername.id !== parseInt(userId)) {
      return res.status(409).json({ message: 'Username ini sudah digunakan oleh akun lain.' });
    }

    // Perbarui username
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { name: username },
      select: { id: true, name: true, email: true, role: true }, // Pilih properti yang ingin dikembalikan
    });

    res.status(200).json({ 
      message: 'Username berhasil diperbarui.', 
      user: { // Kirim objek user lengkap
        id: String(updatedUser.id), // Pastikan ID adalah string
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating username:', error);
    res.status(500).json({ message: 'Gagal memperbarui username.', error: error.message });
  }
}
