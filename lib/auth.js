import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/actions/db/db";
import bcrypt from 'bcryptjs';

export const { auth, handlers, signIn } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { 
          label: "Email",
          type: "email" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        console.log(credentials.email);
        console.log(credentials.password);
        
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          console.log(user);
          
          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email
          };
        } catch (error) {
          console.error("Error:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 3 * 60 * 60, // 3 hours
  },
  callbacks: {
    async jwt({ token, user }) {  // Changed from loggedUser to user
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {  // Changed from loggedUser to user
        session.user.id = token.id;
      }
      return session;
    }
  }
});