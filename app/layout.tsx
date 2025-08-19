import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Wyzly App',
  description: 'Next.js app with Tailwind CSS, Supabase, and MongoDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}