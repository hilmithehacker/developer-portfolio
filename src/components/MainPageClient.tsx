'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ProjectData, ProjectCard } from './portfolio/ProjectCard';
import { ProjectModal } from './portfolio/ProjectModal';
import { GisViewerContainer } from './gis/GisViewerContainer';
import { CitySandbox } from './gis/CitySandbox';

interface MainPageClientProps {
  projects: ProjectData[];
}

export const MainPageClient: React.FC<MainPageClientProps> = ({ projects }) => {
  const { language, t } = useLanguage();

  // State untuk kendali Modal Proyek
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State untuk filter kategori proyek
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // State untuk parameter Slider Kebijakan
  const [sliderGreen, setSliderGreen] = useState<number>(30);
  const [sliderTod, setSliderTod] = useState<number>(50);
  const [sliderInd, setSliderInd] = useState<number>(400);

  // Hasil kalkulasi evaluasi simulasi kebijakan
  const [policyRatings, setPolicyRatings] = useState({
    eco: 78,
    access: 65,
    ecoDesc: '',
    accessDesc: '',
  });

  // State untuk Formulir Kontak
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    location: '',
    message: '',
    captcha: '',
  });
  const [formNotif, setFormNotif] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null,
  });

  // State untuk Jam Telemetri Live
  const [timeStr, setTimeStr] = useState<string>('--:--:-- WIB');

  // Jalankan Jam Real-time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB (Waktu Indonesia Barat)
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      };
      setTimeStr(now.toLocaleTimeString('id-ID', options) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update metrik evaluasi kebijakan setiap kali slider digeser
  useEffect(() => {
    // Rumus matematis sederhana representasi daya dukung spasial
    const ecoRating = Math.round((sliderGreen * 1.2) + (sliderInd / 1500 * 30));
    const accessRating = Math.round((sliderTod * 0.8) + (sliderGreen * 0.3));

    let ecoDesc = '';
    let accessDesc = '';

    if (sliderGreen < 30) {
      ecoDesc = t.policy.outEcoDescLow;
    } else {
      ecoDesc = t.policy.outEcoDescOk;
    }

    if (sliderTod > 60) {
      accessDesc = t.policy.outAccessDescOk;
    } else {
      accessDesc = t.policy.outAccessDescLow;
    }

    setPolicyRatings({
      eco: ecoRating,
      access: accessRating,
      ecoDesc,
      accessDesc,
    });
  }, [sliderGreen, sliderTod, sliderInd, language]);

  // Handler membuka Modal Proyek
  const handleOpenProjectModal = (slug: string) => {
    const proj = projects.find((p) => p.slug === slug) || null;
    setSelectedProject(proj);
    setIsModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Handler Kirim Form Kontak (Terhubung ke API route Next.js)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormNotif({ text: '', type: null });

    // Validasi Captcha Sederhana di Sisi Klien (5 + 3 = 8)
    if (parseInt(formState.captcha) !== 8) {
      setFormNotif({
        text: t.contact.notifErrorCaptcha,
        type: 'error',
      });
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (response.ok) {
        // Mengganti placeholder teks sukses
        const successText = t.contact.notifSuccess
          .replace('{name}', formState.name)
          .replace('{location}', formState.location);

        setFormNotif({
          text: successText,
          type: 'success',
        });

        // Reset form
        setFormState({
          name: '',
          email: '',
          location: '',
          message: '',
          captcha: '',
        });
      } else {
        setFormNotif({
          text: data.error || 'Terjadi kesalahan sistem.',
          type: 'error',
        });
      }
    } catch {
      setFormNotif({
        text: 'Gagal terhubung ke server.',
        type: 'error',
      });
    }
  };

  // Filter daftar proyek berdasarkan kategori aktif
  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  // Kategori filter yang tersedia
  const filterCategories = [
    { key: 'All', label: t.portfolio.filterAll },
    { key: 'GIS & Spatial Analysis', label: 'GIS & Spatial Analysis' },
    { key: 'Masterplanning', label: 'Masterplanning' },
    { key: 'Sirkulasi & TOD', label: 'Sirkulasi & TOD' },
  ];

  return (
    <>
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 md:px-8 py-10 z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Kolom Informasi Teks Kiri */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-6">
            <div className="inline-flex items-center gap-2 bg-cyber-cyan/10 border border-cyber-cyan/30 px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-ping"></span>
              <span className="text-xs font-mono tracking-widest text-cyber-cyan uppercase">
                {t.hero.badge}
              </span>
            </div>
            
            <h1
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none"
              dangerouslySetInnerHTML={{ __html: t.hero.title }}
            />

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-lg">
              {t.hero.desc}
            </p>

            {/* HUD Widgets Statistik Makro */}
            <div className="grid grid-cols-3 gap-3 bg-blueprint-panel/60 border border-white/5 p-4 rounded-xl backdrop-blur-md">
              <div className="text-center border-r border-white/10 last:border-0">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">{t.hero.spaces}</div>
                <div className="font-display font-extrabold text-lg md:text-2xl text-cyber-cyan">{t.hero.spaces}</div>
                <div className="text-[9px] font-mono text-slate-400">{t.hero.spacesSub}</div>
              </div>
              <div className="text-center border-r border-white/10 last:border-0">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">{language === 'ID' ? 'Indeks Hijau' : 'Green Index'}</div>
                <div className="font-display font-extrabold text-lg md:text-2xl text-urban-green">{t.hero.greenIndex}</div>
                <div className="text-[9px] font-mono text-slate-400">{t.hero.greenIndexSub}</div>
              </div>
              <div className="text-center last:border-0">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">{language === 'ID' ? 'Skor TOD' : 'TOD Score'}</div>
                <div className="font-display font-extrabold text-lg md:text-2xl text-urban-yellow">{t.hero.transit}</div>
                <div className="text-[9px] font-mono text-slate-400">{t.hero.transitSub}</div>
              </div>
            </div>

            {/* Tombol Navigasi CTA */}
            <div className="flex flex-wrap gap-4 font-mono text-xs">
              <a
                href="#layer-map"
                className="bg-gradient-to-r from-cyber-cyan to-infrastructure-blue text-blueprint-base font-bold px-6 py-3 rounded hover:opacity-90 transition-opacity uppercase tracking-wider shadow-lg shadow-cyber-cyan/15 flex items-center gap-2 cursor-pointer"
              >
                <span>{t.hero.ctaGis}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.483V6.517a2 2 0 011.02-1.741L9 2l5 2.5V11m0 0l4-2.5V15m-4-4v10m4-12.5l5 2.5v9a2 2 0 01-1.02 1.741L18 20V12.5z" />
                </svg>
              </a>
              <a
                href="#portfolio"
                className="border border-white/20 hover:border-cyber-cyan hover:bg-cyber-cyan/10 text-white px-6 py-3 rounded transition-all uppercase tracking-wider cursor-pointer"
              >
                {t.hero.ctaProj}
              </a>
            </div>
          </div>

          {/* Kolom Visual Sandbox Kanan */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <CitySandbox />
          </div>

        </div>
      </section>

      {/* 2. PHILOSOPHY & POLICY SLIDERS SECTION */}
      <section id="about" className="py-20 px-4 md:px-8 border-t border-white/5 relative z-10 bg-blueprint-panel/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Slider Pengambil Kebijakan Spasial (Kiri) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-2xl relative">
                <div className="absolute top-4 right-4 text-[9px] font-mono text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-0.5 rounded">
                  {t.policy.badge}
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{t.policy.title}</h3>
                <p className="text-[11px] text-slate-400 mb-6 font-mono">{t.policy.desc}</p>
                
                <div className="flex flex-col gap-5">
                  {/* Slider 1: RTH */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-350">{t.policy.sliderGreen}</span>
                      <span className="text-urban-green font-bold">{sliderGreen}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={sliderGreen}
                      onChange={(e) => setSliderGreen(parseInt(e.target.value))}
                      className="w-full accent-urban-green bg-blueprint-border/30 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: TOD */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-350">{t.policy.sliderTod}</span>
                      <span className="text-cyber-cyan font-bold">{sliderTod}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={sliderTod}
                      onChange={(e) => setSliderTod(parseInt(e.target.value))}
                      className="w-full accent-cyber-cyan bg-blueprint-border/30 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Industrial buffer */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-350">{t.policy.sliderInd}</span>
                      <span className="text-urban-yellow font-bold">{sliderInd}m</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="50"
                      value={sliderInd}
                      onChange={(e) => setSliderInd(parseInt(e.target.value))}
                      className="w-full accent-urban-yellow bg-blueprint-border/30 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Indikator Metrik Output Hasil Simulasi Kebijakan */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div className="bg-blueprint-base/60 p-3.5 rounded border border-white/5 flex flex-col justify-center shadow-inner">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{t.policy.outEcoTitle}</span>
                    <span className={`font-display font-extrabold text-2xl ${sliderGreen < 30 ? 'text-urban-red' : 'text-urban-green'}`}>
                      {policyRatings.eco}%
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1">{policyRatings.ecoDesc}</p>
                  </div>
                  
                  <div className="bg-blueprint-base/60 p-3.5 rounded border border-white/5 flex flex-col justify-center shadow-inner">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{t.policy.outAccessTitle}</span>
                    <span className={`font-display font-extrabold text-2xl ${sliderTod > 60 ? 'text-cyber-cyan' : 'text-urban-yellow'}`}>
                      {policyRatings.access}%
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1">{policyRatings.accessDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Penjelasan Filosofi Spasial Hilmi (Kanan) */}
            <div className="lg:col-span-6 flex flex-col gap-6 justify-center">
              <span className="text-xs font-mono text-cyber-cyan tracking-widest uppercase">{t.philosophy.badge}</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white">{t.philosophy.title}</h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{t.philosophy.desc}</p>
              
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan flex items-center justify-center font-bold rounded">01</div>
                  <div>
                    <h4 className="font-bold text-white text-sm md:text-base">{t.philosophy.p1Title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{t.philosophy.p1Desc}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-urban-green/10 border border-urban-green/30 text-urban-green flex items-center justify-center font-bold rounded">02</div>
                  <div>
                    <h4 className="font-bold text-white text-sm md:text-base">{t.philosophy.p2Title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{t.philosophy.p2Desc}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. GIS MAP SIMULATOR */}
      <GisViewerContainer />

      {/* 4. SHOWCASE PORTOFOLIO SEKSI */}
      <section id="portfolio" className="py-20 px-4 md:px-8 border-t border-white/5 relative z-10 bg-blueprint-panel/10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Filter Showcase */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="flex flex-col gap-4 max-w-2xl">
              <span className="text-xs font-mono text-cyber-cyan tracking-widest uppercase">{t.portfolio.badge}</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white">{t.portfolio.title}</h2>
              <p className="text-slate-400 text-xs md:text-sm">{t.portfolio.desc}</p>
            </div>
            
            {/* Filter Tab Kategori */}
            <div className="flex flex-wrap gap-2 font-mono text-[10px] md:text-xs">
              {filterCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  className={`px-4 py-2 rounded transition-all cursor-pointer font-bold ${
                    activeFilter === cat.key
                      ? 'bg-cyber-cyan text-blueprint-base'
                      : 'border border-white/10 hover:border-cyber-cyan text-slate-400 hover:text-white bg-blueprint-panel/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Proyek */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                onOpenModal={handleOpenProjectModal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. KONTAK & PITCH ISU SPASIAL SECTION */}
      <section id="contact" className="py-20 px-4 md:px-8 border-t border-white/5 relative z-10 bg-blueprint-base">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Formulir Pengajuan Isu Wilayah (Kiri) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="text-xs font-mono text-cyber-cyan tracking-widest uppercase">{t.contact.badge}</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white">{t.contact.title}</h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{t.contact.desc}</p>

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">{t.contact.labelName}</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder={t.contact.placeholderName}
                      className="bg-blueprint-panel/60 border border-white/10 rounded px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyber-cyan transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">{t.contact.labelEmail}</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder={t.contact.placeholderEmail}
                      className="bg-blueprint-panel/60 border border-white/10 rounded px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyber-cyan transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">{t.contact.labelLocation}</label>
                  <input
                    type="text"
                    required
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    placeholder={t.contact.placeholderLocation}
                    className="bg-blueprint-panel/60 border border-white/10 rounded px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyber-cyan transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">{t.contact.labelMessage}</label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder={t.contact.placeholderMessage}
                    className="bg-blueprint-panel/60 border border-white/10 rounded px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-cyber-cyan transition-all"
                  />
                </div>

                {/* Math Captcha Verification */}
                <div className="flex items-center gap-3 bg-blueprint-panel/40 p-3 rounded border border-white/5 w-fit">
                  <span className="text-[11px] font-mono text-slate-400">{t.contact.labelCaptcha}</span>
                  <input
                    type="number"
                    required
                    value={formState.captcha}
                    onChange={(e) => setFormState({ ...formState, captcha: e.target.value })}
                    className="w-16 bg-blueprint-base border border-white/10 rounded px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-cyber-cyan"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-cyber-cyan hover:bg-cyber-cyan/90 text-blueprint-base font-display font-bold text-xs md:text-sm uppercase py-4 rounded transition-all shadow-lg tracking-wider cursor-pointer"
                >
                  {t.contact.buttonSubmit}
                </button>
              </form>

              {/* Box Notifikasi Inline Form */}
              {formNotif.type && (
                <div
                  className={`p-4 rounded-lg font-mono text-xs border ${
                    formNotif.type === 'success'
                      ? 'border-urban-green/45 bg-urban-green/10 text-urban-green'
                      : 'border-urban-red/45 bg-urban-red/10 text-urban-red'
                  }`}
                >
                  {formNotif.text}
                </div>
              )}
            </div>

            {/* Kartu Telemetri Informasi Kontak Kanan */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 relative">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-display font-bold text-xl text-white">{t.contact.hubTitle}</h3>
                  <p className="text-xs text-slate-400 font-mono">{t.contact.hubDesc}</p>
                </div>

                <div className="flex flex-col gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-cyber-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-white font-bold">{t.contact.hubOffice}</div>
                      <div>{t.contact.hubOfficeVal}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-cyber-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-white font-bold">{t.contact.hubEmail}</div>
                      <div className="hover:text-cyber-cyan transition-colors cursor-pointer">{t.contact.hubEmailVal}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-cyber-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-white font-bold">{t.contact.hubPartnership}</div>
                      <div>{t.contact.hubPartnershipVal}</div>
                    </div>
                  </div>
                </div>

                {/* Telemetri Status Sistem & Jam Live */}
                <div className="mt-4 p-4 bg-[#030712] border border-white/5 rounded-lg text-[10px] font-mono text-slate-500 flex flex-col gap-1.5 shadow-inner">
                  <div className="flex justify-between">
                    <span>{t.contact.statusSys}</span>
                    <span className="text-urban-green font-bold animate-pulse">{t.contact.statusVal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.contact.timeLabel}</span>
                    <span>{timeStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.contact.docAccessed}</span>
                    <span>1,412 files</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modal Detail Proyek */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseProjectModal}
        project={selectedProject}
      />
    </>
  );
};
export default MainPageClient;
