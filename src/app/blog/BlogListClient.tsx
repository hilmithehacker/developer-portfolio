'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { BlogPost } from '../../utils/markdown';

interface BlogListClientProps {
  posts: BlogPost[];
}

export const BlogListClient: React.FC<BlogListClientProps> = ({ posts }) => {
  const { language, t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      {/* Tombol kembali ke Beranda */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-cyber-cyan">
        <Link href="/" className="hover:underline">
          &larr; {language === 'ID' ? 'KEMBALI KE BERANDA' : 'BACK TO PORTFOLIO'}
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400">BLOG</span>
      </div>

      {/* Judul Halaman */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-white">
          {language === 'ID' ? 'Tulisan & Pemikiran Spasial' : 'Writings & Spatial Insights'}
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
          {language === 'ID'
            ? 'Dokumentasi riset, opini, dan catatan teknis mengenai tata ruang kota, kartografi digital, dan implementasi machine learning.'
            : 'Documentation of research, opinion, and technical logs regarding urban planning, digital cartography, and machine learning.'}
        </p>
      </div>

      {/* Grid Daftar Artikel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {posts.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center font-mono text-xs text-slate-500 col-span-2">
            {language === 'ID' ? 'Belum ada artikel yang diterbitkan.' : 'No articles published yet.'}
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.slug}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:glass-panel-active transition-all duration-300 group"
            >
              <div className="flex flex-col gap-3">
                {/* Tanggal & Tag */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>{post.date}</span>
                  <div className="flex gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan px-1.5 py-0.5 rounded text-[8px] tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Judul Artikel */}
                <h3 className="font-display font-bold text-lg text-white group-hover:text-cyber-cyan transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                {/* Potongan Artikel */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              {/* Tautan Baca Selengkapnya */}
              <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">By {post.author}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-cyber-cyan hover:underline font-bold"
                >
                  {language === 'ID' ? 'Baca Selengkapnya' : 'Read Article'} &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default BlogListClient;
