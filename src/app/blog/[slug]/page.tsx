import React from 'react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts } from '../../../utils/markdown';
import { Header } from '../../../components/hud/Header';
import { Footer } from '../../../components/hud/Footer';
import { SpatialCursor } from '../../../components/hud/SpatialCursor';
import { LanguageProvider } from '../../../context/LanguageContext';
import { BlogDetailClient } from './BlogDetailClient';

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} — Hilmi Abdurrahman`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <LanguageProvider>
      <SpatialCursor />
      <Header />

      {/* Background blueprint grid */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none z-0"></div>
      <div className="absolute inset-0 blueprint-grid-sub pointer-events-none z-0"></div>

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 md:px-8 py-12 relative z-10">
        <BlogDetailClient post={post} />
      </main>

      <Footer />
    </LanguageProvider>
  );
}
