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
    <ClerkProvider>
      <html lang="fr">
        {/* On force le bg-black et overflow-hidden pour un rendu propre */}
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black overflow-hidden m-0 p-0`}>
          {/* On a enlevé le <header> moche car on a déjà notre propre UserButton dans page.tsx */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}