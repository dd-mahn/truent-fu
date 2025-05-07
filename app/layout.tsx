import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

// Define NVN Motherland Signature font
const nvnMotherland = localFont({
  src: '../public/fonts/NVN-Motherland-Signature-1.ttf',
  variable: '--font-nvn-motherland',
  display: 'swap',
});

// Define VNF-Comic-Sans font
const vnfComicSans = localFont({
  src: '../public/fonts/VNF-Comic-Sans.ttf',
  variable: '--font-vnf-comic-sans',
  display: 'swap',
});

// Define Times New Roman (using a generic system font stack is often better for cross-platform compatibility)
// For simplicity, we will apply Times New Roman directly in globals.css or components.
// If you specifically need a next/font instance for Times New Roman, it would be via google fonts if available or another local font file.

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Một Thời Kỷ Niệm",
  description: "Lưu giữ những kỷ niệm học sinh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${nvnMotherland.variable} ${vnfComicSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <main className="content-wrapper flex h-screen w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
