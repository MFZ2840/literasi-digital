// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/admin/login', // Redirect ke halaman login jika tidak terotentikasi
  },
  callbacks: {
    authorized: ({ token }) => {
      // Hanya izinkan user dengan role 'admin' mengakses /admin
      // Pastikan Anda sudah menambahkan 'role' ke token di [...nextauth].ts
      return token?.role === 'admin';
    },
  },
});

export const config = {
  matcher: "/admin/:path*", // Proteksi semua rute di bawah /admin
};