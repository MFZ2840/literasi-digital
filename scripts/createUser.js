// scripts/createUser.js
// Simpan file ini di luar folder 'pages' atau 'api', misalnya di folder 'scripts'

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Pastikan Anda sudah menginstal bcryptjs: npm install bcryptjs

const prisma = new PrismaClient();

async function createUser() {
  // Detail akun baru yang ingin Anda buat
  const email = '';
  const plainPassword = ''; // Password plain text yang akan di-hash
  const name = '';
  const role = ''; // Sesuaikan role jika Anda memiliki peran lain

  try {
    // 1. Hash password sebelum menyimpannya ke database
    // '12' adalah salt rounds, semakin tinggi semakin aman (tapi lebih lambat)
    const hashedPassword = await bcrypt.hash(plainPassword, 12); 

    // 2. Cek apakah pengguna dengan email ini sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.warn(`Pengguna dengan email '${email}' sudah ada. Melewati pembuatan akun.`);
      return; // Hentikan proses jika pengguna sudah ada
    }

    // 3. Buat pengguna baru di database
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword, // Simpan password yang sudah di-hash
        name: name,
        role: role,
        // createdAt dan updatedAt akan diisi secara otomatis oleh Prisma karena @default(now()) dan @updatedAt di skema Anda
      },
    });

    console.log('Akun pengguna berhasil dibuat:');
    console.log('---------------------------------');
    console.log(`ID: ${newUser.id}`);
    console.log(`Email: ${newUser.email}`);
    console.log(`Nama: ${newUser.name}`);
    console.log(`Role: ${newUser.role}`);
    console.log(`Dibuat Pada: ${newUser.createdAt.toISOString()}`);
    console.log(`Diperbarui Pada: ${newUser.updatedAt.toISOString()}`);
    console.log('---------------------------------');
    console.log('Penting: Password yang disimpan di database adalah hash, bukan teks biasa.');

  } catch (error) {
    console.error('Terjadi kesalahan saat membuat akun pengguna:', error);
  } finally {
    // Pastikan koneksi Prisma ditutup setelah operasi selesai
    await prisma.$disconnect();
  }
}

// Panggil fungsi untuk membuat pengguna
createUser();
