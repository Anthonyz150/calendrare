import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Calendrare',
  description: 'Calendrare',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
// app/layout.tsx
<ClerkProvider publishableKey="pk_test_bmV3LXNocmV3LTIyLmNsZXJrLmFjY291bnRzLmRldiQ">
  <html lang="fr">
    <body>{children}</body>
  </html>
</ClerkProvider>
  )
}