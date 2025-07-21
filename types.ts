// types.ts

export interface User {
  id: number;        // Sesuai dengan `Int` di Prisma
  email: string;
  password?: string; // Hati-hati, ini adalah hash password, tidak pernah dikirim ke frontend. Jadikan opsional.
  name: string | null; // `String?` di Prisma, tapi di NextAuth Session.user.name bisa null
  role: string;        // `String` di Prisma, default "admin"
  createdAt: string;   // `DateTime` dari Prisma akan jadi string di JavaScript
  updatedAt: string;   // `DateTime` dari Prisma akan jadi string di JavaScript
  // `articles` (relasi balik) tidak perlu disertakan di sini karena kita biasanya tidak mengambil semua artikel terkait user saat fetch user.
}

// Untuk relasi Author yang di-include di API publik (pages/api/public/articles/[id].ts),
// Anda hanya memilih properti id, name, email. Maka interface Author ini harus mencerminkan itu.
// Ini adalah sub-tipe dari User.
export interface Author {
  id: string; // Menggunakan string karena id dari NextAuth.Session.user.id biasanya string
  name: string | null;
  email: string | null;
}


export interface Article {
  id: number;        // Sesuai dengan `Int` di Prisma
  title: string;
  content: string;   // `String @db.Text` di Prisma tetap jadi string di TypeScript
  seriesSlug: string;
  order: number;
  image?: string | null; // `String?` di Prisma berarti bisa string atau null
  createdAt: string; // `DateTime` dari Prisma akan jadi string di JavaScript
  updatedAt: string; // `DateTime` dari Prisma akan jadi string di JavaScript

  // Relasi ke User
  authorId: number; // `Int` di Prisma

  // Ini adalah properti relasi yang di-include dari Prisma.
  // API Anda (pages/api/public/articles/[id].ts) memilih id, name, email dari author.
  // Jadi, tipe 'author' di sini haruslah interface 'Author' yang baru kita buat.
  // Properti ini dibuat opsional (?:) karena tidak selalu di-include saat fetch artikel
  // (misalnya di halaman daftar artikel, Anda mungkin tidak meng-include author)
  author?: Author;
}