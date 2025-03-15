import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/actions/db/db";
import bcrypt from 'bcryptjs';

export const { auth, handlers, signIn } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error("User not found.");
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            throw new Error("Invalid password.");
          }

          return {
            id: user.id.toString(),
            email: user.email
          };
        } catch (error) {
          console.error("Login Error:", error.message);
          throw new Error(error.message || "Login failed.");
        }
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 3 * 60 * 60 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login" 
  }
});
