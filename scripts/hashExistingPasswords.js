// scripts/hashExistingPasswords.js
// Skrip untuk menghash password pengguna yang ada dan memperbaruinya di database

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashExistingPasswords() {
  // Daftar email pengguna yang passwordnya perlu di-hash
  const userEmailsToUpdate = [
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com',
  ];

  // Password plain text saat ini untuk ketiga akun tersebut (berdasarkan screenshot Anda)
  const plainPassword = 'password123'; 

  console.log('Memulai proses hashing dan pembaruan password untuk pengguna yang ada...');

  try {
    // Hash password plain text satu kali saja, karena passwordnya sama untuk semua
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    console.log(`Password plain text "${plainPassword}" berhasil di-hash.`);

    for (const email of userEmailsToUpdate) {
      console.log(`Mencari pengguna dengan email: ${email}`);
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (user) {
        // Hanya update jika hash baru berbeda dengan yang sudah ada (pencegahan redundansi)
        // Walaupun dalam kasus ini kita tahu itu plain text, ini praktik baik
        if (user.password !== hashedPassword) {
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
          console.log(`SUCCESS: Password untuk '${email}' berhasil di-hash dan diperbarui.`);
        } else {
          console.log(`INFO: Password untuk '${email}' sudah cocok dengan hash baru. Tidak perlu diperbarui.`);
        }
      } else {
        console.warn(`Peringatan: Pengguna dengan email '${email}' tidak ditemukan di database. Melewati.`);
      }
    }
    console.log('\nProses hashing dan pembaruan password selesai.');

  } catch (error) {
    console.error('ERROR: Terjadi kesalahan saat menghash atau memperbarui password:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Koneksi Prisma terputus.');
  }
}

// Jalankan fungsi utama
hashExistingPasswords()
  .catch(e => {
    console.error('Error di tingkat atas skrip:', e);
    process.exit(1);
  });
