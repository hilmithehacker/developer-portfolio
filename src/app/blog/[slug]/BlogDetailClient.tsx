'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';
import { BlogPost } from '../../../utils/markdown';

interface BlogDetailClientProps {
  post: BlogPost;
}

export const BlogDetailClient: React.FC<BlogDetailClientProps> = ({ post }) => {
  const { language } = useLanguage();

  return (
    <article className="flex flex-col gap-6">
      {/* Tautan navigasi breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-cyber-cyan">
        <Link href="/" className="hover:underline">
          {language === 'ID' ? 'BERANDA' : 'HOME'}
        </Link>
        <span className="text-slate-600">/</span>
        <Link href="/blog" className="hover:underline">
          BLOG
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 line-clamp-1">{post.title.toUpperCase()}</span>
      </div>

      {/* Header Artikel */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
          <span>{post.date}</span>
          <span>By {post.author}</span>
        </div>
        
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan px-2 py-0.5 rounded text-[9px] tracking-wide font-mono uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Isi Konten Artikel (Markdown Rendered HTML) */}
      <div 
        className="markdown-content text-slate-350"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
      />

      {/* Kaki Artikel / Navigasi Kembali */}
      <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center">
        <Link 
          href="/blog" 
          className="text-xs font-mono text-cyber-cyan hover:underline"
        >
          &larr; {language === 'ID' ? 'KEMBALI KE DAFTAR ARTIKEL' : 'BACK TO ARTICLES'}
        </Link>
      </div>
    </article>
  );
};
export default BlogDetailClient;
