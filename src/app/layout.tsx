import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "METROPOLIS — Portofolio Perencanaan Wilayah Kota & GIS",
  description: "Portofolio interaktif tata ruang kota, GIS, dan analisis spasial oleh Hilmi Abdurrahman. Menghadirkan simulator pertumbuhan kota dan visualisasi peta terpadu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="bg-blueprint-base text-frost-white min-h-full flex flex-col custom-cursor-area relative overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
