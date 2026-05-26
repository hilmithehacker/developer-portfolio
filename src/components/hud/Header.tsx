'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Logo Inisial H dengan Animasi Hover */}
        <Link href="/">
          <div className="w-10 h-10 border-2 border-cyber-cyan flex items-center justify-center font-display font-extrabold text-xl text-cyber-cyan tracking-tighter cursor-pointer group">
            <span className="group-hover:rotate-90 transition-transform duration-300">H</span>
          </div>
        </Link>
        <div>
          <h1 className="font-display font-bold text-base md:text-lg tracking-wider text-white">
            HILMI ABDURRAHMAN
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-cyber-cyan">
            URBANIST / GIS ANALYST / DATA SCIENTIST
          </p>
        </div>
      </div>

      {/* Navigasi Menu HUD */}
      <nav className="hidden lg:flex items-center gap-6 font-mono text-xs">
        <a href="#hero" className="text-slate-300 hover:text-cyber-cyan transition-colors duration-200 py-1 border-b border-transparent hover:border-cyber-cyan">
          {t.nav.sim}
        </a>
        <a href="#about" className="text-slate-300 hover:text-cyber-cyan transition-colors duration-200 py-1 border-b border-transparent hover:border-cyber-cyan">
          {t.nav.philosophy}
        </a>
        <a href="#layer-map" className="text-slate-300 hover:text-cyber-cyan transition-colors duration-200 py-1 border-b border-transparent hover:border-cyber-cyan">
          {t.nav.gis}
        </a>
        <a href="#portfolio" className="text-slate-300 hover:text-cyber-cyan transition-colors duration-200 py-1 border-b border-transparent hover:border-cyber-cyan">
          {t.nav.portfolio}
        </a>
        <Link href="/blog" className="text-slate-300 hover:text-cyber-cyan transition-colors duration-200 py-1 border-b border-transparent hover:border-cyber-cyan">
          05. BLOG
        </Link>
        <a href="#contact" className="text-slate-300 hover:text-cyber-cyan transition-colors duration-200 py-1 border-b border-transparent hover:border-cyber-cyan">
          {t.nav.contact}
        </a>
      </nav>

      {/* Kontrol HUD Kanan */}
      <div className="flex items-center gap-3">
        {/* Toggle Bahasa */}
        <button
          onClick={toggleLanguage}
          id="lang-btn"
          className="border border-cyber-cyan/30 hover:border-cyber-cyan text-[10px] px-2.5 py-1 font-mono rounded bg-blueprint-panel/50 hover:bg-blueprint-panel transition-all text-cyber-cyan flex items-center gap-1 cursor-pointer"
        >
          {language === 'ID' ? (
            <>
              <span>EN</span> | <span className="text-slate-400 font-bold">ID</span>
            </>
          ) : (
            <>
              <span className="text-slate-400 font-bold">EN</span> | <span>ID</span>
            </>
          )}
        </button>

        {/* CTA Utama */}
        <a
          href="#contact"
          className="hidden sm:inline-block bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan font-mono text-xs px-4 py-2 rounded uppercase tracking-wider transition-all"
        >
          {t.nav.cta}
        </a>
      </div>
    </header>
  );
};
export default Header;
