import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';

export const metadata: Metadata = {
  title: 'RailEdge — Smart Train Ticket Booking',
  description: 'Book train tickets smarter with AI-powered seat suggestions, dynamic pricing insights, and instant PDF tickets.',
  keywords: 'train ticket booking, IRCTC alternative, AI seat suggestion, Indian railways',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
