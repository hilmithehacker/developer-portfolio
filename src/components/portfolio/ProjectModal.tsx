'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ProjectData } from './ProjectCard';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const { language } = useLanguage();
  if (!isOpen || !project) return null;

  const content = project.translations[language];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blueprint-base/90 backdrop-blur-md transition-all duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()} // cegah modal tertutup ketika mengklik area dalam modal
        className="glass-panel w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-fade-in"
      >
        {/* Header Modal */}
        <div className="bg-blueprint-panel px-6 py-4 border-b border-cyber-cyan/20 flex justify-between items-center">
          <span className="font-mono text-xs text-cyber-cyan uppercase bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-0.5 rounded">
            {content.badge}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer"
          >
            &times; {language === 'ID' ? 'TUTUP' : 'CLOSE'}
          </button>
        </div>
        
        {/* Isi Rincian Proyek (Scrollable) */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
          <h3 className="font-display font-bold text-2xl text-white">
            {content.title}
          </h3>

          {/* Info Metadata Proyek */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blueprint-base p-4 rounded-xl border border-white/5 font-mono text-xs">
            <div>
              <div className="text-slate-500 uppercase">{language === 'ID' ? 'KLIEN / INSTANSI' : 'CLIENT / AGENCY'}</div>
              <div className="text-white font-bold">{content.client}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">{language === 'ID' ? 'PERIODE' : 'PERIOD'}</div>
              <div className="text-white font-bold">{content.date}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">{language === 'ID' ? 'HASIL UTAMA' : 'PRIMARY OUTCOME'}</div>
              <div className="text-white font-bold">{content.outcome}</div>
            </div>
          </div>

          {/* Uraian 1: Latar Belakang */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-white/10 pb-1">
              {language === 'ID' ? 'Latar Belakang & Analisis Permasalahan' : 'Background & Problem Analysis'}
            </h4>
            <p className="text-slate-300 text-xs md:text-sm">
              {content.desc1}
            </p>
          </div>

          {/* Uraian 2: Solusi */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-white/10 pb-1">
              {language === 'ID' ? 'Solusi Tata Ruang & Rekomendasi Kebijakan' : 'Spatial Solution & Policy Recommendations'}
            </h4>
            <p className="text-slate-300 text-xs md:text-sm">
              {content.desc2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProjectModal;
