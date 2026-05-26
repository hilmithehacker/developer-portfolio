'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Paintbrush, Download, Eye, Plus, Minus } from 'lucide-react';

interface CellData {
  type: number;   // 0: Kosong, 1: Hunian, 2: Bisnis, 3: Industri, 4: RTH, 5: Jalan
  height: number; // 0 s.d 3 (tingkat ketinggian gedung)
}

export const CitySandbox: React.FC = () => {
  const { language, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Kamera 3D Dinamis: Sudut Rotasi (theta) & Pitch Kemiringan (pitch)
  const [theta, setTheta] = useState<number>(Math.PI / 4); // Default 45 derajat (isometrik)
  const [pitch, setPitch] = useState<number>(30 * Math.PI / 180); // Default 30 derajat
  const [zoom, setZoom] = useState<number>(1.0); // Skala pembesaran zoom kamera
  const [is2D, setIs2D] = useState<boolean>(false); // Toggle Tampilan 2D Tampak Atas
  
  // Ukuran Grid Kustom (10x10, 20x20, 30x30, 50x50)
  const [gridSize, setGridSize] = useState<number>(20);

  // Koordinat Fokus Kamera di Grid Space (untuk 3D Panning)
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Status Interaksi
  const [selectedZone, setSelectedZone] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawMode, setDrawMode] = useState<'draw' | 'orbit' | 'pan' | 'none'>('none');
  const [lastDrawnCell, setLastDrawnCell] = useState<{ r: number; c: number } | null>(null);

  // Simpan posisi awal seretan (drag)
  const [dragStart, setDragStart] = useState<{
    clientX: number;
    clientY: number;
    theta: number;
    pitch: number;
    panX: number;
    panY: number;
  } | null>(null);

  // Pinch zoom pada layar sentuh
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = useState<number>(1.0);

  // Grid Data
  const [grid, setGrid] = useState<CellData[][]>(() => createDefaultGrid(20));

  // Refs untuk menyimpan nilai state terbaru untuk roda wheel
  const zoomRef = useRef(zoom);
  const panXRef = useRef(panX);
  const panYRef = useRef(panY);
  const thetaRef = useRef(theta);
  const pitchRef = useRef(pitch);
  const is2DRef = useRef(is2D);

  // Target values untuk LERP/Inersia
  const targetZoomRef = useRef(zoom);
  const targetPanXRef = useRef(panX);
  const targetPanYRef = useRef(panY);
  const targetThetaRef = useRef(theta);
  const targetPitchRef = useRef(pitch);

  // Current animated values (yang sebenarnya dipakai untuk drawCity)
  const curZoomRef = useRef(zoom);
  const curPanXRef = useRef(panX);
  const curPanYRef = useRef(panY);
  const curThetaRef = useRef(theta);
  const curPitchRef = useRef(pitch);

  // Menyimpan posisi 3D sebelumnya saat berpindah ke 2D
  const prev3DThetaRef = useRef<number>(Math.PI / 4);
  const prev3DPitchRef = useRef<number>(30 * Math.PI / 180);

  const animFrameIdRef = useRef<number | null>(null);

  // Metrik telemetri kota
  const [stats, setStats] = useState({
    rthPercent: 15,
    transScore: 42,
    sustainScore: 60,
  });

  // Pemetaan warna dasar zona
  const zoneColors: Record<number, string> = {
    0: '#0c1020', // Kosong
    1: '#3b82f6', // Hunian (Biru)
    2: '#06b6d4', // Komersial (Cyan)
    3: '#f59e0b', // Industri (Amber)
    4: '#10b981', // RTH (Hijau)
    5: '#4b5563', // Jalan (Abu-abu)
  };

  const heightScale = 22; // Tinggi per level gedung dalam pixel

  // 1. Fungsi Pembantu Pembuat Grid Default
  function createDefaultGrid(size: number): CellData[][] {
    const newGrid: CellData[][] = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({ type: 0, height: 0 }))
    );

    const mid = Math.floor(size / 2);
    // Jalan raya memotong di tengah secara default
    for (let c = 0; c < size; c++) {
      newGrid[mid][c] = { type: 5, height: 0 };
    }
    for (let r = 0; r < size; r++) {
      newGrid[r][mid] = { type: 5, height: 0 };
    }

    // Default aset spasial awal
    if (size >= 10) {
      newGrid[Math.max(0, mid - 2)][Math.max(0, mid - 2)] = { type: 4, height: 0 };
      newGrid[Math.max(0, mid - 2)][Math.min(size - 1, mid + 2)] = { type: 1, height: 2 };
      newGrid[Math.min(size - 1, mid + 2)][Math.max(0, mid - 2)] = { type: 2, height: 3 };
      newGrid[Math.min(size - 1, mid + 2)][Math.min(size - 1, mid + 2)] = { type: 3, height: 1 };
    }

    return newGrid;
  }

  // Trigger pembuatan ulang grid jika ukuran grid diubah
  useEffect(() => {
    setGrid(createDefaultGrid(gridSize));
    // Reset pan ke tengah
    setPanX(0);
    setPanY(0);
  }, [gridSize, is2D]);

  // Gambar ulang kanvas setiap kali ada perubahan data/perspektif kamera
  useEffect(() => {
    drawCity();
  }, [grid, panX, panY, theta, pitch, zoom, is2D]);

  // Penyesuaian ukuran kanvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentNode) return;
    const rect = (canvas.parentNode as HTMLElement).getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height || 380;
    drawCity();
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [grid, is2D]);

  // 2. Hubungkan Mouse Wheel Zoom dengan Event Listener Non-Passive (Zoom-to-Mouse)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const oldZoom = zoomRef.current;
      const newZoom = Math.min(4.0, Math.max(0.3, oldZoom * zoomFactor));

      // Perbarui ref zoom secara instan demi kelancaran scroll cepat
      zoomRef.current = newZoom;
      setZoom(newZoom);

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const factor = (1 / oldZoom) - (1 / newZoom);

      if (is2DRef.current) {
        const X_screen = mouseX - canvas.width / 2;
        const Y_screen = mouseY - canvas.height / 2;
        const dX = X_screen * factor;
        const dY = Y_screen * factor;

        const newPanX = panXRef.current + dX;
        const newPanY = panYRef.current + dY;

        panXRef.current = newPanX;
        panYRef.current = newPanY;
        setPanX(newPanX);
        setPanY(newPanY);
      } else {
        const X_screen = mouseX - canvas.width / 2;
        const Y_screen = mouseY - canvas.height / 2;
        const dX = X_screen * factor;
        const dY = (Y_screen / Math.max(0.1, Math.sin(pitchRef.current))) * factor;

        // Koreksi tanda rotasi agar zoom memusat tepat di ujung kursor
        const deltaPanX = dX * Math.cos(thetaRef.current) + dY * Math.sin(thetaRef.current);
        const deltaPanY = -dX * Math.sin(thetaRef.current) + dY * Math.cos(thetaRef.current);

        const newPanX = panXRef.current + deltaPanX;
        const newPanY = panYRef.current + deltaPanY;

        panXRef.current = newPanX;
        panYRef.current = newPanY;
        setPanX(newPanX);
        setPanY(newPanY);
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Pembantu shading warna 3D (mengubah intensitas cahaya sisi kiri & kanan)
  const adjustColorBrightness = (hex: string, percent: number) => {
    let num = parseInt(hex.replace("#", ""), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;

    const clamp = (val: number) => Math.min(255, Math.max(0, val));
    R = clamp(R);
    G = clamp(G);
    B = clamp(B);

    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  };

  // 3. Render Detail Fasad Dinding Samping Gedung (Windows/Facades)
  const drawFaceFacade = (
    ctx: CanvasRenderingContext2D,
    bl: { x: number; y: number },
    br: { x: number; y: number },
    tr: { x: number; y: number },
    tl: { x: number; y: number },
    type: number,
    heightVal: number
  ) => {
    if (heightVal === 0) return;

    // Sembunyikan fasad secara halus saat bangunan roboh (pitch mendekati 90 derajat)
    const facadeOpacity = Math.max(0, 1 - (curPitchRef.current - 1.25) / (Math.PI / 2 - 1.25));
    if (facadeOpacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = facadeOpacity;

    const activeZoom = curZoomRef.current;

    // A. Zona Industri (Type 3): Facade plat logam vertikal bergaris
    if (type === 3) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1.2 * activeZoom;
      for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        const bX = bl.x + t * (br.x - bl.x);
        const bY = bl.y + t * (br.y - bl.y);
        const tX = tl.x + t * (tr.x - tl.x);
        const tY = tl.y + t * (tr.y - tl.y);
        
        ctx.beginPath();
        ctx.moveTo(bX, bY);
        ctx.lineTo(tX, tY);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // B. Hunian (Type 1) & Bisnis (Type 2): Barisan Jendela
    const cols = 3;
    const floors = heightVal * 2; // Makin tinggi, makin banyak baris jendela
    
    // Hunian: Lampu kuning hangat, Bisnis: Kaca cyan perkantoran
    const winColor = type === 1 ? 'rgba(253, 224, 71, 0.85)' : 'rgba(103, 232, 249, 0.85)';

    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        // Simulasi sebagian lampu mati secara acak agar realistis
        const hash = (f * 7 + c * 13) % 10;
        if (hash > 7) continue;

        // Faktor interpolasi posisi jendela di dalam poligon dinding
        const t_c = (c + 0.25) / cols;
        const t_f = (f + 0.25) / floors;

        // Titik bawah di kolom jendela ini
        const bX = bl.x + t_c * (br.x - bl.x);
        const bY = bl.y + t_c * (br.y - bl.y);

        // Titik atas di kolom jendela ini
        const tX = tl.x + t_c * (tr.x - tl.x);
        const tY = tl.y + t_c * (tr.y - tl.y);

        // Koordinat tengah jendela
        const winCenterX = bX + t_f * (tX - bX);
        const winCenterY = bY + t_f * (tY - bY);

        // Dimensi jendela yang mengikuti skew perspektif dan zoom
        const winW = ((br.x - bl.x) / (cols * 4.2));
        const winH = ((tl.y - bl.y) / (floors * 3.2)); // nilai negatif (arah atas)

        ctx.fillStyle = winColor;
        ctx.beginPath();
        ctx.moveTo(winCenterX - winW, winCenterY - winH);
        ctx.lineTo(winCenterX + winW, winCenterY - winH);
        ctx.lineTo(winCenterX + winW, winCenterY + winH);
        ctx.lineTo(winCenterX - winW, winCenterY + winH);
        ctx.closePath();
        ctx.fill();

        // Pantulan cahaya putih mikro
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(winCenterX - winW / 2, winCenterY - winH / 2, winW, winH);
      }
    }
    ctx.restore();
  };

  // 4. Pembantu Renderer Flat Tile, Jalan, dan RTH 3D
  const drawFlatTile = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number },
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();

    // Outlines blueprint
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  };

  const drawTree = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number },
    pitchVal: number
  ) => {
    drawFlatTile(ctx, p1, p2, p3, p4, '#10b981'); // Dasar rumput hijau

    // Fade out pohon secara halus saat transisi ke tampak atas 2D (pitchVal mendekati 90 derajat)
    const treeOpacity = Math.max(0, 1 - (pitchVal - 1.25) / (Math.PI / 2 - 1.25));
    if (treeOpacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = treeOpacity;

    const cx = (p1.x + p2.x + p3.x + p4.x) / 4;
    const cy = (p1.y + p2.y + p3.y + p4.y) / 4;
    const activeZoom = curZoomRef.current;

    // Batang pohon (mengikuti kemiringan pitch dan zoom)
    const trunkH = 10 * Math.cos(pitchVal) * activeZoom;
    const trunkW = 2.5 * activeZoom;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - trunkW / 2, cy - trunkH, trunkW, trunkH);

    // Daun pohon (lingkaran 3D berlapis dengan skala zoom)
    const canopyY = cy - trunkH;
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(cx, canopyY - 3 * activeZoom, 5 * activeZoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx - 1.5 * activeZoom, canopyY - 4.5 * activeZoom, 3 * activeZoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawRoad = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ) => {
    drawFlatTile(ctx, p1, p2, p3, p4, '#2d3748'); // Aspal abu-abu gelap

    // Garis kuning putus-putus pembatas lajur jalan
    const midBackX = (p1.x + p2.x) / 2;
    const midBackY = (p1.y + p2.y) / 2;
    const midFrontX = (p3.x + p4.x) / 2;
    const midFrontY = (p3.y + p4.y) / 2;

    const activeZoom = curZoomRef.current;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2 * activeZoom;
    ctx.setLineDash([4 * activeZoom, 4 * activeZoom]);
    ctx.beginPath();
    ctx.moveTo(midBackX, midBackY);
    ctx.lineTo(midFrontX, midFrontY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
  };

  // 5. RENDERING UTAMA 3D / 2D
  const drawCity = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Kita gunakan drawCity3D untuk semua render saat transisi sedang berjalan (kemiringan pitch < 89.5 derajat)
    const currentPitchAngle = curPitchRef.current * 180 / Math.PI;
    if (is2D && currentPitchAngle > 89.5) {
      drawCity2D(ctx, canvas.width, canvas.height);
    } else {
      drawCity3D(ctx, canvas.width, canvas.height);
    }
  };

  // Renderer 2D Tampak Atas (GIS Schematic Style)
  const drawCity2D = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const activeZoom = curZoomRef.current;
    const activePanX = curPanXRef.current;
    const activePanY = curPanYRef.current;

    const cellSize = (Math.min(width, height) / (gridSize * 1.15)) * activeZoom;
    // Posisi awal grid ditambatkan ke tengah layar dan dipan secara linear
    const startX = width / 2 - (gridSize * cellSize) / 2 - activePanX * activeZoom;
    const startY = height / 2 - (gridSize * cellSize) / 2 - activePanY * activeZoom;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r]?.[c] || { type: 0, height: 0 };
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        // Render warna ubin zonasi
        ctx.fillStyle = zoneColors[cell.type] || '#0c1020';
        ctx.fillRect(x, y, cellSize, cellSize);

        // Batas grid
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Gambar label teks inisial tata ruang
        if (cell.type !== 0) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(7, cellSize * 0.32)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let label = '';
          if (cell.type === 1) label = `R${cell.height > 0 ? cell.height : ''}`;
          else if (cell.type === 2) label = `C${cell.height > 0 ? cell.height : ''}`;
          else if (cell.type === 3) label = `I${cell.height > 0 ? cell.height : ''}`;
          else if (cell.type === 4) label = 'RTH';
          else if (cell.type === 5) label = 'JLN';
          ctx.fillText(label, x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
    calculateStats();
  };

  // Renderer 3D Isometrik Orbit & Shading
  const drawCity3D = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const curZoom = curZoomRef.current;
    const curPanX = curPanXRef.current;
    const curPanY = curPanYRef.current;
    const curTheta = curThetaRef.current;
    const curPitch = curPitchRef.current;

    const S = width / (gridSize * 1.35); // Skala ubin adaptif terhadap ukuran grid
    const colC = gridSize / 2;
    const rowC = gridSize / 2;

    // Fungsi proyeksi 3D (Rotasi & Pitch) terpusat pada camera target (panX, panY)
    const getCorner = (colIndex: number, rowIndex: number, colOffset: number, rowOffset: number, heightVal: number) => {
      const colG = colIndex + colOffset;
      const rowG = rowIndex + rowOffset;
      
      const dx = (colG - colC) * S - curPanX;
      const dy = (rowG - rowC) * S - curPanY;
      
      // Rotasi 3D yaw (theta)
      const rx = dx * Math.cos(curTheta) - dy * Math.sin(curTheta);
      const ry = dx * Math.sin(curTheta) + dy * Math.cos(curTheta);
      
      // Mengunci titik jangkar di tengah layar canvas
      const px = rx * curZoom + width / 2;
      // Tilt pitch & tinggi gedung terangkat vertikal
      const py = ry * Math.sin(curPitch) * curZoom - (heightVal * heightScale * curZoom * Math.cos(curPitch)) + height / 2;
      
      return { x: px, y: py };
    };

    // Painter's Algorithm: Urutkan sel dari belakang ke depan berdasarkan kedalaman (ry)
    const cellList: { r: number; c: number; depth: number }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dx = (c - colC) * S - curPanX;
        const dy = (r - rowC) * S - curPanY;
        const ry = dx * Math.sin(curTheta) + dy * Math.cos(curTheta);
        cellList.push({ r, c, depth: ry });
      }
    }
    cellList.sort((a, b) => a.depth - b.depth);

    // Render sel berurutan
    for (const cellInfo of cellList) {
      const { r, c } = cellInfo;
      const cell = grid[r]?.[c] || { type: 0, height: 0 };

      // Cari 4 sudut dasar ubin
      const p1 = getCorner(c, r, -0.5, -0.5, 0); // Belakang
      const p2 = getCorner(c, r, 0.5, -0.5, 0);  // Kanan
      const p3 = getCorner(c, r, 0.5, 0.5, 0);   // Depan
      const p4 = getCorner(c, r, -0.5, 0.5, 0);  // Kiri

      if (cell.type === 0) {
        drawFlatTile(ctx, p1, p2, p3, p4, '#060B18');
      } else if (cell.type === 5) {
        drawRoad(ctx, p1, p2, p3, p4);

        // Gambar label jalan 'JLN' saat berada dalam transisi 2D
        const labelOpacity = Math.max(0, (curPitch - 1.25) / (Math.PI / 2 - 1.25));
        if (labelOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = labelOpacity;
          ctx.fillStyle = '#ffffff';
          const fontSize = Math.max(6, S * curZoom * 0.35);
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rcx = (p1.x + p2.x + p3.x + p4.x) / 4;
          const rcy = (p1.y + p2.y + p3.y + p4.y) / 4;
          ctx.fillText('JLN', rcx, rcy);
          ctx.restore();
        }
      } else if (cell.type === 4) {
        drawTree(ctx, p1, p2, p3, p4, curPitch);

        // Gambar label ruang terbuka hijau 'RTH' saat berada dalam transisi 2D
        const labelOpacity = Math.max(0, (curPitch - 1.25) / (Math.PI / 2 - 1.25));
        if (labelOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = labelOpacity;
          ctx.fillStyle = '#ffffff';
          const fontSize = Math.max(6, S * curZoom * 0.35);
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rcx = (p1.x + p2.x + p3.x + p4.x) / 4;
          const rcy = (p1.y + p2.y + p3.y + p4.y) / 4;
          ctx.fillText('RTH', rcx, rcy);
          ctx.restore();
        }
      } else {
        const roofH = cell.height;
        
        // 4 sudut atap gedung terangkat
        const t1 = getCorner(c, r, -0.5, -0.5, roofH);
        const t2 = getCorner(c, r, 0.5, -0.5, roofH);
        const t3 = getCorner(c, r, 0.5, 0.5, roofH);
        const t4 = getCorner(c, r, -0.5, 0.5, roofH);

        // Cari sudut dasar terdekat (Y terbesar di layar) untuk hitung dinding yang terlihat
        const corners = [
          { base: p1, roof: t1, index: 0 },
          { base: p2, roof: t2, index: 1 },
          { base: p3, roof: t3, index: 2 },
          { base: p4, roof: t4, index: 3 }
        ];

        let closestIdx = 0;
        let maxBaseY = -Infinity;
        for (let i = 0; i < 4; i++) {
          if (corners[i].base.y > maxBaseY) {
            maxBaseY = corners[i].base.y;
            closestIdx = i;
          }
        }

        const pc = corners[closestIdx].base;
        const tc = corners[closestIdx].roof;

        const idxL = (closestIdx === 0) ? 3 : closestIdx - 1;
        const idxR = (closestIdx === 3) ? 0 : closestIdx + 1;

        const n1 = corners[idxL];
        const n2 = corners[idxR];

        // Pisahkan dinding kiri & kanan berdasarkan posisi X di layar
        const leftCorner = n1.base.x < n2.base.x ? n1 : n2;
        const rightCorner = n1.base.x < n2.base.x ? n2 : n1;

        const pl = leftCorner.base;
        const tl = leftCorner.roof;
        const pr = rightCorner.base;
        const tr = rightCorner.roof;

        const baseColor = zoneColors[cell.type];
        const leftColor = adjustColorBrightness(baseColor, -25);
        const rightColor = adjustColorBrightness(baseColor, -12);

        // Gambar dinding sisi kiri (hanya jika pitch tidak mendekati 90 derajat)
        const wallOpacity = Math.max(0, 1 - (curPitch - 1.25) / (Math.PI / 2 - 1.25));
        if (wallOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = wallOpacity;

          ctx.fillStyle = leftColor;
          ctx.beginPath();
          ctx.moveTo(pl.x, pl.y);
          ctx.lineTo(pc.x, pc.y);
          ctx.lineTo(tc.x, tc.y);
          ctx.lineTo(tl.x, tl.y);
          ctx.closePath();
          ctx.fill();

          // Gambar dinding sisi kanan
          ctx.fillStyle = rightColor;
          ctx.beginPath();
          ctx.moveTo(pc.x, pc.y);
          ctx.lineTo(pr.x, pr.y);
          ctx.lineTo(tr.x, tr.y);
          ctx.lineTo(tc.x, tc.y);
          ctx.closePath();
          ctx.fill();

          // Menggambar fasad/jendela berornamen
          drawFaceFacade(ctx, pl, pc, tc, tl, cell.type, roofH);
          drawFaceFacade(ctx, pc, pr, tr, tc, cell.type, roofH);

          ctx.restore();
        }

        // Gambar Atap (Roof Face)
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();

        // Menggambar label teks zonasi (R, C, I) di atas atap saat bertransisi ke 2D
        const labelOpacity = Math.max(0, (curPitch - 1.25) / (Math.PI / 2 - 1.25));
        if (labelOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = labelOpacity;
          ctx.fillStyle = '#ffffff';
          const fontSize = Math.max(6, S * curZoom * 0.35);
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rcx = (t1.x + t2.x + t3.x + t4.x) / 4;
          const rcy = (t1.y + t2.y + t3.y + t4.y) / 4;
          
          let label = '';
          if (cell.type === 1) label = `R${roofH > 0 ? roofH : ''}`;
          else if (cell.type === 2) label = `C${roofH > 0 ? roofH : ''}`;
          else if (cell.type === 3) label = `I${roofH > 0 ? roofH : ''}`;
          
          ctx.fillText(label, rcx, rcy);
          ctx.restore();
        }

        // Outlines struktur CAD (hanya jika wallOpacity > 0.1)
        if (wallOpacity > 0.1) {
          ctx.save();
          ctx.globalAlpha = wallOpacity;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 0.5;
          
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.lineTo(t3.x, t3.y);
          ctx.lineTo(t4.x, t4.y);
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y);
          ctx.lineTo(pl.x, pl.y);
          ctx.moveTo(tc.x, tc.y);
          ctx.lineTo(pc.x, pc.y);
          ctx.moveTo(tr.x, tr.y);
          ctx.lineTo(pr.x, pr.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    calculateStats();
  };

  // 6. Kalkulator Statistik Perkotaan
  const calculateStats = () => {
    const totalCells = gridSize * gridSize;
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalHeight = 0;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r]?.[c] || { type: 0, height: 0 };
        counts[cell.type as keyof typeof counts]++;
        if (cell.type >= 1 && cell.type <= 3) {
          totalHeight += cell.height;
        }
      }
    }

    const rthPct = Math.round((counts[4] / totalCells) * 100);
    const resPct = Math.round((counts[1] / totalCells) * 100);
    const comPct = Math.round((counts[2] / totalCells) * 100);
    const indPct = Math.round((counts[3] / totalCells) * 100);

    let transScore = Math.min(100, Math.round((counts[5] / (counts[1] + counts[2] + counts[3] + 1)) * 150));
    if (counts[5] === 0) transScore = 0;

    let ecoScore = 50;
    ecoScore += rthPct * 1.8;

    const activeBuildingsCount = counts[1] + counts[2] + counts[3];
    const avgHeight = activeBuildingsCount > 0 ? totalHeight / activeBuildingsCount : 0;

    if (avgHeight > 2.0 && rthPct < 22) {
      ecoScore -= 18;
    }
    if (indPct > resPct) {
      ecoScore -= 12;
    }
    if (resPct > 0 && comPct > 0 && rthPct > 15) {
      ecoScore += 12;
    }

    ecoScore = Math.min(100, Math.max(0, Math.round(ecoScore)));

    setStats({
      rthPercent: rthPct,
      transScore: transScore,
      sustainScore: ecoScore,
    });
  };

  // 6b. Loop Animasi Lerp & Inersia Kamera
  const startAnimationLoop = () => {
    if (animFrameIdRef.current !== null) return;

    const animate = () => {
      let needsMoreFrames = false;
      const lerpFactor = 0.12; // Easing speed (makin kecil makin halus)
      const threshold = 0.0002;

      const lerpVal = (curRef: React.MutableRefObject<number>, targetVal: number) => {
        const diff = targetVal - curRef.current;
        if (Math.abs(diff) > threshold) {
          curRef.current += diff * lerpFactor;
          needsMoreFrames = true;
        } else {
          curRef.current = targetVal;
        }
      };

      lerpVal(curZoomRef, targetZoomRef.current);
      lerpVal(curPanXRef, targetPanXRef.current);
      lerpVal(curPanYRef, targetPanYRef.current);
      lerpVal(curThetaRef, targetThetaRef.current);
      lerpVal(curPitchRef, targetPitchRef.current);

      drawCity();

      if (needsMoreFrames) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        animFrameIdRef.current = null;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
  };

  // Sinkronisasi target refs saat React state berubah
  useEffect(() => {
    zoomRef.current = zoom;
    panXRef.current = panX;
    panYRef.current = panY;
    thetaRef.current = theta;
    pitchRef.current = pitch;
    is2DRef.current = is2D;

    targetZoomRef.current = zoom;
    targetPanXRef.current = panX;
    targetPanYRef.current = panY;
    targetThetaRef.current = theta;
    targetPitchRef.current = pitch;

    startAnimationLoop();
  }, [zoom, panX, panY, theta, pitch, is2D]);

  // Bersihkan loop saat unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // 7. Logika Interaksi Mouse (Deteksi Klik Grid & Inverse Transformation)
  const handleInteraction = (clientX: number, clientY: number, clickMode: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    let col = -1;
    let row = -1;

    if (is2D) {
      const cellSize = (Math.min(canvas.width, canvas.height) / (gridSize * 1.15)) * curZoomRef.current;
      const startX = canvas.width / 2 - (gridSize * cellSize) / 2 - curPanXRef.current * curZoomRef.current;
      const startY = canvas.height / 2 - (gridSize * cellSize) / 2 - curPanYRef.current * curZoomRef.current;

      col = Math.floor((mouseX - startX) / cellSize);
      row = Math.floor((mouseY - startY) / cellSize);
    } else {
      const S = canvas.width / (gridSize * 1.35);
      const colC = gridSize / 2;
      const rowC = gridSize / 2;

      const X = (mouseX - canvas.width / 2) / curZoomRef.current;
      const Y = (mouseY - canvas.height / 2) / (curZoomRef.current * Math.max(0.1, Math.sin(curPitchRef.current)));

      // Inverse rotasi koordinat dengan translasi fokus kamera (panX, panY)
      const dx = X * Math.cos(curThetaRef.current) + Y * Math.sin(curThetaRef.current) + curPanXRef.current;
      const dy = -X * Math.sin(curThetaRef.current) + Y * Math.cos(curThetaRef.current) + curPanYRef.current;

      col = Math.floor(dx / S + 0.5 + colC);
      row = Math.floor(dy / S + 0.5 + rowC);
    }

    // Jika koordinat klik berada di dalam grid
    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      if (!clickMode) {
        // Mode seret kuas: cegah spamming penulisan sel yang sama
        if (grid[row]?.[col]?.type === selectedZone) return;

        setGrid(prev => {
          const newGrid = prev.map(r => [...r]);
          if (newGrid[row] && newGrid[row][col]) {
            newGrid[row][col] = {
              type: selectedZone,
              height: (selectedZone === 4 || selectedZone === 5) ? 0 : 1,
            };
          }
          return newGrid;
        });
      } else {
        // Mode klik tunggal: klik berulang menaikkan tinggi gedung
        setGrid(prev => {
          const newGrid = prev.map(r => [...r]);
          if (newGrid[row] && newGrid[row][col]) {
            const currentCell = newGrid[row][col];
            if (currentCell.type === selectedZone) {
              const newHeight = (selectedZone === 4 || selectedZone === 5) ? 0 : Math.min(3, currentCell.height + 1);
              newGrid[row][col] = { ...currentCell, height: newHeight };
            } else {
              newGrid[row][col] = {
                type: selectedZone,
                height: (selectedZone === 4 || selectedZone === 5) ? 0 : 1,
              };
            }
          }
          return newGrid;
        });
        setLastDrawnCell({ r: row, c: col });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // A. KLIK KIRI (Menggambar atau Orbit/Putar Kamera)
    if (e.button === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      let col = -1;
      let row = -1;

      if (is2D) {
        const cellSize = (Math.min(canvas.width, canvas.height) / (gridSize * 1.15)) * curZoomRef.current;
        const startX = canvas.width / 2 - (gridSize * cellSize) / 2 - curPanXRef.current * curZoomRef.current;
        const startY = canvas.height / 2 - (gridSize * cellSize) / 2 - curPanYRef.current * curZoomRef.current;
        col = Math.floor((mouseX - startX) / cellSize);
        row = Math.floor((mouseY - startY) / cellSize);
      } else {
        const S = canvas.width / (gridSize * 1.35);
        const colC = gridSize / 2;
        const rowC = gridSize / 2;
        const X = (mouseX - canvas.width / 2) / curZoomRef.current;
        const Y = (mouseY - canvas.height / 2) / (curZoomRef.current * Math.max(0.1, Math.sin(curPitchRef.current)));
        const dx = X * Math.cos(curThetaRef.current) + Y * Math.sin(curThetaRef.current) + curPanXRef.current;
        const dy = -X * Math.sin(curThetaRef.current) + Y * Math.cos(curThetaRef.current) + curPanYRef.current;
        col = Math.floor(dx / S + 0.5 + colC);
        row = Math.floor(dy / S + 0.5 + rowC);
      }

      // Jika klik di atas grid: menggambar gedung
      if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
        setIsDrawing(true);
        setDrawMode('draw');
        handleInteraction(e.clientX, e.clientY, true);
      } else {
        // Klik luar grid: geser peta (pan)
        setIsDrawing(true);
        setDrawMode('pan');
        setDragStart({
          clientX: e.clientX,
          clientY: e.clientY,
          theta,
          pitch,
          panX,
          panY
        });
      }
    } 
    // B. KLIK KANAN (Memutar Kamera / Orbit ke segala perspektif 3D)
    else if (e.button === 2) {
      e.preventDefault();
      setIsDrawing(true);
      if (!is2D) {
        setDrawMode('orbit');
      } else {
        setDrawMode('pan'); // Di 2D, klik kanan juga berfungsi sebagai pan
      }
      setDragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        theta,
        pitch,
        panX,
        panY
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawMode) return;

    if (drawMode === 'draw') {
      handleInteraction(e.clientX, e.clientY, false);
    } else if (drawMode === 'orbit' && dragStart) {
      const deltaX = e.clientX - dragStart.clientX;
      const deltaY = e.clientY - dragStart.clientY;
      
      const newTheta = dragStart.theta + deltaX * 0.007;
      const maxP = 82 * Math.PI / 180;
      const minP = 12 * Math.PI / 180;
      const newPitch = Math.min(maxP, Math.max(minP, dragStart.pitch - deltaY * 0.007));
      
      targetThetaRef.current = newTheta;
      targetPitchRef.current = newPitch;
      startAnimationLoop();

      setTheta(newTheta);
      setPitch(newPitch);
    } else if (drawMode === 'pan' && dragStart) {
      const deltaX = e.clientX - dragStart.clientX;
      const deltaY = e.clientY - dragStart.clientY;
      
      if (is2D) {
        const newPanX = dragStart.panX - deltaX / curZoomRef.current;
        const newPanY = dragStart.panY - deltaY / curZoomRef.current;
        targetPanXRef.current = newPanX;
        targetPanYRef.current = newPanY;
        startAnimationLoop();
        setPanX(newPanX);
        setPanY(newPanY);
      } else {
        const deltaXRotated = -deltaX / curZoomRef.current;
        const deltaYRotated = -deltaY / (curZoomRef.current * Math.max(0.1, Math.sin(curPitchRef.current)));
        
        const deltaPanX = deltaXRotated * Math.cos(curThetaRef.current) + deltaYRotated * Math.sin(curThetaRef.current);
        const deltaPanY = -deltaXRotated * Math.sin(curThetaRef.current) + deltaYRotated * Math.cos(curThetaRef.current);

        const newPanX = dragStart.panX + deltaPanX;
        const newPanY = dragStart.panY + deltaPanY;
        targetPanXRef.current = newPanX;
        targetPanYRef.current = newPanY;
        startAnimationLoop();
        setPanX(newPanX);
        setPanY(newPanY);
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
    setDrawMode('none');
    setDragStart(null);
    setLastDrawnCell(null);
  };

  // 8. Logika Interaksi Touch Screen (Smartphone/Tablet)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (touch.clientX - rect.left) * scaleX;
      const mouseY = (touch.clientY - rect.top) * scaleY;

      let col = -1;
      let row = -1;

      if (is2D) {
        const cellSize = (Math.min(canvas.width, canvas.height) / (gridSize * 1.15)) * curZoomRef.current;
        const startX = canvas.width / 2 - (gridSize * cellSize) / 2 - curPanXRef.current * curZoomRef.current;
        const startY = canvas.height / 2 - (gridSize * cellSize) / 2 - curPanYRef.current * curZoomRef.current;
        col = Math.floor((mouseX - startX) / cellSize);
        row = Math.floor((mouseY - startY) / cellSize);
      } else {
        const S = canvas.width / (gridSize * 1.35);
        const colC = gridSize / 2;
        const rowC = gridSize / 2;
        const X = (mouseX - canvas.width / 2) / curZoomRef.current;
        const Y = (mouseY - canvas.height / 2) / (curZoomRef.current * Math.max(0.1, Math.sin(curPitchRef.current)));
        const dx = X * Math.cos(curThetaRef.current) + Y * Math.sin(curThetaRef.current) + curPanXRef.current;
        const dy = -X * Math.sin(curThetaRef.current) + Y * Math.cos(curThetaRef.current) + curPanYRef.current;
        col = Math.floor(dx / S + 0.5 + colC);
        row = Math.floor(dy / S + 0.5 + rowC);
      }

      if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
        setIsDrawing(true);
        setDrawMode('draw');
        handleInteraction(touch.clientX, touch.clientY, true);
      } else {
        setIsDrawing(true);
        setDrawMode(is2D ? 'pan' : 'orbit');
        setDragStart({
          clientX: touch.clientX,
          clientY: touch.clientY,
          theta,
          pitch,
          panX,
          panY
        });
      }
    } else if (e.touches.length === 2) {
      // Dua jari: Seret Panning Peta & Pinch Zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setTouchStartDist(dist);
      setTouchStartZoom(zoom);

      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      setIsDrawing(true);
      setDrawMode('pan');
      setDragStart({
        clientX: midX,
        clientY: midY,
        theta,
        pitch,
        panX,
        panY
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawMode) return;

    if (e.touches.length === 1 && drawMode === 'draw') {
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY, false);
    } else if (e.touches.length === 1 && drawMode === 'orbit' && dragStart) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.clientX;
      const deltaY = touch.clientY - dragStart.clientY;
      const newTheta = dragStart.theta + deltaX * 0.007;
      const maxP = 82 * Math.PI / 180;
      const minP = 12 * Math.PI / 180;
      const newPitch = Math.min(maxP, Math.max(minP, dragStart.pitch - deltaY * 0.007));
      
      targetThetaRef.current = newTheta;
      targetPitchRef.current = newPitch;
      startAnimationLoop();
      setTheta(newTheta);
      setPitch(newPitch);
    } else if (e.touches.length === 2 && drawMode === 'pan' && dragStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // 1. Hitung Zoom Baru (Pinch-to-Zoom)
      let currentZoom = zoom;
      let zoomFactorDiff = 0;

      if (touchStartDist && touchStartDist > 0) {
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        const factor = dist / touchStartDist;
        const newZoom = Math.min(4.0, Math.max(0.3, touchStartZoom * factor));
        targetZoomRef.current = newZoom;
        setZoom(newZoom);
        currentZoom = newZoom;
        zoomFactorDiff = (1 / touchStartZoom) - (1 / newZoom);
      }

      // 2. Hitung kontribusi pergeseran karena Zoom memusat ke titik tengah jari (Pinch Center Panning)
      let deltaPanX_zoom = 0;
      let deltaPanY_zoom = 0;

      const midTouchX = (touch1.clientX + touch2.clientX) / 2;
      const midTouchY = (touch1.clientY + touch2.clientY) / 2;

      const canvas = canvasRef.current;
      if (canvas && zoomFactorDiff !== 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (midTouchX - rect.left) * scaleX;
        const mouseY = (midTouchY - rect.top) * scaleY;

        if (is2D) {
          const X_screen = mouseX - canvas.width / 2;
          const Y_screen = mouseY - canvas.height / 2;
          deltaPanX_zoom = X_screen * zoomFactorDiff;
          deltaPanY_zoom = Y_screen * zoomFactorDiff;
        } else {
          const X_screen = mouseX - canvas.width / 2;
          const Y_screen = mouseY - canvas.height / 2;
          const dX = X_screen * zoomFactorDiff;
          const dY = (Y_screen / Math.max(0.1, Math.sin(curPitchRef.current))) * zoomFactorDiff;

          // Koreksi tanda rotasi pada zoom sentuh
          deltaPanX_zoom = dX * Math.cos(curThetaRef.current) + dY * Math.sin(curThetaRef.current);
          deltaPanY_zoom = -dX * Math.sin(curThetaRef.current) + dY * Math.cos(curThetaRef.current);
        }
      }

      // 3. Hitung kontribusi pergeseran karena menyeret dua jari (Two-Finger Drag Panning)
      const deltaX = midTouchX - dragStart.clientX;
      const deltaY = midTouchY - dragStart.clientY;

      let deltaPanX_drag = 0;
      let deltaPanY_drag = 0;

      if (is2D) {
        deltaPanX_drag = -deltaX / currentZoom;
        deltaPanY_drag = -deltaY / currentZoom;
      } else {
        const deltaXRotated = -deltaX / currentZoom;
        const deltaYRotated = -deltaY / (currentZoom * Math.max(0.1, Math.sin(curPitchRef.current)));

        deltaPanX_drag = deltaXRotated * Math.cos(curThetaRef.current) + deltaYRotated * Math.sin(curThetaRef.current);
        deltaPanY_drag = -deltaXRotated * Math.sin(curThetaRef.current) + deltaYRotated * Math.cos(curThetaRef.current);
      }

      // 4. Gabungkan kedua kontribusi di atas ke dalam satu pembaruan state
      const newPanX = dragStart.panX + deltaPanX_zoom + deltaPanX_drag;
      const newPanY = dragStart.panY + deltaPanY_zoom + deltaPanY_drag;
      targetPanXRef.current = newPanX;
      targetPanYRef.current = newPanY;
      startAnimationLoop();
      setPanX(newPanX);
      setPanY(newPanY);
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    setDrawMode('none');
    setDragStart(null);
    setTouchStartDist(null);
    setLastDrawnCell(null);
  };

  const handleReset = () => {
    setGrid(createDefaultGrid(gridSize));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(4.0, prev * 1.25));
  const handleZoomOut = () => setZoom(prev => Math.max(0.3, prev * 0.8));

  const toggle2D = () => {
    setIs2D(prev => {
      const nextVal = !prev;
      if (nextVal) {
        // Simpan arah rotasi dan sudut kemiringan 3D saat ini sebelum pindah ke 2D
        prev3DThetaRef.current = thetaRef.current;
        prev3DPitchRef.current = pitchRef.current;
        
        // Pindah ke 2D: Sudut kemiringan tegak lurus (90 derajat) dan rotasi lurus (0 derajat)
        setTheta(0);
        setPitch(Math.PI / 2);
      } else {
        // Kembali ke 3D: Pulihkan rotasi dan kemiringan sebelumnya
        setTheta(prev3DThetaRef.current);
        setPitch(prev3DPitchRef.current);
      }
      return nextVal;
    });
  };

  // 9. Ekspor Hasil Tata Ruang ke Berkas Gambar PNG
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `metropolis-urban-sandbox-${gridSize}x${gridSize}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getSustainColor = (score: number) => {
    if (score >= 75) return 'text-urban-green';
    if (score >= 45) return 'text-urban-yellow';
    return 'text-urban-red';
  };

  // Teks intruksi pintasan bilingual kustom
  const controlHint = language === 'ID' 
    ? '💡 Pintasan: Klik-Kanan + Geser = Putar Kamera 3D | Klik-Kiri Area Kosong + Geser = Geser Peta | Scroll / Cubit = Zoom | Klik-Kiri Grid = Gambar' 
    : '💡 Shortcuts: Right-Click + Drag = Rotate 3D Camera | Left-Click Empty Space + Drag = Pan Map | Scroll / Pinch = Zoom | Left-Click = Draw';

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative scanlines">
        
        {/* Header Kontrol Sandbox */}
        <div className="bg-blueprint-panel px-4 py-3 border-b border-cyber-cyan/15 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-urban-red rounded-full animate-ping"></span>
            <span className="font-mono text-xs text-white uppercase">{t.sandbox.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono">
            {/* 1. Pengatur Ukuran Grid */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Grid:</span>
              <div className="flex border border-cyber-cyan/30 rounded overflow-hidden">
                {[10, 20, 30, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setGridSize(size)}
                    className={`px-2 py-1 transition-all cursor-pointer font-bold ${
                      gridSize === size ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel text-cyber-cyan hover:bg-cyber-cyan/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Zoom Controls */}
            <div className="flex border border-cyber-cyan/30 rounded overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 bg-blueprint-panel hover:bg-cyber-cyan/10 text-cyber-cyan transition-all cursor-pointer"
                title="Perbesar (Zoom In)"
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 bg-blueprint-panel hover:bg-cyber-cyan/10 text-cyber-cyan transition-all cursor-pointer border-l border-cyber-cyan/30"
                title="Perkecil (Zoom Out)"
              >
                <Minus size={12} />
              </button>
            </div>

            {/* 3. Opsi Tampak Atas 2D */}
            <button
              type="button"
              onClick={toggle2D}
              className={`px-2.5 py-1 border border-cyber-cyan/30 rounded hover:bg-cyber-cyan/10 text-cyber-cyan transition-all cursor-pointer flex items-center gap-1 font-bold ${
                is2D ? 'bg-cyber-cyan text-blueprint-base border-cyber-cyan' : ''
              }`}
              title={is2D ? 'Ganti ke Kamera 3D' : 'Tampilkan 2D Tampak Atas'}
            >
              <Eye size={12} />
              <span>{is2D ? '3D VIEW' : '2D VIEW'}</span>
            </button>

            {/* 4. Ekspor PNG */}
            <button
              type="button"
              onClick={handleExportImage}
              className="px-2.5 py-1 border border-cyber-cyan/30 hover:border-cyber-cyan rounded hover:bg-cyber-cyan/10 text-cyber-cyan transition-all cursor-pointer flex items-center gap-1 font-bold"
              title="Unduh Gambar Kanvas (.png)"
            >
              <Download size={12} />
              <span>PNG</span>
            </button>

            {/* 5. Kuas Gambar Aset Spasial */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400">{t.sandbox.brush}</span>
              <div className="flex border border-cyber-cyan/30 rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedZone(1)}
                  className={`px-2.5 py-1 transition-all cursor-pointer font-bold ${
                    selectedZone === 1 ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel text-cyber-cyan hover:bg-cyber-cyan/10'
                  }`}
                  title={t.sandbox.zoneR}
                >
                  R
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedZone(2)}
                  className={`px-2.5 py-1 transition-all cursor-pointer font-bold ${
                    selectedZone === 2 ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel text-cyber-cyan hover:bg-cyber-cyan/10'
                  }`}
                  title={t.sandbox.zoneC}
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedZone(3)}
                  className={`px-2.5 py-1 transition-all cursor-pointer font-bold ${
                    selectedZone === 3 ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel text-urban-yellow hover:bg-urban-yellow/10'
                  }`}
                  title={t.sandbox.zoneI}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedZone(4)}
                  className={`px-2.5 py-1 transition-all cursor-pointer font-bold ${
                    selectedZone === 4 ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel text-urban-green hover:bg-urban-green/10'
                  }`}
                  title={t.sandbox.zoneRTH}
                >
                  RTH
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedZone(5)}
                  className={`px-2.5 py-1 transition-all cursor-pointer font-bold ${
                    selectedZone === 5 ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-panel text-slate-350 hover:bg-slate-350/10'
                  }`}
                  title={t.sandbox.zoneRoad}
                >
                  {language === 'ID' ? 'Jalan' : 'Road'}
                </button>
              </div>
            </div>

            {/* 6. Tombol Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs bg-urban-red/20 hover:bg-urban-red/30 border border-urban-red/40 text-urban-red px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              {t.sandbox.reset}
            </button>
          </div>
        </div>

        {/* Konten Area Canvas */}
        <div className="relative w-full aspect-[4/3] bg-[#030712] flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onContextMenu={(e) => e.preventDefault()} // Cegah klik kanan di kanvas
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-full h-full rounded-lg ${
              drawMode === 'pan' ? 'cursor-grabbing' : (drawMode === 'orbit' ? 'cursor-grabbing' : 'cursor-crosshair')
            }`}
          />
          
          {/* Panel Hasil Metrik Telemetri */}
          <div className="absolute bottom-4 left-4 bg-blueprint-panel/90 border border-cyber-cyan/30 p-3 rounded-lg text-[11px] font-mono flex flex-col gap-1 text-slate-300 max-w-xs backdrop-blur-md shadow-lg pointer-events-none">
            <span className="text-white font-bold border-b border-white/10 pb-1 mb-1">{t.sandbox.statsTitle}</span>
            <div className="flex justify-between gap-8">
              <span>{t.sandbox.rth}</span>
              <span className="text-urban-green font-bold">{stats.rthPercent}%</span>
            </div>
            <div className="flex justify-between gap-8">
              <span>{t.sandbox.transitEff}</span>
              <span className="text-cyber-cyan font-bold">{stats.transScore}%</span>
            </div>
            <div className="flex justify-between gap-8">
              <span>{t.sandbox.sustainScore}</span>
              <span className={getSustainColor(stats.sustainScore)}>{stats.sustainScore}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-widest leading-relaxed px-4">
        {controlHint}
      </p>
    </div>
  );
};
export default CitySandbox;
