'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export interface ProjectData {
  slug: string;
  category: string;
  themeColor: string;
  svgType: string;
  year: string;
  translations: {
    ID: {
      badge: string;
      title: string;
      sub: string;
      desc: string;
      client: string;
      date: string;
      outcome: string;
      desc1: string;
      desc2: string;
    };
    EN: {
      badge: string;
      title: string;
      sub: string;
      desc: string;
      client: string;
      date: string;
      outcome: string;
      desc1: string;
      desc2: string;
    };
  };
}

interface ProjectCardProps {
  project: ProjectData;
  onOpenModal: (slug: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenModal }) => {
  const { language, t } = useLanguage();
  const content = project.translations[language];

  // Fungsi merender visualisasi skematik SVG khas GIS untuk setiap tipe proyek
  const renderSvgVisual = () => {
    switch (project.svgType) {
      case 'masterplanning':
        return (
          <svg className="w-full h-full text-cyber-cyan group-hover:scale-105 transition-transform duration-500" viewBox="0 0 300 170" fill="none">
            <rect width="300" height="170" fill="#0A1329"/>
            <circle cx="150" cy="85" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4"/>
            <polygon points="100,50 200,50 150,130" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.6"/>
            <path d="M 20 85 Q 150 200 280 85" stroke="#f59e0b" strokeWidth="2"/>
            <circle cx="150" cy="140" r="6" fill="#ef4444" className="animate-pulse"/>
          </svg>
        );
      case 'gis':
        return (
          <svg className="w-full h-full text-urban-green group-hover:scale-105 transition-transform duration-500" viewBox="0 0 300 170" fill="none">
            <rect width="300" height="170" fill="#0A1329"/>
            <path d="M10,85 C100,10 200,160 290,85" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10,105 C100,30 200,180 290,105" stroke="currentColor" strokeWidth="1"/>
            <rect x="130" y="65" width="40" height="40" stroke="#06B6D4" strokeWidth="1" transform="rotate(45 150 85)"/>
            <circle cx="150" cy="85" r="3" fill="#06B6D4"/>
          </svg>
        );
      case 'transportation':
      default:
        return (
          <svg className="w-full h-full text-urban-yellow group-hover:scale-105 transition-transform duration-500" viewBox="0 0 300 170" fill="none">
            <rect width="300" height="170" fill="#0A1329"/>
            <circle cx="150" cy="85" r="40" stroke="currentColor" strokeWidth="1"/>
            <line x1="50" y1="85" x2="250" y2="85" stroke="#a78bfa" strokeWidth="2"/>
            <line x1="150" y1="10" x2="150" y2="160" stroke="#a78bfa" strokeWidth="2"/>
            <rect x="70" y="45" width="20" height="20" fill="#fb923c" fillOpacity="0.3"/>
            <rect x="210" y="105" width="20" height="20" fill="#fb923c" fillOpacity="0.3"/>
          </svg>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group hover:glass-panel-active transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Visual Header Kartu */}
      <div className="relative overflow-hidden aspect-video bg-blueprint-panel/85 flex items-center justify-center p-4">
        {renderSvgVisual()}
        <div className="absolute top-3 left-3 bg-blueprint-base/80 border border-cyber-cyan/30 text-cyber-cyan text-[9px] font-mono px-2 py-0.5 rounded uppercase">
          {content.badge}
        </div>
      </div>

      {/* Konten & Informasi Deskriptif */}
      <div className="p-6 flex flex-col gap-3">
        <div className={`text-[10px] font-mono ${project.themeColor}`}>
          {content.sub}
        </div>
        <h3 className="font-display font-bold text-lg text-white group-hover:text-cyber-cyan transition-colors line-clamp-2">
          {content.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {content.desc}
        </p>
        
        {/* Tombol Aksi Detail */}
        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>{t.portfolio.statusGov}</span>
          <button
            type="button"
            onClick={() => onOpenModal(project.slug)}
            className={`hover:underline flex items-center gap-1 cursor-pointer font-bold ${project.themeColor}`}
          >
            {t.portfolio.explore} &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};
export default ProjectCard;
