// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string; // Tambahkan properti role di sini
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string; // Tambahkan properti role di sini
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string; // Tambahkan properti role di sini
  }
}