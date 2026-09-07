import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Looksmen | Expense & Revenue Tracking System',
  description:
    'Comprehensive mobile-first business expense, revenue tracking, and financial analytics for Looksmen.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} dark h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
