import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Med Scheduler',
  description: 'Agendamentos médicos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
