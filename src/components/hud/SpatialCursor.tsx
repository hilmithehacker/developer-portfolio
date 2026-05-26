'use client';

import React, { useState, useEffect } from 'react';

export const SpatialCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [coords, setCoords] = useState({ lat: '-6.1500', lng: '106.8000' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hanya aktif di perangkat desktop non-sentuh
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Hitung koordinat palsu berdasarkan posisi layar agar terasa interaktif/fungsional
      const widthPct = e.clientX / window.innerWidth;
      const heightPct = e.clientY / window.innerHeight;

      // Koordinat simulasi sekitar wilayah Jawa/Yogyakarta
      const simulatedLat = (-7.7972 - heightPct * 0.15).toFixed(4);
      const simulatedLng = (110.3688 + widthPct * 0.25).toFixed(4);

      setCoords({
        lat: `${simulatedLat}° S`,
        lng: `${simulatedLng}° E`,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-16px, -16px)', // Pusat crosshair tepat di kursor
      }}
      className="fixed pointer-events-none z-50 mix-blend-difference flex flex-col gap-1 text-[10px] font-mono text-cyber-cyan select-none"
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Garis Bidik (Reticle Crosshair) */}
        <div className="absolute w-full h-[1px] bg-cyber-cyan/60"></div>
        <div className="absolute h-full w-[1px] bg-cyber-cyan/60"></div>
        <div className="absolute w-3 h-3 border border-cyber-cyan rounded-full animate-ping"></div>
        <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full"></div>
      </div>
      
      {/* Tampilan Koordinat HUD Floating */}
      <div className="bg-blueprint-panel/90 border border-cyber-cyan/30 p-1.5 rounded-md -mt-2 ml-4 shadow-lg backdrop-blur-sm">
        <div>LAT: {coords.lat}</div>
        <div>LNG: {coords.lng}</div>
        <div>UTM ZONE: 49S</div>
      </div>
    </div>
  );
};
export default SpatialCursor;
