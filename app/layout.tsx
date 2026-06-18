import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '../styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Welcome back — Sign in',
  description: 'A delightful, character-driven login experience with playful animated characters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
