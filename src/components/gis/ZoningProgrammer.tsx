'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MousePointer, Plus, Link2, MapPin, Type, RotateCcw, Download, Trash2, Square, Circle, Undo2, Redo2, Copy, Hexagon, Minus, Image, Lock, Unlock, BarChart2 } from 'lucide-react';

// ==================== TIPE DATA ====================
type ZoneCategory = 'residential' | 'commercial' | 'green' | 'industrial' | 'public' | 'mixed' | 'parking' | 'worship';
type ToolMode = 'select' | 'addZone' | 'connect' | 'entrance' | 'annotate' | 'freePolygon' | 'freeLine';
type ConnStyle = 'solid' | 'dashed' | 'dotted';

interface Zone { id: string; category: ZoneCategory; x: number; y: number; w: number; h: number; label: string; shape: 'rect' | 'ellipse'; customFill?: string; customStroke?: string; lockedArea?: number; lockArea?: boolean; }
interface Connection { id: string; from: string; to: string; style: ConnStyle; hasArrow: boolean; label: string; }
interface Entrance { id: string; x: number; y: number; label: string; }
interface Annotation { id: string; x: number; y: number; text: string; }
interface FreePolygon { id: string; points: { x: number; y: number }[]; category: ZoneCategory; label: string; customFill?: string; customStroke?: string; }
interface FreeLine { id: string; points: { x: number; y: number }[]; color: string; style: ConnStyle; label: string; }
interface Guide { type: 'h' | 'v'; pos: number; }

// ==================== KONSTANTA ====================
const VB_W = 1000;
const VB_H = 650;
const GRID_SNAP = 25;

const ZONE_CATALOG: Record<ZoneCategory, { fill: string; stroke: string; glow: string; label: string }> = {
  residential: { fill: '#1e3a5f', stroke: '#3b82f6', glow: 'rgba(59,130,246,0.5)', label: 'Hunian' },
  commercial:  { fill: '#4a2c17', stroke: '#f97316', glow: 'rgba(249,115,22,0.5)', label: 'Komersial' },
  green:       { fill: '#14352a', stroke: '#10b981', glow: 'rgba(16,185,129,0.5)', label: 'RTH' },
  industrial:  { fill: '#3a1a1a', stroke: '#ef4444', glow: 'rgba(239,68,68,0.5)', label: 'Industri' },
  public:      { fill: '#153035', stroke: '#06b6d4', glow: 'rgba(6,182,212,0.5)', label: 'Fasilitas Publik' },
  mixed:       { fill: '#2a1a3f', stroke: '#a855f7', glow: 'rgba(168,85,247,0.5)', label: 'Mixed-Use' },
  parking:     { fill: '#1e2530', stroke: '#64748b', glow: 'rgba(100,116,139,0.5)', label: 'Parkir' },
  worship:     { fill: '#332b10', stroke: '#eab308', glow: 'rgba(234,179,8,0.5)', label: 'Ibadah' },
};

const CONN_STYLES: Record<ConnStyle, { color: string; dash: string; label: string }> = {
  solid:  { color: '#06b6d4', dash: 'none', label: 'Akses Utama' },
  dashed: { color: '#f97316', dash: '12 6', label: 'Pedestrian' },
  dotted: { color: '#a855f7', dash: '4 4', label: 'Aksis Visual' },
};

// ==================== TEMPLATES ====================
const TEMPLATES: Record<string, { name: string; zones: Zone[]; connections: Connection[]; entrances: Entrance[] }> = {
  residential: {
    name: 'Kawasan Perumahan',
    zones: [
      { id: 'tr1', category: 'residential', x: 50, y: 50, w: 180, h: 110, label: 'Hunian-1', shape: 'rect' },
      { id: 'tr2', category: 'residential', x: 280, y: 50, w: 180, h: 110, label: 'Hunian-2', shape: 'rect' },
      { id: 'tr3', category: 'green', x: 510, y: 50, w: 160, h: 110, label: 'Taman', shape: 'ellipse' },
      { id: 'tr4', category: 'worship', x: 50, y: 220, w: 130, h: 100, label: 'Masjid', shape: 'rect' },
      { id: 'tr5', category: 'parking', x: 230, y: 220, w: 130, h: 100, label: 'Parkir', shape: 'rect' },
      { id: 'tr6', category: 'commercial', x: 410, y: 220, w: 160, h: 100, label: 'Ruko', shape: 'rect' },
    ],
    connections: [
      { id: 'tc1', from: 'tr1', to: 'tr2', style: 'solid', hasArrow: false, label: 'Jalan' },
      { id: 'tc2', from: 'tr2', to: 'tr3', style: 'dashed', hasArrow: false, label: '' },
      { id: 'tc3', from: 'tr4', to: 'tr5', style: 'solid', hasArrow: false, label: '' },
    ],
    entrances: [{ id: 'te1', x: 350, y: 580, label: 'Entrance Utama' }],
  },
  cbd: {
    name: 'Kawasan CBD',
    zones: [
      { id: 'cb1', category: 'commercial', x: 100, y: 50, w: 200, h: 130, label: 'Mall', shape: 'rect' },
      { id: 'cb2', category: 'mixed', x: 350, y: 50, w: 200, h: 130, label: 'Mixed-Use Tower', shape: 'rect' },
      { id: 'cb3', category: 'public', x: 600, y: 50, w: 160, h: 130, label: 'Civic Center', shape: 'rect' },
      { id: 'cb4', category: 'parking', x: 100, y: 250, w: 150, h: 100, label: 'Basement Parkir', shape: 'rect' },
      { id: 'cb5', category: 'green', x: 300, y: 250, w: 200, h: 100, label: 'Plaza RTH', shape: 'ellipse' },
    ],
    connections: [
      { id: 'cc1', from: 'cb1', to: 'cb2', style: 'solid', hasArrow: true, label: 'Skybridge' },
      { id: 'cc2', from: 'cb2', to: 'cb3', style: 'dashed', hasArrow: false, label: '' },
      { id: 'cc3', from: 'cb1', to: 'cb4', style: 'dotted', hasArrow: true, label: '' },
    ],
    entrances: [{ id: 'ce1', x: 100, y: 580, label: 'Entrance Utama' }, { id: 'ce2', x: 700, y: 580, label: 'Entrance Servis' }],
  },
  campus: {
    name: 'Kampus Universitas',
    zones: [
      { id: 'ku1', category: 'public', x: 50, y: 50, w: 200, h: 120, label: 'Gedung Rektorat', shape: 'rect' },
      { id: 'ku2', category: 'public', x: 300, y: 50, w: 180, h: 120, label: 'Perpustakaan', shape: 'rect' },
      { id: 'ku3', category: 'public', x: 530, y: 50, w: 180, h: 120, label: 'Lab & Studio', shape: 'rect' },
      { id: 'ku4', category: 'green', x: 200, y: 230, w: 250, h: 120, label: 'Lapangan & Taman', shape: 'ellipse' },
      { id: 'ku5', category: 'worship', x: 50, y: 230, w: 110, h: 100, label: 'Mushola', shape: 'rect' },
      { id: 'ku6', category: 'parking', x: 500, y: 230, w: 140, h: 100, label: 'Parkir', shape: 'rect' },
    ],
    connections: [
      { id: 'kc1', from: 'ku1', to: 'ku2', style: 'solid', hasArrow: false, label: 'Koridor' },
      { id: 'kc2', from: 'ku2', to: 'ku3', style: 'solid', hasArrow: false, label: '' },
      { id: 'kc3', from: 'ku1', to: 'ku4', style: 'dashed', hasArrow: false, label: '' },
    ],
    entrances: [{ id: 'ke1', x: 350, y: 580, label: 'Gerbang Utama' }],
  },
};

// ==================== HELPER FUNCTIONS ====================
const shoelaceArea = (pts: { x: number; y: number }[]) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a / 2);
};

const centroid = (pts: { x: number; y: number }[]) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});

const snap = (v: number, enabled: boolean) => enabled ? Math.round(v / GRID_SNAP) * GRID_SNAP : v;

// ==================== KOMPONEN UTAMA ====================
export const ZoningProgrammer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Data State ---
  const [zones, setZones] = useState<Zone[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [freePolygons, setFreePolygons] = useState<FreePolygon[]>([]);
  const [freeLines, setFreeLines] = useState<FreeLine[]>([]);

  // --- View State ---
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: VB_W, h: VB_H });
  const viewBoxRef = useRef({ x: 0, y: 0, w: VB_W, h: VB_H });
  useEffect(() => { viewBoxRef.current = viewBox; }, [viewBox]);

  // --- Tool State ---
  const [mode, setMode] = useState<ToolMode>('addZone');
  const [activeCategory, setActiveCategory] = useState<ZoneCategory>('residential');
  const [activeConnStyle, setActiveConnStyle] = useState<ConnStyle>('solid');
  const [activeShape, setActiveShape] = useState<'rect' | 'ellipse'>('rect');
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [scaleMeters, setScaleMeters] = useState(0.5);
  const [showAreaPanel, setShowAreaPanel] = useState(false);

  // --- Interaction State ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; handle: string; ox: number; oy: number; ow: number; oh: number; sx: number; sy: number } | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const panRef = useRef<{ sx: number; sy: number; vx: number; vy: number } | null>(null);
  const spaceRef = useRef(false);

  // --- History ---
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [snapTrigger, setSnapTrigger] = useState(0);

  // Sync data refs for snapshot
  const zRef = useRef(zones); zRef.current = zones;
  const cRef = useRef(connections); cRef.current = connections;
  const eRef = useRef(entrances); eRef.current = entrances;
  const aRef = useRef(annotations); aRef.current = annotations;
  const fpRef = useRef(freePolygons); fpRef.current = freePolygons;
  const flRef = useRef(freeLines); flRef.current = freeLines;

  // Initial history snapshot
  useEffect(() => {
    const init = JSON.stringify({ zones: [], connections: [], entrances: [], annotations: [], freePolygons: [], freeLines: [] });
    historyRef.current = [init];
    historyIndexRef.current = 0;
  }, []);

  // Push snapshot on trigger
  useEffect(() => {
    if (snapTrigger === 0) return;
    const s = JSON.stringify({ zones: zRef.current, connections: cRef.current, entrances: eRef.current, annotations: aRef.current, freePolygons: fpRef.current, freeLines: flRef.current });
    if (historyRef.current[historyIndexRef.current] === s) return;
    const h = historyRef.current.slice(0, historyIndexRef.current + 1);
    h.push(s);
    if (h.length > 50) h.shift();
    historyRef.current = h;
    historyIndexRef.current = h.length - 1;
    setHistoryVersion(v => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapTrigger]);

  const triggerSnapshot = () => setSnapTrigger(c => c + 1);
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;
  // Force re-check on historyVersion change
  void historyVersion;

  const applyHistory = (index: number) => {
    const s = JSON.parse(historyRef.current[index]);
    setZones(s.zones); setConnections(s.connections); setEntrances(s.entrances);
    setAnnotations(s.annotations); setFreePolygons(s.freePolygons); setFreeLines(s.freeLines);
    setSelectedId(null);
  };

  const undo = () => { if (historyIndexRef.current > 0) { historyIndexRef.current--; applyHistory(historyIndexRef.current); setHistoryVersion(v => v + 1); } };
  const redo = () => { if (historyIndexRef.current < historyRef.current.length - 1) { historyIndexRef.current++; applyHistory(historyIndexRef.current); setHistoryVersion(v => v + 1); } };

  // --- Computed ---
  const selectedZone = zones.find(z => z.id === selectedId) || null;
  const selectedConn = connections.find(c => c.id === selectedId) || null;
  const selectedEntrance = entrances.find(en => en.id === selectedId) || null;
  const selectedAnnotation = annotations.find(a => a.id === selectedId) || null;
  const selectedFP = freePolygons.find(fp => fp.id === selectedId) || null;
  const selectedFL = freeLines.find(fl => fl.id === selectedId) || null;

  const usedCategories = useMemo(() => {
    const cats = new Set<ZoneCategory>();
    zones.forEach(z => cats.add(z.category));
    freePolygons.forEach(fp => cats.add(fp.category));
    return Array.from(cats);
  }, [zones, freePolygons]);

  const areaByCategory = useMemo(() => {
    const r: Partial<Record<ZoneCategory, number>> = {};
    const s2 = scaleMeters * scaleMeters;
    zones.forEach(z => { r[z.category] = (r[z.category] || 0) + z.w * z.h * s2; });
    freePolygons.forEach(fp => { r[fp.category] = (r[fp.category] || 0) + shoelaceArea(fp.points) * s2; });
    return r;
  }, [zones, freePolygons, scaleMeters]);

  const totalArea = useMemo(() => Object.values(areaByCategory).reduce((s, v) => s + (v || 0), 0), [areaByCategory]);

  // --- Helpers ---
  const getSVGCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const vb = viewBoxRef.current;
    return { x: vb.x + ((e.clientX - rect.left) / rect.width) * vb.w, y: vb.y + ((e.clientY - rect.top) / rect.height) * vb.h };
  }, []);

  const getZoneCenter = (z: Zone) => ({ x: z.x + z.w / 2, y: z.y + z.h / 2 });

  const getNextLabel = useCallback((cat: ZoneCategory) => {
    const count = zones.filter(z => z.category === cat).length + freePolygons.filter(fp => fp.category === cat).length + 1;
    return `${ZONE_CATALOG[cat].label}-${count}`;
  }, [zones, freePolygons]);

  const getZoneColors = (z: Zone | FreePolygon) => {
    const cat = ZONE_CATALOG[z.category];
    return { fill: z.customFill || cat.fill, stroke: z.customStroke || cat.stroke, glow: cat.glow };
  };

  // --- Update functions ---
  const updateZone = (id: string, u: Partial<Zone>) => setZones(p => p.map(z => z.id === id ? { ...z, ...u } : z));
  const updateConn = (id: string, u: Partial<Connection>) => setConnections(p => p.map(c => c.id === id ? { ...c, ...u } : c));
  const updateEntrance = (id: string, u: Partial<Entrance>) => setEntrances(p => p.map(e => e.id === id ? { ...e, ...u } : e));
  const updateAnnotation = (id: string, u: Partial<Annotation>) => setAnnotations(p => p.map(a => a.id === id ? { ...a, ...u } : a));
  const updateFP = (id: string, u: Partial<FreePolygon>) => setFreePolygons(p => p.map(fp => fp.id === id ? { ...fp, ...u } : fp));
  const updateFL = (id: string, u: Partial<FreeLine>) => setFreeLines(p => p.map(fl => fl.id === id ? { ...fl, ...u } : fl));

  // Apply a target area (m²) to a zone, preserving aspect ratio
  const applyTargetArea = useCallback((z: Zone, targetM2: number) => {
    if (targetM2 <= 0) return;
    const targetPixels = targetM2 / (scaleMeters * scaleMeters);
    const ratio = z.w / z.h;
    const newW = Math.max(40, Math.sqrt(targetPixels * ratio));
    const newH = Math.max(30, targetPixels / newW);
    setZones(p => p.map(zone => zone.id === z.id ? { ...zone, w: newW, h: newH, lockedArea: targetM2, lockArea: true } : zone));
  }, [scaleMeters]);

  const handleDelete = (id: string) => {
    setZones(p => p.filter(z => z.id !== id));
    setConnections(p => p.filter(c => c.from !== id && c.to !== id));
    setEntrances(p => p.filter(e => e.id !== id));
    setAnnotations(p => p.filter(a => a.id !== id));
    setFreePolygons(p => p.filter(fp => fp.id !== id));
    setFreeLines(p => p.filter(fl => fl.id !== id));
    setSelectedId(null);
    triggerSnapshot();
  };

  const handleDuplicate = () => {
    if (selectedZone) {
      const dup: Zone = { ...selectedZone, id: Date.now().toString(), x: selectedZone.x + 20, y: selectedZone.y + 20, label: selectedZone.label + ' (copy)' };
      setZones(p => [...p, dup]); setSelectedId(dup.id); triggerSnapshot();
    }
  };

  const handleClear = () => {
    setZones([]); setConnections([]); setEntrances([]); setAnnotations([]); setFreePolygons([]); setFreeLines([]);
    setSelectedId(null); setConnectFrom(null); setDrawingPoints([]);
    setViewBox({ x: 0, y: 0, w: VB_W, h: VB_H });
    triggerSnapshot();
  };

  const loadTemplate = (key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setZones(JSON.parse(JSON.stringify(t.zones)));
    setConnections(JSON.parse(JSON.stringify(t.connections)));
    setEntrances(JSON.parse(JSON.stringify(t.entrances)));
    setAnnotations([]); setFreePolygons([]); setFreeLines([]);
    setSelectedId(null); setViewBox({ x: 0, y: 0, w: VB_W, h: VB_H });
    triggerSnapshot();
  };

  const switchMode = (m: ToolMode) => {
    setMode(m); setConnectFrom(null);
    if (m !== 'freePolygon' && m !== 'freeLine') setDrawingPoints([]);
  };

  const finishDrawing = () => {
    if (mode === 'freePolygon' && drawingPoints.length >= 3) {
      setFreePolygons(p => [...p, { id: Date.now().toString(), points: drawingPoints, category: activeCategory, label: getNextLabel(activeCategory) }]);
    } else if (mode === 'freeLine' && drawingPoints.length >= 2) {
      setFreeLines(p => [...p, { id: Date.now().toString(), points: drawingPoints, color: CONN_STYLES[activeConnStyle].color, style: activeConnStyle, label: '' }]);
    }
    setDrawingPoints([]);
    triggerSnapshot();
  };

  // --- Export ---
  const handleExportSVG = () => {
    setSelectedId(null);
    setTimeout(() => {
      const svg = svgRef.current;
      if (!svg) return;
      const data = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `zoning-diagram-${Date.now()}.svg`;
      link.href = url; link.click();
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleExportPNG = () => {
    setSelectedId(null);
    setTimeout(() => {
      const svg = svgRef.current;
      if (!svg) return;
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
      const data = new XMLSerializer().serializeToString(clone);
      const canvas = document.createElement('canvas');
      canvas.width = 2000; canvas.height = 1300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new window.Image();
      img.onload = () => {
        ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 2000, 1300);
        ctx.drawImage(img, 0, 0, 2000, 1300);
        const link = document.createElement('a');
        link.download = `zoning-diagram-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png'); link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
    }, 100);
  };

  // --- Event Handlers ---
  const onBackgroundClick = (e: React.MouseEvent) => {
    if (panRef.current) return;
    const pos = getSVGCoords(e);
    const sx = snap(pos.x, snapEnabled);
    const sy = snap(pos.y, snapEnabled);

    if (mode === 'addZone') {
      const nz: Zone = { id: Date.now().toString(), category: activeCategory, x: sx - 70, y: sy - 45, w: 140, h: 90, label: getNextLabel(activeCategory), shape: activeShape };
      setZones(p => [...p, nz]); setSelectedId(nz.id); triggerSnapshot();
    } else if (mode === 'entrance') {
      const label = prompt('Label Entrance:', 'Entrance Utama');
      if (label) { setEntrances(p => [...p, { id: Date.now().toString(), x: sx, y: sy, label }]); triggerSnapshot(); }
    } else if (mode === 'annotate') {
      const text = prompt('Teks Anotasi:', 'Catatan');
      if (text) { setAnnotations(p => [...p, { id: Date.now().toString(), x: sx, y: sy, text }]); triggerSnapshot(); }
    } else if (mode === 'freePolygon' || mode === 'freeLine') {
      setDrawingPoints(p => [...p, { x: sx, y: sy }]);
    } else if (mode === 'select') {
      setSelectedId(null);
    } else if (mode === 'connect') {
      setConnectFrom(null);
    }
  };

  const onZonePointerDown = (e: React.PointerEvent, z: Zone) => {
    e.stopPropagation();
    if (spaceRef.current) return;
    if (mode === 'select') {
      const pos = getSVGCoords(e);
      setSelectedId(z.id);
      setDrag({ id: z.id, ox: pos.x - z.x, oy: pos.y - z.y });
    }
  };

  const onZoneClick = (e: React.MouseEvent, z: Zone) => {
    e.stopPropagation();
    if (mode === 'connect') {
      if (!connectFrom) { setConnectFrom(z.id); }
      else if (connectFrom !== z.id) {
        setConnections(p => [...p, { id: Date.now().toString(), from: connectFrom, to: z.id, style: activeConnStyle, hasArrow: true, label: '' }]);
        setConnectFrom(null); triggerSnapshot();
      }
    } else if (mode === 'select') { setSelectedId(z.id); }
  };

  const onResizePointerDown = (e: React.PointerEvent, z: Zone, handle: string) => {
    e.stopPropagation();
    const pos = getSVGCoords(e);
    setResize({ id: z.id, handle, ox: z.x, oy: z.y, ow: z.w, oh: z.h, sx: pos.x, sy: pos.y });
  };

  const onSvgPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || spaceRef.current) {
      e.preventDefault();
      panRef.current = { sx: e.clientX, sy: e.clientY, vx: viewBox.x, vy: viewBox.y };
    }
  };

  const onSvgPointerMove = (e: React.PointerEvent) => {
    // Pan
    if (panRef.current) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const vb = viewBoxRef.current;
      const dx = (e.clientX - panRef.current.sx) / rect.width * vb.w;
      const dy = (e.clientY - panRef.current.sy) / rect.height * vb.h;
      const next = { x: panRef.current.vx - dx, y: panRef.current.vy - dy, w: vb.w, h: vb.h };
      viewBoxRef.current = next;
      setViewBox(next);
      return;
    }
    // Resize
    if (resize) {
      const pos = getSVGCoords(e);
      const dx = pos.x - resize.sx;
      const dy = pos.y - resize.sy;
      const z = zones.find(zone => zone.id === resize.id);
      const lockedArea = z?.lockedArea ?? 0;
      const isLocked = z?.lockArea === true && lockedArea > 0;
      const targetPixels = isLocked ? lockedArea / (scaleMeters * scaleMeters) : 0;
      
      let nx = resize.ox, ny = resize.oy, nw = resize.ow, nh = resize.oh;
      
      if (isLocked && targetPixels > 0) {
        // Calculate aspect ratio to maintain area
        const aspectRatio = resize.ow / resize.oh;
        
        if (resize.handle === 'se' || resize.handle === 'nw') {
          // Diagonal resize - calculate both dimensions to maintain area
          const baseSize = Math.sqrt(targetPixels);
          nw = baseSize * Math.sqrt(aspectRatio);
          nh = baseSize / Math.sqrt(aspectRatio);
          
          if (resize.handle === 'nw') {
            nx = resize.ox + resize.ow - nw;
            ny = resize.oy + resize.oh - nh;
          }
        } else if (resize.handle === 'ne' || resize.handle === 'sw') {
          const baseSize = Math.sqrt(targetPixels);
          nw = baseSize * Math.sqrt(aspectRatio);
          nh = baseSize / Math.sqrt(aspectRatio);
          
          if (resize.handle === 'sw') {
            nx = resize.ox + resize.ow - nw;
            ny = resize.oy + resize.oh - nh;
          } else {
            ny = resize.oy + resize.oh - nh;
          }
        }
        
        if (snapEnabled) { 
          nx = snap(nx, true); 
          ny = snap(ny, true); 
          nw = snap(nw, true); 
          nh = snap(nh, true); 
        }
        
        updateZone(resize.id, { x: nx, y: ny, w: Math.max(40, nw), h: Math.max(30, nh) });
      } else {
        // Normal resize without lock
        if (resize.handle === 'se') { nw = Math.max(40, resize.ow + dx); nh = Math.max(30, resize.oh + dy); }
        else if (resize.handle === 'ne') { nw = Math.max(40, resize.ow + dx); nh = Math.max(30, resize.oh - dy); ny = resize.oy + resize.oh - nh; }
        else if (resize.handle === 'sw') { nw = Math.max(40, resize.ow - dx); nx = resize.ox + resize.ow - nw; nh = Math.max(30, resize.oh + dy); }
        else if (resize.handle === 'nw') { nw = Math.max(40, resize.ow - dx); nx = resize.ox + resize.ow - nw; nh = Math.max(30, resize.oh - dy); ny = resize.oy + resize.oh - nh; }
        if (snapEnabled) { nx = snap(nx, true); ny = snap(ny, true); nw = snap(nw, true); nh = snap(nh, true); }
        updateZone(resize.id, { x: nx, y: ny, w: nw, h: nh });
      }
      return;
    }
    // Drag
    if (drag) {
      const pos = getSVGCoords(e);
      let nx = snap(pos.x - drag.ox, snapEnabled);
      let ny = snap(pos.y - drag.oy, snapEnabled);
      // Alignment guides
      const dz = zones.find(z => z.id === drag.id);
      const newGuides: Guide[] = [];
      if (dz) {
        for (const z of zones) {
          if (z.id === drag.id) continue;
          if (Math.abs((nx + dz.w / 2) - (z.x + z.w / 2)) < 5) newGuides.push({ type: 'v', pos: z.x + z.w / 2 });
          if (Math.abs((ny + dz.h / 2) - (z.y + z.h / 2)) < 5) newGuides.push({ type: 'h', pos: z.y + z.h / 2 });
          if (Math.abs(nx - z.x) < 5) newGuides.push({ type: 'v', pos: z.x });
          if (Math.abs(ny - z.y) < 5) newGuides.push({ type: 'h', pos: z.y });
          if (Math.abs(nx + dz.w - z.x - z.w) < 5) newGuides.push({ type: 'v', pos: z.x + z.w });
          if (Math.abs(ny + dz.h - z.y - z.h) < 5) newGuides.push({ type: 'h', pos: z.y + z.h });
        }
      }
      setGuides(newGuides);
      updateZone(drag.id, { x: nx, y: ny });
    }
  };

  const onSvgPointerUp = () => {
    if (panRef.current) { panRef.current = null; return; }
    if (drag) { setDrag(null); setGuides([]); triggerSnapshot(); }
    if (resize) { setResize(null); triggerSnapshot(); }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); spaceRef.current = true; }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); handleDuplicate(); }
      if (e.key === 'Delete' && selectedId) { handleDelete(selectedId); }
      if (e.key === 'Escape') { setSelectedId(null); setConnectFrom(null); setDrawingPoints([]); switchMode('select'); }
    };
    const onUp = (e: KeyboardEvent) => { if (e.key === ' ') spaceRef.current = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode]);

  // --- Wheel Zoom ---
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const vb = viewBoxRef.current;
      const mx = vb.x + ((e.clientX - rect.left) / rect.width) * vb.w;
      const my = vb.y + ((e.clientY - rect.top) / rect.height) * vb.h;
      const f = e.deltaY > 0 ? 1.08 : 0.92;
      const nw = Math.max(200, Math.min(3000, vb.w * f));
      const nh = Math.max(130, Math.min(1950, vb.h * f));
      const nx = mx - (mx - vb.x) * (nw / vb.w);
      const ny = my - (my - vb.y) * (nh / vb.h);
      const next = { x: nx, y: ny, w: nw, h: nh };
      viewBoxRef.current = next;
      setViewBox(next);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // ==================== RENDER ====================
  const MODES: { m: ToolMode; icon: typeof MousePointer; label: string }[] = [
    { m: 'select', icon: MousePointer, label: 'Pilih' },
    { m: 'addZone', icon: Plus, label: 'Zona' },
    { m: 'connect', icon: Link2, label: 'Koneksi' },
    { m: 'freePolygon', icon: Hexagon, label: 'Poligon' },
    { m: 'freeLine', icon: Minus, label: 'Garis' },
    { m: 'entrance', icon: MapPin, label: 'Entrance' },
    { m: 'annotate', icon: Type, label: 'Anotasi' },
  ];

  return (
    <div className="w-full h-full min-h-[550px] bg-[#020617] rounded-xl overflow-hidden border border-slate-800/80 flex flex-col md:flex-row relative">

      {/* ==================== TOOL PANEL ==================== */}
      <div className="w-full md:w-[260px] shrink-0 bg-slate-900/90 border-r border-slate-700/50 p-3 flex flex-col gap-3 z-20 overflow-y-auto text-[9px]">

        {/* Header + Undo/Redo */}
        <div className="flex items-center justify-between border-b border-cyber-cyan/20 pb-2">
          <span className="font-mono text-cyber-cyan text-[10px] font-bold uppercase tracking-widest">Diagram Builder</span>
          <div className="flex gap-1">
            <button onClick={undo} disabled={!canUndo} className="p-1 rounded border border-slate-700 text-slate-400 disabled:opacity-30 hover:text-white cursor-pointer transition-colors" title="Undo (Ctrl+Z)"><Undo2 className="w-3 h-3" /></button>
            <button onClick={redo} disabled={!canRedo} className="p-1 rounded border border-slate-700 text-slate-400 disabled:opacity-30 hover:text-white cursor-pointer transition-colors" title="Redo (Ctrl+Y)"><Redo2 className="w-3 h-3" /></button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-1">
          {MODES.map(t => (
            <button key={t.m} onClick={() => switchMode(t.m)}
              className={`py-1.5 rounded flex flex-col items-center gap-0.5 font-bold uppercase border transition-all cursor-pointer ${mode === t.m ? 'bg-cyber-cyan/15 border-cyber-cyan/50 text-cyber-cyan' : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-3 h-3" /><span className="text-[7px]">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Connect-from indicator */}
        {mode === 'connect' && connectFrom && (
          <div className="font-mono text-orange-400 bg-orange-500/10 border border-orange-500/30 p-1.5 rounded animate-pulse text-center">Klik zona tujuan...</div>
        )}

        {/* Drawing indicator */}
        {(mode === 'freePolygon' || mode === 'freeLine') && drawingPoints.length > 0 && (
          <button onClick={finishDrawing} className="bg-green-500/15 border border-green-500/40 text-green-400 font-bold py-1.5 rounded cursor-pointer hover:bg-green-500/25 transition-colors">
            ✓ Selesaikan ({drawingPoints.length} titik)
          </button>
        )}

        {/* Zone Palette */}
        {(mode === 'addZone' || mode === 'freePolygon') && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Palet Zona</span>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(ZONE_CATALOG) as ZoneCategory[]).map(cat => {
                const s = ZONE_CATALOG[cat];
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`py-1 px-1.5 rounded font-mono font-bold border transition-all cursor-pointer text-left flex items-center gap-1 ${activeCategory === cat ? 'ring-1 ring-white/30 scale-[1.02]' : 'opacity-50 hover:opacity-100'}`}
                    style={{ backgroundColor: s.fill, borderColor: s.stroke, color: s.stroke }}>
                    <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: s.stroke }} />{s.label}
                  </button>
                );
              })}
            </div>
            {mode === 'addZone' && (
              <div className="flex gap-1 mt-0.5">
                <span className="text-slate-500 font-mono self-center">Bentuk:</span>
                <button onClick={() => setActiveShape('rect')} className={`p-1 rounded border cursor-pointer ${activeShape === 'rect' ? 'border-cyber-cyan text-cyber-cyan' : 'border-slate-700 text-slate-500'}`}><Square className="w-3 h-3" /></button>
                <button onClick={() => setActiveShape('ellipse')} className={`p-1 rounded border cursor-pointer ${activeShape === 'ellipse' ? 'border-cyber-cyan text-cyber-cyan' : 'border-slate-700 text-slate-500'}`}><Circle className="w-3 h-3" /></button>
              </div>
            )}
          </div>
        )}

        {/* Connection Style */}
        {(mode === 'connect' || mode === 'freeLine') && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Gaya Garis</span>
            {(Object.keys(CONN_STYLES) as ConnStyle[]).map(cs => {
              const s = CONN_STYLES[cs];
              return (
                <button key={cs} onClick={() => setActiveConnStyle(cs)}
                  className={`py-1 px-2 rounded font-mono font-bold border flex items-center gap-2 cursor-pointer transition-all ${activeConnStyle === cs ? 'ring-1 ring-white/20' : 'opacity-40 hover:opacity-100'}`}
                  style={{ borderColor: s.color, color: s.color }}>
                  <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} /></svg>
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Properties Panel */}
        {selectedZone && mode === 'select' && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Properti Zona</span>
            <input value={selectedZone.label} onChange={e => updateZone(selectedZone.id, { label: e.target.value })} className="bg-black/40 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none focus:border-cyber-cyan" />
            <div className="flex gap-1.5">
              <label className="flex-1 flex flex-col gap-0.5"><span className="text-slate-500">W</span><input type="number" value={Math.round(selectedZone.w)} onChange={e => updateZone(selectedZone.id, { w: Number(e.target.value) })} className="bg-black/40 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono outline-none focus:border-cyber-cyan w-full" /></label>
              <label className="flex-1 flex flex-col gap-0.5"><span className="text-slate-500">H</span><input type="number" value={Math.round(selectedZone.h)} onChange={e => updateZone(selectedZone.id, { h: Number(e.target.value) })} className="bg-black/40 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono outline-none focus:border-cyber-cyan w-full" /></label>
            </div>
            
            {/* Lock Area Section */}
            <div className="flex flex-col gap-1 p-1.5 bg-slate-800/40 rounded border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[8px] font-mono uppercase flex items-center gap-1">
                  {selectedZone.lockArea ? <Lock className="w-2.5 h-2.5 text-cyber-cyan" /> : <Unlock className="w-2.5 h-2.5" />}
                  Kunci Luas Zona
                </span>
                <button 
                  onClick={() => updateZone(selectedZone.id, { lockArea: !selectedZone.lockArea })} 
                  className={`w-8 h-4 rounded-full transition-all cursor-pointer relative ${selectedZone.lockArea ? 'bg-cyber-cyan' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedZone.lockArea ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex gap-1 items-center">
                <input 
                  type="number" 
                  placeholder="Target luas (m²)" 
                  value={selectedZone.lockedArea || ''} 
                  onChange={e => {
                    const newArea = Number(e.target.value);
                    if (newArea > 0 && selectedZone.lockArea) {
                      applyTargetArea(selectedZone, newArea);
                    } else {
                      updateZone(selectedZone.id, { lockedArea: newArea > 0 ? newArea : undefined });
                    }
                  }} 
                  className={`flex-1 bg-black/40 border rounded px-2 py-0.5 text-white font-mono text-[9px] outline-none ${selectedZone.lockArea ? 'border-cyber-cyan/60 focus:border-cyber-cyan' : 'border-slate-700 focus:border-slate-500'}`}
                />
                <span className="text-slate-500 text-[8px] font-mono shrink-0">m²</span>
              </div>
              {selectedZone.lockArea && selectedZone.lockedArea && (
                <div className="text-[8px] font-mono text-cyber-cyan/70 flex items-center gap-1">
                  <Lock className="w-2 h-2" />
                  Visual dikunci ke {selectedZone.lockedArea} m²
                </div>
              )}
              <button 
                onClick={() => {
                  const currentArea = Math.round(selectedZone.w * selectedZone.h * scaleMeters * scaleMeters);
                  updateZone(selectedZone.id, { lockedArea: currentArea, lockArea: true });
                }}
                className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 text-[7px] font-mono rounded cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Gunakan Ukuran Saat Ini
              </button>
            </div>

            <div className="flex gap-1">
              <button onClick={() => updateZone(selectedZone.id, { shape: 'rect' })} className={`flex-1 py-0.5 rounded border font-bold cursor-pointer ${selectedZone.shape === 'rect' ? 'border-cyber-cyan text-cyber-cyan' : 'border-slate-700 text-slate-500'}`}>Kotak</button>
              <button onClick={() => updateZone(selectedZone.id, { shape: 'ellipse' })} className={`flex-1 py-0.5 rounded border font-bold cursor-pointer ${selectedZone.shape === 'ellipse' ? 'border-cyber-cyan text-cyber-cyan' : 'border-slate-700 text-slate-500'}`}>Elips</button>
            </div>
            <label className="flex flex-col gap-0.5"><span className="text-slate-500">Warna Kustom</span>
              <input type="color" value={selectedZone.customStroke || ZONE_CATALOG[selectedZone.category].stroke} onChange={e => updateZone(selectedZone.id, { customStroke: e.target.value, customFill: e.target.value + '30' })} className="w-full h-5 cursor-pointer rounded border border-slate-700" />
            </label>
            <div className="text-slate-400 font-mono">
              Luas: <span className="text-white font-bold">{(selectedZone.w * selectedZone.h * scaleMeters * scaleMeters).toFixed(0)} m²</span>
              {selectedZone.lockedArea && selectedZone.lockArea && (
                <span className="text-cyber-cyan"> / target: {selectedZone.lockedArea} m²</span>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={handleDuplicate} className="flex-1 bg-cyan-900/20 border border-cyan-900/40 text-cyan-400 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-cyan-900/30"><Copy className="w-2.5 h-2.5" /> Duplikat</button>
              <button onClick={() => handleDelete(selectedZone.id)} className="flex-1 bg-red-900/20 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><Trash2 className="w-2.5 h-2.5" /> Hapus</button>
            </div>
          </div>
        )}

        {selectedConn && mode === 'select' && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Properti Koneksi</span>
            <input value={selectedConn.label} onChange={e => updateConn(selectedConn.id, { label: e.target.value })} placeholder="Label (opsional)" className="bg-black/40 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none focus:border-cyber-cyan" />
            <div className="flex gap-1">
              {(Object.keys(CONN_STYLES) as ConnStyle[]).map(cs => (
                <button key={cs} onClick={() => updateConn(selectedConn.id, { style: cs })} className={`flex-1 py-0.5 rounded border font-bold cursor-pointer ${selectedConn.style === cs ? 'ring-1 ring-white/20' : 'opacity-40'}`} style={{ borderColor: CONN_STYLES[cs].color, color: CONN_STYLES[cs].color }}>{CONN_STYLES[cs].label.charAt(0)}</button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer"><input type="checkbox" checked={selectedConn.hasArrow} onChange={e => updateConn(selectedConn.id, { hasArrow: e.target.checked })} className="accent-cyber-cyan cursor-pointer" />Panah arah</label>
            <button onClick={() => handleDelete(selectedConn.id)} className="bg-red-900/20 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><Trash2 className="w-2.5 h-2.5" /> Hapus</button>
          </div>
        )}

        {selectedEntrance && mode === 'select' && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Entrance</span>
            <input value={selectedEntrance.label} onChange={e => updateEntrance(selectedEntrance.id, { label: e.target.value })} className="bg-black/40 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none focus:border-cyber-cyan" />
            <button onClick={() => handleDelete(selectedEntrance.id)} className="bg-red-900/20 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><Trash2 className="w-2.5 h-2.5" /> Hapus</button>
          </div>
        )}

        {selectedFP && mode === 'select' && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Poligon Bebas</span>
            <input value={selectedFP.label} onChange={e => updateFP(selectedFP.id, { label: e.target.value })} className="bg-black/40 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none focus:border-cyber-cyan" />
            <label className="flex flex-col gap-0.5"><span className="text-slate-500">Warna</span>
              <input type="color" value={selectedFP.customStroke || ZONE_CATALOG[selectedFP.category].stroke} onChange={e => updateFP(selectedFP.id, { customStroke: e.target.value, customFill: e.target.value + '30' })} className="w-full h-5 cursor-pointer rounded border border-slate-700" />
            </label>
            <div className="text-slate-400 font-mono">Luas: <span className="text-white font-bold">{(shoelaceArea(selectedFP.points) * scaleMeters * scaleMeters).toFixed(0)} m²</span></div>
            <button onClick={() => handleDelete(selectedFP.id)} className="bg-red-900/20 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><Trash2 className="w-2.5 h-2.5" /> Hapus</button>
          </div>
        )}

        {selectedFL && mode === 'select' && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Garis Bebas</span>
            <input value={selectedFL.label} onChange={e => updateFL(selectedFL.id, { label: e.target.value })} placeholder="Label garis" className="bg-black/40 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none focus:border-cyber-cyan" />
            <button onClick={() => handleDelete(selectedFL.id)} className="bg-red-900/20 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><Trash2 className="w-2.5 h-2.5" /> Hapus</button>
          </div>
        )}

        {selectedAnnotation && mode === 'select' && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
            <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Anotasi</span>
            <input value={selectedAnnotation.text} onChange={e => updateAnnotation(selectedAnnotation.id, { text: e.target.value })} className="bg-black/40 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none focus:border-cyber-cyan" />
            <button onClick={() => handleDelete(selectedAnnotation.id)} className="bg-red-900/20 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><Trash2 className="w-2.5 h-2.5" /> Hapus</button>
          </div>
        )}

        {/* Settings */}
        <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
          <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Pengaturan</span>
          <label className="flex items-center justify-between text-slate-400 cursor-pointer"><span>Tampilkan Grid</span><input type="checkbox" checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} className="accent-cyber-cyan cursor-pointer" /></label>
          <label className="flex items-center justify-between text-slate-400 cursor-pointer"><span>Legenda</span><input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="accent-cyber-cyan cursor-pointer" /></label>
          <label className="flex items-center justify-between text-slate-400">
            <span>Skala (m/unit)</span>
            <input type="number" step="0.1" min="0.1" value={scaleMeters} onChange={e => setScaleMeters(Number(e.target.value))} className="w-14 bg-black/40 border border-slate-700 rounded px-1 py-0.5 text-white font-mono outline-none focus:border-cyber-cyan text-right" />
          </label>
        </div>

        {/* Templates */}
        <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2">
          <span className="font-mono text-slate-500 uppercase font-bold tracking-wider">Template Preset</span>
          <div className="flex flex-col gap-1">
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button key={key} onClick={() => loadTemplate(key)} className="py-1 px-2 rounded border border-slate-700/50 text-slate-400 font-mono font-bold hover:border-cyber-cyan/50 hover:text-cyber-cyan cursor-pointer transition-all text-left">{t.name}</button>
            ))}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-2 mt-auto">
          <div className="font-mono text-slate-500">
            <span>Zona: <span className="text-white">{zones.length + freePolygons.length}</span></span>
            <span className="mx-1">|</span>
            <span>Koneksi: <span className="text-white">{connections.length}</span></span>
          </div>
          {totalArea > 0 && <div className="font-mono text-slate-500">Total Luas: <span className="text-cyber-cyan font-bold">{totalArea.toFixed(0)} m²</span></div>}
          {zones.length > 0 && (
            <button
              onClick={() => setShowAreaPanel(v => !v)}
              className={`py-1 px-2 rounded border font-bold flex items-center gap-1 cursor-pointer transition-all ${showAreaPanel ? 'bg-cyber-cyan/15 border-cyber-cyan/50 text-cyber-cyan' : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:text-slate-200'}`}
            >
              <BarChart2 className="w-3 h-3" />
              <span className="text-[8px] font-mono uppercase">Program Luas Zona</span>
            </button>
          )}
          <div className="flex gap-1">
            <button onClick={handleExportSVG} className="flex-1 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-cyber-cyan/20 transition-colors"><Download className="w-2.5 h-2.5" />SVG</button>
            <button onClick={handleExportPNG} className="flex-1 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-cyber-cyan/20 transition-colors"><Image className="w-2.5 h-2.5" />PNG</button>
          </div>
          <button onClick={handleClear} className="bg-red-900/15 border border-red-900/40 text-red-500 font-bold py-1 rounded flex justify-center items-center gap-1 cursor-pointer hover:bg-red-900/30"><RotateCcw className="w-2.5 h-2.5" /> Reset</button>
        </div>

        {/* Keyboard Hints */}
        <div className="text-[7px] font-mono text-slate-600 leading-relaxed border-t border-slate-800 pt-1.5">
          <span className="text-slate-500 font-bold">Shortcuts:</span> Ctrl+Z Undo · Ctrl+Y Redo · Ctrl+D Duplikat · Del Hapus · Esc Batal · Space+Drag Pan · Scroll Zoom
        </div>
      </div>

      {/* ==================== SVG CANVAS ==================== */}
      <div className="flex-grow relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 50%, #061126 0%, #020617 70%)' }}>
        <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full" preserveAspectRatio="xMidYMid meet"
          style={{ cursor: spaceRef.current || panRef.current ? 'grabbing' : mode === 'addZone' ? 'crosshair' : mode === 'connect' ? 'pointer' : mode === 'freePolygon' || mode === 'freeLine' ? 'crosshair' : mode === 'entrance' ? 'cell' : mode === 'annotate' ? 'text' : 'default' }}
          onPointerDown={onSvgPointerDown} onPointerMove={onSvgPointerMove} onPointerUp={onSvgPointerUp} onPointerLeave={onSvgPointerUp}>

          <defs>
            <pattern id="dGrid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.5" />
            </pattern>
            <pattern id="dGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5" />
            </pattern>
            <marker id="aSolid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" /></marker>
            <marker id="aDashed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316" /></marker>
            <marker id="aDotted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" /></marker>
          </defs>

          {/* Background */}
          <rect x={viewBox.x - 500} y={viewBox.y - 500} width={viewBox.w + 1000} height={viewBox.h + 1000} fill="#020617" />
          {snapEnabled && (
            <>
              <rect x={viewBox.x - 500} y={viewBox.y - 500} width={viewBox.w + 1000} height={viewBox.h + 1000} fill="url(#dGrid)" />
              <rect x={viewBox.x - 500} y={viewBox.y - 500} width={viewBox.w + 1000} height={viewBox.h + 1000} fill="url(#dGridMajor)" />
            </>
          )}
          {/* Canvas boundary */}
          {snapEnabled && <rect x="0" y="0" width={VB_W} height={VB_H} fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="8 4" />}

          {/* Clickable background for placing elements */}
          <rect x={viewBox.x - 500} y={viewBox.y - 500} width={viewBox.w + 1000} height={viewBox.h + 1000} fill="transparent" onClick={onBackgroundClick} />

          {/* Free Polygons */}
          {freePolygons.map(fp => {
            const col = getZoneColors(fp);
            const isSel = fp.id === selectedId;
            const c = centroid(fp.points);
            const pts = fp.points.map(p => `${p.x},${p.y}`).join(' ');
            return (
              <g key={fp.id} onClick={e => { e.stopPropagation(); if (mode === 'select') setSelectedId(fp.id); }} style={{ cursor: 'pointer' }}>
                <polygon points={pts} fill={col.fill} stroke={col.stroke} strokeWidth={isSel ? 3 : 1.5} style={{ filter: `drop-shadow(0 0 ${isSel ? '10px' : '4px'} ${col.glow})` }} />
                <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central" fill={col.stroke} fontSize="11" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}>{fp.label}</text>
                <text x={c.x} y={c.y + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" style={{ pointerEvents: 'none' }}>{(shoelaceArea(fp.points) * scaleMeters * scaleMeters).toFixed(0)} m²</text>
              </g>
            );
          })}

          {/* Free Lines */}
          {freeLines.map(fl => {
            const isSel = fl.id === selectedId;
            const pts = fl.points.map(p => `${p.x},${p.y}`).join(' ');
            const cs = CONN_STYLES[fl.style];
            return (
              <g key={fl.id}>
                <polyline points={pts} fill="none" stroke="transparent" strokeWidth="12" onClick={e => { e.stopPropagation(); if (mode === 'select') setSelectedId(fl.id); }} style={{ cursor: 'pointer' }} />
                <polyline points={pts} fill="none" stroke={fl.color} strokeWidth={isSel ? 3 : 2} strokeDasharray={cs.dash} strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: `drop-shadow(0 0 ${isSel ? '8px' : '4px'} ${fl.color})`, pointerEvents: 'none' }} />
                {fl.label && fl.points.length >= 2 && (
                  <text x={(fl.points[0].x + fl.points[fl.points.length - 1].x) / 2} y={(fl.points[0].y + fl.points[fl.points.length - 1].y) / 2 - 8}
                    textAnchor="middle" fill={fl.color} fontSize="9" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}>{fl.label}</text>
                )}
              </g>
            );
          })}

          {/* Connections */}
          {connections.map(conn => {
            const fz = zones.find(z => z.id === conn.from);
            const tz = zones.find(z => z.id === conn.to);
            if (!fz || !tz) return null;
            const f = getZoneCenter(fz);
            const t = getZoneCenter(tz);
            const cs = CONN_STYLES[conn.style];
            const isSel = conn.id === selectedId;
            return (
              <g key={conn.id}>
                <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth="14" onClick={e => { e.stopPropagation(); if (mode === 'select') setSelectedId(conn.id); }} style={{ cursor: 'pointer' }} />
                <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={cs.color} strokeWidth={isSel ? 3 : 2} strokeDasharray={cs.dash} strokeLinecap="round"
                  markerEnd={conn.hasArrow ? `url(#a${conn.style.charAt(0).toUpperCase() + conn.style.slice(1)})` : undefined}
                  style={{ filter: `drop-shadow(0 0 ${isSel ? '8px' : '4px'} ${cs.color})`, pointerEvents: 'none' }} />
                {conn.label && (
                  <text x={(f.x + t.x) / 2} y={(f.y + t.y) / 2 - 8} textAnchor="middle" fill={cs.color} fontSize="9" fontFamily="monospace" fontWeight="bold"
                    style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}>{conn.label}</text>
                )}
              </g>
            );
          })}

          {/* Zones */}
          {zones.map(z => {
            const col = getZoneColors(z);
            const isSel = z.id === selectedId;
            const isFrom = connectFrom === z.id;
            const st = isFrom ? '#eab308' : col.stroke;
            const sw = isSel || isFrom ? 3 : 1.5;
            const sd = isFrom ? '6 3' : 'none';
            const areaTxt = (z.w * z.h * scaleMeters * scaleMeters).toFixed(0);
            return (
              <g key={z.id} onPointerDown={e => onZonePointerDown(e, z)} onClick={e => onZoneClick(e, z)}
                style={{ cursor: mode === 'select' ? (drag?.id === z.id ? 'grabbing' : 'grab') : 'pointer' }}>
                {z.shape === 'rect' ? (
                  <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="6" fill={col.fill} stroke={st} strokeWidth={sw} strokeDasharray={sd} style={{ filter: `drop-shadow(0 0 ${isSel ? '12px' : '5px'} ${col.glow})`, transition: 'filter 0.2s' }} />
                ) : (
                  <ellipse cx={z.x + z.w / 2} cy={z.y + z.h / 2} rx={z.w / 2} ry={z.h / 2} fill={col.fill} stroke={st} strokeWidth={sw} strokeDasharray={sd} style={{ filter: `drop-shadow(0 0 ${isSel ? '12px' : '5px'} ${col.glow})`, transition: 'filter 0.2s' }} />
                )}
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 5} textAnchor="middle" dominantBaseline="central" fill={col.stroke} fontSize="11" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }}>{z.label}</text>
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="monospace" style={{ pointerEvents: 'none' }}>{areaTxt} m²</text>
                {/* Lock indicator badge */}
                {z.lockArea && z.lockedArea && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={z.x + z.w - 18} y={z.y + 3} width="15" height="11" rx="2" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" strokeWidth="0.8" />
                    <text x={z.x + z.w - 10.5} y={z.y + 11} textAnchor="middle" fill="#06b6d4" fontSize="8" fontFamily="monospace" fontWeight="bold">⚿</text>
                  </g>
                )}
                {/* Resize handles */}
                {isSel && mode === 'select' && ['nw', 'ne', 'sw', 'se'].map(h => {
                  const hx = h.includes('w') ? z.x : z.x + z.w;
                  const hy = h.includes('n') ? z.y : z.y + z.h;
                  return (
                    <circle key={h} cx={hx} cy={hy} r={5} fill="#06b6d4" stroke="white" strokeWidth="1.5"
                      style={{ cursor: h === 'nw' || h === 'se' ? 'nwse-resize' : 'nesw-resize', filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.8))' }}
                      onPointerDown={e => onResizePointerDown(e, z, h)} />
                  );
                })}
                {/* Selection outline */}
                {isSel && z.shape === 'rect' && <rect x={z.x - 2} y={z.y - 2} width={z.w + 4} height={z.h + 4} rx="8" fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.35" style={{ pointerEvents: 'none' }} />}
                {isSel && z.shape === 'ellipse' && <ellipse cx={z.x + z.w / 2} cy={z.y + z.h / 2} rx={z.w / 2 + 2} ry={z.h / 2 + 2} fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.35" style={{ pointerEvents: 'none' }} />}
              </g>
            );
          })}

          {/* Entrances */}
          {entrances.map(en => {
            const isSel = en.id === selectedId;
            return (
              <g key={en.id} onClick={e => { e.stopPropagation(); if (mode === 'select') setSelectedId(en.id); }} style={{ cursor: 'pointer' }}>
                <circle cx={en.x} cy={en.y} r={isSel ? 13 : 11} fill="rgba(234,179,8,0.12)" stroke="#eab308" strokeWidth={isSel ? 2.5 : 1.5} style={{ filter: `drop-shadow(0 0 ${isSel ? '10px' : '4px'} rgba(234,179,8,0.6))` }} />
                <circle cx={en.x} cy={en.y} r="3.5" fill="#eab308" />
                <text x={en.x} y={en.y + 20} textAnchor="middle" fill="#eab308" fontSize="8" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}>{en.label}</text>
              </g>
            );
          })}

          {/* Annotations */}
          {annotations.map(ann => {
            const isSel = ann.id === selectedId;
            return (
              <g key={ann.id} onClick={e => { e.stopPropagation(); if (mode === 'select') setSelectedId(ann.id); }} style={{ cursor: 'pointer' }}>
                <rect x={ann.x - 4} y={ann.y - 10} width={Math.max(40, ann.text.length * 6 + 12)} height="18" rx="3" fill="rgba(168,85,247,0.15)" stroke={isSel ? '#a855f7' : 'rgba(168,85,247,0.35)'} strokeWidth={isSel ? 2 : 1} />
                <text x={ann.x + 2} y={ann.y + 2} fill="#c4b5fd" fontSize="9" fontFamily="monospace" fontWeight="bold" style={{ pointerEvents: 'none' }}>{ann.text}</text>
              </g>
            );
          })}

          {/* Drawing preview */}
          {drawingPoints.length > 0 && (
            <g>
              <polyline points={drawingPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={mode === 'freePolygon' ? ZONE_CATALOG[activeCategory].fill : 'none'}
                stroke={mode === 'freePolygon' ? ZONE_CATALOG[activeCategory].stroke : CONN_STYLES[activeConnStyle].color}
                strokeWidth="2" strokeDasharray="6 4" opacity="0.7" style={{ pointerEvents: 'none' }} />
              {drawingPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" opacity="0.7" style={{ pointerEvents: 'none' }} />)}
            </g>
          )}

          {/* Alignment Guides */}
          {guides.map((g, i) => (
            g.type === 'v'
              ? <line key={i} x1={g.pos} y1={viewBox.y} x2={g.pos} y2={viewBox.y + viewBox.h} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" style={{ pointerEvents: 'none' }} />
              : <line key={i} x1={viewBox.x} y1={g.pos} x2={viewBox.x + viewBox.w} y2={g.pos} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" style={{ pointerEvents: 'none' }} />
          ))}

          {/* Legend */}
          {showLegend && usedCategories.length > 0 && (
            <g transform={`translate(${viewBox.x + viewBox.w - 170}, ${viewBox.y + 15})`}>
              <rect x="-8" y="-8" width="170" height={usedCategories.length * 18 + 28} rx="4" fill="rgba(2,6,23,0.88)" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
              <text x="0" y="6" fill="#06b6d4" fontSize="9" fontFamily="monospace" fontWeight="bold">LEGENDA</text>
              {usedCategories.map((cat, i) => (
                <g key={cat} transform={`translate(0, ${i * 18 + 20})`}>
                  <rect width="10" height="10" rx="2" fill={ZONE_CATALOG[cat].fill} stroke={ZONE_CATALOG[cat].stroke} strokeWidth="1.5" />
                  <text x="15" y="9" fill="white" fontSize="8" fontFamily="monospace">{ZONE_CATALOG[cat].label}</text>
                  <text x="150" y="9" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace" textAnchor="end">{(areaByCategory[cat] || 0).toFixed(0)} m²</text>
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* ==================== AREA PROGRAMMING PANEL ==================== */}
        {showAreaPanel && zones.length > 0 && (
          <div className="absolute top-3 left-3 z-30 bg-slate-900/95 border border-cyber-cyan/30 rounded-xl shadow-2xl w-[320px] max-h-[calc(100%-24px)] flex flex-col overflow-hidden backdrop-blur-sm">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/60 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-cyber-cyan" />
                <span className="font-mono text-cyber-cyan text-[10px] font-bold uppercase tracking-widest">Program Luas Zona</span>
              </div>
              <button onClick={() => setShowAreaPanel(false)} className="text-slate-500 hover:text-white cursor-pointer text-xs font-bold px-1">✕</button>
            </div>

            {/* Total bar */}
            <div className="px-3 py-2 border-b border-slate-800 shrink-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-slate-400 text-[8px] uppercase">Total Luas</span>
                <span className="font-mono text-cyber-cyan font-bold text-[10px]">{totalArea.toFixed(0)} m²</span>
              </div>
              {/* Stacked bar */}
              <div className="h-3 rounded-full overflow-hidden flex bg-slate-800">
                {usedCategories.map(cat => {
                  const pct = totalArea > 0 ? ((areaByCategory[cat] || 0) / totalArea) * 100 : 0;
                  return pct > 0 ? (
                    <div key={cat} style={{ width: `${pct}%`, backgroundColor: ZONE_CATALOG[cat].stroke + '99' }} title={`${ZONE_CATALOG[cat].label}: ${pct.toFixed(1)}%`} />
                  ) : null;
                })}
              </div>
            </div>

            {/* Zone list */}
            <div className="overflow-y-auto flex-1 px-3 py-2 flex flex-col gap-1.5">
              {zones.map(z => {
                const col = ZONE_CATALOG[z.category];
                const currentArea = Math.round(z.w * z.h * scaleMeters * scaleMeters);
                const pct = totalArea > 0 ? (currentArea / totalArea) * 100 : 0;
                return (
                  <div key={z.id} className={`rounded-lg border p-2 flex flex-col gap-1.5 transition-all ${z.lockArea ? 'border-cyber-cyan/40 bg-cyber-cyan/5' : 'border-slate-700/50 bg-slate-800/30'}`}>
                    {/* Zone header */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: col.stroke }} />
                      <span className="font-mono text-white text-[9px] font-bold flex-1 truncate">{z.label}</span>
                      <span className="font-mono text-slate-500 text-[8px]">{col.label}</span>
                      <button
                        onClick={() => {
                          updateZone(z.id, { lockArea: !z.lockArea });
                          if (!z.lockArea && !z.lockedArea) {
                            updateZone(z.id, { lockedArea: currentArea, lockArea: true });
                          }
                        }}
                        className={`p-0.5 rounded cursor-pointer transition-colors ${z.lockArea ? 'text-cyber-cyan' : 'text-slate-600 hover:text-slate-400'}`}
                        title={z.lockArea ? 'Buka kunci luas' : 'Kunci luas'}
                      >
                        {z.lockArea ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Area bar */}
                    <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: col.stroke }} />
                    </div>

                    {/* Area input row */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 flex items-center gap-1 bg-black/40 border border-slate-700 rounded px-1.5 py-0.5 focus-within:border-cyber-cyan/60 transition-colors">
                        <input
                          type="number"
                          min="1"
                          value={z.lockedArea ?? currentArea}
                          onChange={e => {
                            const val = Number(e.target.value);
                            if (val > 0) {
                              applyTargetArea(z, val);
                            }
                          }}
                          onBlur={() => triggerSnapshot()}
                          className="flex-1 bg-transparent text-white font-mono text-[9px] outline-none w-0 min-w-0"
                        />
                        <span className="text-slate-500 text-[8px] font-mono shrink-0">m²</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[8px] shrink-0 w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>

                    {/* Lock status */}
                    {z.lockArea && z.lockedArea && (
                      <div className="text-[7px] font-mono text-cyber-cyan/60 flex items-center gap-1">
                        <Lock className="w-2 h-2" />
                        Dikunci: {z.lockedArea} m² · Aktual: {currentArea} m²
                        {Math.abs(currentArea - z.lockedArea) > 2 && (
                          <button
                            onClick={() => applyTargetArea(z, z.lockedArea!)}
                            className="ml-auto text-cyber-cyan/80 hover:text-cyber-cyan cursor-pointer underline"
                          >
                            Terapkan
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="px-3 py-2 border-t border-slate-800 shrink-0 flex gap-1.5">
              <button
                onClick={() => {
                  zones.forEach(z => {
                    const area = Math.round(z.w * z.h * scaleMeters * scaleMeters);
                    updateZone(z.id, { lockedArea: area, lockArea: true });
                  });
                  triggerSnapshot();
                }}
                className="flex-1 py-1 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-[8px] font-mono font-bold rounded cursor-pointer hover:bg-cyber-cyan/20 transition-colors flex items-center justify-center gap-1"
              >
                <Lock className="w-2.5 h-2.5" /> Kunci Semua
              </button>
              <button
                onClick={() => {
                  zones.forEach(z => updateZone(z.id, { lockArea: false, lockedArea: undefined }));
                  triggerSnapshot();
                }}
                className="flex-1 py-1 bg-slate-800/60 border border-slate-700/50 text-slate-400 text-[8px] font-mono font-bold rounded cursor-pointer hover:bg-slate-700/60 transition-colors flex items-center justify-center gap-1"
              >
                <Unlock className="w-2.5 h-2.5" /> Buka Semua
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoningProgrammer;
