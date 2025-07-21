// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/db";
import bcrypt from "bcryptjs"; // <<< TAMBAHKAN BARIS INI UNTUK MENGIMPOR BCRYPTJS

// Import tipe-tipe yang diperlukan dari NextAuth
import type { JWT } from "next-auth/jwt";
import type { Session, User as NextAuthUser, SessionStrategy } from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('\n--- Authorize Callback START ---');
        console.log('Authorize: Mencari pengguna dengan email:', credentials?.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user) {
          console.log('Authorize: Pengguna tidak ditemukan.');
          console.log('--- Authorize Callback END ---\n');
          return null; // Pengguna tidak ditemukan
        }

        console.log('Authorize: Pengguna ditemukan. Membandingkan password...');
        // --- PERBAIKAN PENTING DI SINI ---
        // Gunakan bcrypt.compare untuk membandingkan password plain text dengan hash yang tersimpan
        const isPasswordValid = await bcrypt.compare(
          credentials?.password || '', // Password plain text dari form
          user.password              // Password hashed dari database
        );

        if (isPasswordValid) {
          const authorizedUser = {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
          };
          console.log('Authorize: Password cocok. Login berhasil!');
          console.log('Authorize: User role dari database:', user.role);
          console.log('Authorize: Mengembalikan objek pengguna:', authorizedUser);
          console.log('--- Authorize Callback END ---\n');
          return authorizedUser; // Kembalikan objek user lengkap
        } else {
          console.log('Authorize: Password tidak cocok.');
          console.log('--- Authorize Callback END ---\n');
          return null; // Password tidak cocok
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | undefined }) {
      console.log('\n--- JWT Callback START ---');
      console.log('JWT: Initial token:', token);
      console.log('JWT: User object received:', user);
      console.log('JWT: User role received:', user?.role);

      if (user) {
        token.id = String(user.id);
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        console.log('JWT: Token after user data added (including role, name, email):', token);
      } else {
        console.log('JWT: No user object received, token not modified for user data.');
      }
      console.log('--- JWT Callback END ---\n');
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('\n--- Session Callback START ---');
      console.log('Session: Initial session:', session);
      console.log('Session: Token object received:', token);
      console.log('Session: Token role received:', token?.role);

      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email;
        console.log('Session: Session after adding token data (including role, name, email):', session);
      } else {
        console.log('Session: No token or session user, session not modified for role.');
      }
      console.log('--- Session Callback END ---\n');
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login',
  },
};

export default NextAuth(authOptions);
