import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Define NVN Motherland Signature font
const nvnMotherland = localFont({
  src: "../public/fonts/NVN-Motherland-Signature-1.ttf",
  variable: "--font-nvn-motherland",
  display: "swap",
});

// Define VNF-Comic-Sans font
const vnfComicSans = localFont({
  src: "../public/fonts/VNF-Comic-Sans.ttf",
  variable: "--font-vnf-comic-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Một Thời",
  description: "Truant Fu & Một Thời",
  icons: {
    icon: "/favicon.ico",
  },
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
        <main className="content-wrapper flex h-screen md:items-center md:justify-center w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
