'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../context/LanguageContext';

const CitySandbox = dynamic(() => import('./CitySandbox').then((mod) => mod.CitySandbox), { ssr: false });
const RealGisMap = dynamic(() => import('./RealGisMap').then((mod) => mod.RealGisMap), { ssr: false });
const ZoningProgrammer = dynamic(() => import('./ZoningProgrammer').then((mod) => mod.ZoningProgrammer), { ssr: false });

export const GisViewerContainer: React.FC = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'sandbox' | 'map' | 'zoning'>('sandbox');

  // State untuk status centang layer GIS
  const [showZoning, setShowZoning] = useState<boolean>(true);
  const [showTransit, setShowTransit] = useState<boolean>(true);
  const [showHazard, setShowHazard] = useState<boolean>(true);

  // State koordinat dinamis untuk Peta Geografis
  const [mapCoords, setMapCoords] = useState<{ lng: number; lat: number }>({
    lng: 110.3688,
    lat: -7.7972,
  });

  const formatCoord = (lng: number, lat: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `COORD: ${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  // Kalkulasi pesan insight dinamis berdasarkan kombinasi layer aktif
  const getGisInsights = () => {
    let activeCount = 0;
    if (showZoning) activeCount++;
    if (showTransit) activeCount++;
    if (showHazard) activeCount++;

    if (activeCount === 3) {
      return t.gis.insightAll;
    } else if (showZoning && showTransit) {
      return t.gis.insightZoningTransit;
    } else if (showZoning && showHazard) {
      return t.gis.insightZoningHazard;
    } else {
      return t.gis.insightDefault;
    }
  };

  return (
    <div id="layer-map" className="py-20 px-4 md:px-8 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Judul Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-4">
          <span className="text-xs font-mono text-cyber-cyan tracking-widest uppercase">{t.gis.badge}</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">{t.gis.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{t.gis.desc}</p>
          
          {/* Tombol Pemilih Mode Viewport */}
          <div className="flex border border-cyber-cyan/30 rounded-lg overflow-hidden w-fit mx-auto mt-2 font-mono text-xs">
            <button
              onClick={() => setViewMode('sandbox')}
              className={`px-4 py-2 cursor-pointer font-bold transition-all ${
                viewMode === 'sandbox' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel/60 text-cyber-cyan hover:bg-cyber-cyan/10'
              }`}
            >
              {t.gis.modeSandbox}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 cursor-pointer font-bold transition-all ${
                viewMode === 'map' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel/60 text-cyber-cyan hover:bg-cyber-cyan/10'
              }`}
            >
              {t.gis.modeRealMap}
            </button>
            <button
              onClick={() => setViewMode('zoning')}
              className={`px-4 py-2 cursor-pointer font-bold transition-all ${
                viewMode === 'zoning' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel/60 text-cyber-cyan hover:bg-cyber-cyan/10'
              }`}
            >
              ZONING ANALYSIS
            </button>
          </div>
        </div>

        {/* Layout Grid Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* SISI KIRI: Viewport Peta Aktif */}
          <div className={`${viewMode === 'zoning' ? 'lg:col-span-12' : 'lg:col-span-8'} bg-blueprint-panel/60 border border-cyber-cyan/20 rounded-2xl overflow-hidden shadow-xl p-4 flex flex-col gap-4 transition-all duration-500`}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-urban-green rounded-full"></div>
                <span className="font-mono text-xs text-white uppercase">
                  {viewMode === 'sandbox' 
                    ? 'ANALYSIS VIEWPORT: ARKOPOLIS SCHEMATIC BASIN'
                    : viewMode === 'map' 
                    ? 'ANALYSIS VIEWPORT: GEOGRAPHIC MAP COMPUTE'
                    : 'ANALYSIS VIEWPORT: 3D ZONING & SPATIAL PROGRAM'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {viewMode === 'sandbox' ? 'GRID FOCUS: CENTRAL BASIN' : viewMode === 'zoning' ? 'MODE: 3D HOLOGRAM' : formatCoord(mapCoords.lng, mapCoords.lat)}
              </div>
            </div>

            {/* Kontainer Peta Dinamis */}
            <div className="w-full flex-grow min-h-[380px] flex items-center justify-center">
              {viewMode === 'sandbox' ? (
                <CitySandbox />
              ) : viewMode === 'zoning' ? (
                <ZoningProgrammer />
              ) : (
                <RealGisMap
                  showZoning={showZoning}
                  showTransit={showTransit}
                  showHazard={showHazard}
                  onMoveMap={(lng, lat) => setMapCoords({ lng, lat })}
                  toggleZoning={() => setShowZoning(p => !p)}
                  toggleTransit={() => setShowTransit(p => !p)}
                  toggleHazard={() => setShowHazard(p => !p)}
                />
              )}
            </div>
          </div>

          {/* SISI KANAN: Pengendali Layer Spasial & Insight */}
          {viewMode !== 'zoning' && (
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between animate-in fade-in duration-500">
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 h-full">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-display font-bold text-lg text-white">{t.gis.panelTitle}</h3>
                <p className="text-xs text-slate-400 font-mono">{t.gis.panelDesc}</p>
              </div>

              {/* Checkbox Kendali Layer */}
              <div className="flex flex-col gap-3">
                
                {/* Layer 1: Zoning */}
                <label className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-blueprint-panel/40 cursor-pointer select-none hover:border-cyber-cyan/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{t.gis.layerZoning}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{t.gis.layerZoningSub}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showZoning}
                    onChange={(e) => setShowZoning(e.target.checked)}
                    className="w-4 h-4 accent-cyber-cyan cursor-pointer"
                  />
                </label>

                {/* Layer 2: Transit */}
                <label className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-blueprint-panel/40 cursor-pointer select-none hover:border-cyber-cyan/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{t.gis.layerTransit}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{t.gis.layerTransitSub}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTransit}
                    onChange={(e) => setShowTransit(e.target.checked)}
                    className="w-4 h-4 accent-cyber-cyan cursor-pointer"
                  />
                </label>

                {/* Layer 3: Hazard */}
                <label className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-blueprint-panel/40 cursor-pointer select-none hover:border-cyber-cyan/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{t.gis.layerHazard}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{t.gis.layerHazardSub}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showHazard}
                    onChange={(e) => setShowHazard(e.target.checked)}
                    className="w-4 h-4 accent-cyber-cyan cursor-pointer"
                  />
                </label>

              </div>

              {/* Kotak Insight Spasial Otomatis */}
              <div className="bg-[#030712] p-4 border border-cyber-cyan/20 rounded-lg text-xs font-mono text-slate-300 flex flex-col gap-2 mt-auto shadow-inner">
                <span className="text-cyber-cyan font-bold">ANALYSIS INSIGHTS:</span>
                <p dangerouslySetInnerHTML={{ __html: getGisInsights() }} />
              </div>
            </div>
          </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default GisViewerContainer;
