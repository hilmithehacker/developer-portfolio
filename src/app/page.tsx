import React from 'react';
import fs from 'fs';
import path from 'path';
import { MainPageClient } from '../components/MainPageClient';
import { Header } from '../components/hud/Header';
import { Footer } from '../components/hud/Footer';
import { SpatialCursor } from '../components/hud/SpatialCursor';
import { LanguageProvider } from '../context/LanguageContext';
import { ProjectData } from '../components/portfolio/ProjectCard';

// Metadata Halaman
export const metadata = {
  title: "METROPOLIS — Portofolio Perencanaan Wilayah Kota & GIS",
  description: "Portofolio interaktif tata ruang kota, GIS, dan analisis spasial oleh Hilmi Abdurrahman. Menghadirkan simulator pertumbuhan kota perkotaan.",
};

export default function Home() {
  let projects: ProjectData[] = [];

  try {
    // Membaca database katalog proyek secara Server-Side
    const filePath = path.join(process.cwd(), 'src/content/projects/data.json');
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      projects = JSON.parse(fileContents);
    }
  } catch (error) {
    console.error("Gagal memuat katalog proyek:", error);
  }

  return (
    <LanguageProvider>
      {/* Kursor Spasial reticle HUD (desktop) */}
      <SpatialCursor />

      {/* Navigasi Header HUD */}
      <Header />

      {/* Grid Blueprint Dekoratif Latar Belakang */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none z-0"></div>
      <div className="absolute inset-0 blueprint-grid-sub pointer-events-none z-0"></div>

      {/* Wadah Utama Halaman */}
      <main className="flex-grow w-full relative z-10">
        <MainPageClient projects={projects} />
      </main>

      {/* Kaki Halaman HUD */}
      <Footer />
    </LanguageProvider>
  );
}
