import React from 'react';
import Link from 'next/link';
import { getAllBlogPosts } from '../../utils/markdown';
import { Header } from '../../components/hud/Header';
import { Footer } from '../../components/hud/Footer';
import { SpatialCursor } from '../../components/hud/SpatialCursor';
import { LanguageProvider } from '../../context/LanguageContext';
import { BlogListClient } from './BlogListClient';

export const metadata = {
  title: "Blog & Pemikiran Spasial — Hilmi Abdurrahman",
  description: "Kumpulan tulisan ilmiah, opini, dan catatan lapangan seputar GIS dan perencanaan kota.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <LanguageProvider>
      <SpatialCursor />
      <Header />
      
      {/* Background blueprint grid */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none z-0"></div>
      <div className="absolute inset-0 blueprint-grid-sub pointer-events-none z-0"></div>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 md:px-8 py-12 relative z-10">
        <BlogListClient posts={posts} />
      </main>

      <Footer />
    </LanguageProvider>
  );
}
