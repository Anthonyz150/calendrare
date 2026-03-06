import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs"; // 1. On importe le Provider
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calendrare",
  description: "Calendrare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider> {/* 2. On entoure toute l'app pour activer l'auth */}
      <html lang="fr">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-hidden`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}