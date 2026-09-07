import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { findMockUserByEmail } from '@/lib/mockStore';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // Try checking database first
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && user.password) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              };
            }
          }
        } catch (dbErr) {
          console.warn('[NextAuth Credentials] DB check fallback to mock:', dbErr);
        }

        // Fallback check in mock storage
        const mockUser = findMockUserByEmail(email);
        if (mockUser && mockUser.password) {
          const isValid = await bcrypt.compare(password, mockUser.password);
          if (isValid) {
            return {
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              image: mockUser.image,
            };
          }
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'looksmen-secret-auth-key-change-in-prod',
});
