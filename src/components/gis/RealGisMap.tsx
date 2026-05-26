'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Activity, ShieldAlert, RotateCcw, Upload, MousePointer, Download, Sliders, Box } from 'lucide-react';

interface RealGisMapProps {
  showZoning: boolean;
  showTransit: boolean;
  showHazard: boolean;
  onMoveMap?: (lng: number, lat: number) => void;
  toggleZoning?: () => void;
  toggleTransit?: () => void;
  toggleHazard?: () => void;
}

type DrawMode = 'none' | 'point' | 'line' | 'polygon';

export const RealGisMap: React.FC<RealGisMapProps> = ({
  showZoning,
  showTransit,
  showHazard,
  onMoveMap,
  toggleZoning,
  toggleTransit,
  toggleHazard,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // State untuk Basemap Style & Viewport
  const [selectedStyle, setSelectedStyle] = useState<'dark' | 'light' | 'voyager'>('dark');

  const styleUrls = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  };

  const BASEMAP_STYLES = [
    { id: 'dark', name: 'Dark Matter', url: styleUrls.dark },
    { id: 'light', name: 'Positron', url: styleUrls.light },
    { id: 'voyager', name: 'Voyager', url: styleUrls.voyager }
  ];

  // Ref untuk menyimpan viewport saat ini (center, zoom, pitch, bearing)
  const viewportRef = useRef({
    center: [110.3688, -7.7972] as [number, number],
    zoom: 11.5,
    pitch: 35,
    bearing: -5
  });

  // State local telemetry untuk koordinat dan zoom level
  const [currentCoords, setCurrentCoords] = useState<{ lng: number; lat: number }>({
    lng: 110.3688,
    lat: -7.7972,
  });
  const [currentZoom, setCurrentZoom] = useState<number>(11.5);
  const [is3D, setIs3D] = useState<boolean>(true);

  // State untuk restore marker pencarian ketika map re-init
  const [searchMarkerCoords, setSearchMarkerCoords] = useState<{ lng: number; lat: number } | null>(null);

  // State untuk opacity/transparansi layer kustom
  const [zoningOpacity, setZoningOpacity] = useState<number>(0.25);
  const [transitOpacity, setTransitOpacity] = useState<number>(0.8);
  const [hazardOpacity, setHazardOpacity] = useState<number>(0.25);

  // Helper kalkulasi skala numerik
  const calculateNumericalScale = (lat: number, zoom: number) => {
    const resolution = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
    // 96 DPI: 1px = 0.000264583 meter
    const scale = resolution / 0.000264583;
    return Math.round(scale);
  };

  const formatScale = (scaleNum: number) => {
    return `1 : ${scaleNum.toLocaleString('id-ID')}`;
  };

  // State untuk pencarian & SUGGESTION HUD
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchedPlaceName, setSearchedPlaceName] = useState<string | null>(null);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

  const localSuggestions = [
    { name: 'Tugu Yogyakarta', coords: [110.3671, -7.7829] },
    { name: 'Jalan Malioboro', coords: [110.3658, -7.7926] },
    { name: 'Kraton Yogyakarta', coords: [110.3642, -7.8052] },
    { name: 'Candi Prambanan', coords: [110.4925, -7.7520] },
    { name: 'Kaliurang Merapi', coords: [110.4262, -7.5960] }
  ];

  // State untuk mode menggambar spasial
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [drawnLine, setDrawnLine] = useState<[number, number][]>([]);
  const [drawnPolygon, setDrawnPolygon] = useState<[number, number][]>([]);

  // State Analisis Tapak & Masterplan Prosedural
  const [siteArea, setSiteArea] = useState<number | null>(null);
  const [siteStats, setSiteStats] = useState<{ buildings: number; amenities: number; highway: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProceduralGenerated, setIsProceduralGenerated] = useState(false);

  // State untuk file GeoJSON yang diunggah
  const [uploadedGeojson, setUploadedGeojson] = useState<any>(null);

  // Gunakan Ref agar Event Listener MapLibre selalu mendapatkan state gambar terupdate
  const drawModeRef = useRef<DrawMode>('none');
  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  // 1a. Metode Navigasi Terbang & Pencarian Lokasi
  const flyToLocation = (lng: number, lat: number, name: string) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Bersihkan marker pencarian lama jika ada
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    // Buat marker baru
    const marker = new maplibregl.Marker({ color: '#EF4444' })
      .setLngLat([lng, lat])
      .addTo(map);
    
    searchMarkerRef.current = marker;
    setSearchMarkerCoords({ lng, lat });
    setSearchedPlaceName(name);
    setSearchQuery(name);

    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      speed: 1.2,
      essential: true
    });
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    // Cek sugesti Yogyakarta lokal untuk kecepatan offline
    const localMatch = localSuggestions.find(s => 
      s.name.toLowerCase().includes(query.toLowerCase())
    );
    if (localMatch) {
      flyToLocation(localMatch.coords[0], localMatch.coords[1], localMatch.name);
      return;
    }

    // Gunakan Nominatim OSM API secara asinkron
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',')[0];
        flyToLocation(lon, lat, displayName);
      } else {
        alert('Lokasi tidak ditemukan. Coba ketik nama kota/tempat lain.');
      }
    } catch (err) {
      console.error('Error geocoding:', err);
      alert('Gagal menghubungi server pencarian. Pastikan Anda terhubung ke internet.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    setSearchMarkerCoords(null);
    setSearchedPlaceName(null);
    setSearchQuery('');
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [110.3688, -7.7972],
        zoom: 11.5,
        pitch: 35,
        bearing: -5,
        speed: 1.2,
        essential: true
      });
    }
  };

  // 1b. Aksesibilitas: Pintasan Keyboard untuk Mengontrol Lapisan & Kamera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan shortcut jika user sedang memfokuskan form pencarian
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'z' && toggleZoning) {
        toggleZoning();
      } else if (key === 't' && toggleTransit) {
        toggleTransit();
      } else if (key === 'h' && toggleHazard) {
        toggleHazard();
      } else if (key === 'escape') {
        handleClearSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleZoning, toggleTransit, toggleHazard]);

  // 1. Inisialisasi Peta Geografis MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;
    setMapLoaded(false);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrls[selectedStyle],
      center: viewportRef.current.center,
      zoom: viewportRef.current.zoom,
      pitch: viewportRef.current.pitch,
      bearing: viewportRef.current.bearing,
      attributionControl: false,
      preserveDrawingBuffer: true,
    } as any);

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    const scale = new maplibregl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    });
    map.addControl(scale, 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);

      // Restore search marker jika ada
      if (searchMarkerCoords) {
        const marker = new maplibregl.Marker({ color: '#EF4444' })
          .setLngLat([searchMarkerCoords.lng, searchMarkerCoords.lat])
          .addTo(map);
        searchMarkerRef.current = marker;
      }

      // A. Layer Preset Default (Zoning, Transit, Hazard)
      // 1. Hazard Source & Layer
      map.addSource('hazard-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Zona Risiko Tinggi Sungai Code' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [110.3620, -7.7700],
                    [110.3690, -7.7700],
                    [110.3730, -7.8200],
                    [110.3640, -7.8200],
                    [110.3620, -7.7700]
                  ]
                ]
              }
            }
          ]
        }
      });
      map.addLayer({
        id: 'hazard-layer',
        type: 'fill',
        source: 'hazard-source',
        paint: {
          'fill-color': '#EF4444',
          'fill-opacity': 0.25,
          'fill-outline-color': '#EF4444'
        },
        layout: { visibility: showHazard ? 'visible' : 'none' }
      });

      // 2. Transit Source & Layer
      map.addSource('transit-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'LRT Sleman-Tugu' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [110.3550, -7.7500],
                  [110.3688, -7.7800],
                  [110.3688, -7.8000],
                  [110.3800, -7.8300]
                ]
              }
            }
          ]
        }
      });
      map.addLayer({
        id: 'transit-layer',
        type: 'line',
        source: 'transit-source',
        paint: {
          'line-color': '#A78BFA',
          'line-width': 4,
          'line-opacity': 0.8
        },
        layout: { visibility: showTransit ? 'visible' : 'none' }
      });

      // Transit Nodes
      map.addSource('transit-nodes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Stasiun Tugu' },
              geometry: { type: 'Point', coordinates: [110.3688, -7.7800] }
            },
            {
              type: 'Feature',
              properties: { name: 'Halte Feeder Sleman' },
              geometry: { type: 'Point', coordinates: [110.3550, -7.7500] }
            }
          ]
        }
      });
      map.addLayer({
        id: 'transit-nodes-layer',
        type: 'circle',
        source: 'transit-nodes',
        paint: {
          'circle-radius': 7,
          'circle-color': '#F97316',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF'
        },
        layout: { visibility: showTransit ? 'visible' : 'none' }
      });

      // 3. Zoning Source & Layer
      map.addSource('zoning-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'R-1' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [110.3750, -7.7600],
                    [110.3950, -7.7600],
                    [110.3950, -7.7800],
                    [110.3750, -7.7800],
                    [110.3750, -7.7600]
                  ]
                ]
              }
            },
            {
              type: 'Feature',
              properties: { type: 'C-1' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [110.3550, -7.7900],
                    [110.3700, -7.7900],
                    [110.3700, -7.8050],
                    [110.3550, -7.8050],
                    [110.3550, -7.7900]
                  ]
                ]
              }
            }
          ]
        }
      });
      map.addLayer({
        id: 'zoning-layer',
        type: 'fill',
        source: 'zoning-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'type'],
            'R-1', '#3B82F6',
            'C-1', '#06B6D4',
            '#4B5563'
          ],
          'fill-opacity': 0.25
        },
        layout: { visibility: showZoning ? 'visible' : 'none' }
      });

      // B. Sources & Layers untuk Menggambar Kustom (Real-time GIS)
      map.addSource('custom-drawings-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Render Poligon Kustom
      map.addLayer({
        id: 'custom-polygons-layer',
        type: 'fill',
        source: 'custom-drawings-source',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': '#06B6D4', // Cyber Cyan
          'fill-opacity': 0.35,
          'fill-outline-color': '#FFFFFF'
        }
      });

      // Render Garis Kustom
      map.addLayer({
        id: 'custom-lines-layer',
        type: 'line',
        source: 'custom-drawings-source',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#F97316', // Orange
          'line-width': 3,
          'line-opacity': 0.9
        }
      });

      // Procedural Masterplan Source & Layer
      map.addSource('procedural-masterplan-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'procedural-masterplan-layer',
        type: 'fill-extrusion',
        source: 'procedural-masterplan-source',
        paint: {
          'fill-extrusion-color': '#06B6D4',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85
        }
      });

      // Render Titik Kustom
      map.addLayer({
        id: 'custom-points-layer',
        type: 'circle',
        source: 'custom-drawings-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#10B981', // Urban Green
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      // C. Source & Layers untuk Unggahan GeoJSON Kustom
      map.addSource('uploaded-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'uploaded-polygons-layer',
        type: 'fill',
        source: 'uploaded-source',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': '#EC4899', // Pink density
          'fill-opacity': 0.3,
          'fill-outline-color': '#EC4899'
        }
      });
      map.addLayer({
        id: 'uploaded-lines-layer',
        type: 'line',
        source: 'uploaded-source',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#06B6D4',
          'line-width': 3
        }
      });
      map.addLayer({
        id: 'uploaded-points-layer',
        type: 'circle',
        source: 'uploaded-source',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#F59E0B',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      // D. Event Klik untuk Menggambar Spasial
      map.on('click', (e) => {
        const mode = drawModeRef.current;
        if (mode === 'none') return;

        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (mode === 'point') {
          setDrawnPoints(prev => [...prev, lngLat]);
        } else if (mode === 'line') {
          setDrawnLine(prev => [...prev, lngLat]);
        } else if (mode === 'polygon') {
          setDrawnPolygon(prev => [...prev, lngLat]);
        }
      });

      // E. Event Move untuk Telemetri Koordinat
      map.on('move', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const pitch = map.getPitch();
        const bearing = map.getBearing();
        
        viewportRef.current = {
          center: [center.lng, center.lat],
          zoom,
          pitch,
          bearing
        };

        setCurrentCoords({ lng: center.lng, lat: center.lat });
        setCurrentZoom(zoom);
        setIs3D(pitch > 0);

        if (onMoveMap) {
          onMoveMap(center.lng, center.lat);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectedStyle]);

  // 2. Sinkronisasi Tampilan & Opacity Layer Bawaan
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const setLayerProps = (layerId: string, visible: boolean, opacityProp: string, opacityVal: number) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        map.setPaintProperty(layerId, opacityProp, opacityVal);
      }
    };

    setLayerProps('zoning-layer', showZoning, 'fill-opacity', zoningOpacity);
    setLayerProps('transit-layer', showTransit, 'line-opacity', transitOpacity);
    if (map.getLayer('transit-nodes-layer')) {
      map.setLayoutProperty('transit-nodes-layer', 'visibility', showTransit ? 'visible' : 'none');
      map.setPaintProperty('transit-nodes-layer', 'circle-opacity', transitOpacity);
    }
    setLayerProps('hazard-layer', showHazard, 'fill-opacity', hazardOpacity);
  }, [showZoning, showTransit, showHazard, zoningOpacity, transitOpacity, hazardOpacity, mapLoaded]);

  // 3. Sinkronisasi Hasil Gambar Gambar Kustom di Peta
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const source = map.getSource('custom-drawings-source') as maplibregl.GeoJSONSource;
    if (source) {
      const features: any[] = [];

      // Render titik
      drawnPoints.forEach(coord => {
        features.push({
          type: 'Feature',
          properties: { type: 'point' },
          geometry: { type: 'Point', coordinates: coord }
        });
      });

      // Render garis
      if (drawnLine.length > 0) {
        features.push({
          type: 'Feature',
          properties: { type: 'line' },
          geometry: { type: 'LineString', coordinates: drawnLine }
        });
      }

      // Render poligon (tutup loop koordinat jika titik >= 3)
      if (drawnPolygon.length >= 3) {
        const closedCoords = [...drawnPolygon, drawnPolygon[0]];
        features.push({
          type: 'Feature',
          properties: { type: 'polygon' },
          geometry: { type: 'Polygon', coordinates: [closedCoords] }
        });
      }

      source.setData({
        type: 'FeatureCollection',
        features: features
      });
    }
  }, [drawnPoints, drawnLine, drawnPolygon, mapLoaded]);

  // 4. Sinkronisasi Data Unggahan GeoJSON & Auto-Zoom Kamera
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !uploadedGeojson) return;
    const map = mapRef.current;

    const source = map.getSource('uploaded-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(uploadedGeojson);

      // Hitung koordinat pusat sebaran berkas GeoJSON untuk zoom otomatis
      let sumLng = 0, sumLat = 0, count = 0;

      const extractCoords = (coords: any) => {
        if (Array.isArray(coords[0])) {
          coords.forEach((c: any) => extractCoords(c));
        } else if (typeof coords[0] === 'number') {
          sumLng += coords[0];
          sumLat += coords[1];
          count++;
        }
      };

      if (uploadedGeojson.features) {
        uploadedGeojson.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.coordinates) {
            extractCoords(feature.geometry.coordinates);
          }
        });
      }

      if (count > 0) {
        const avgLng = sumLng / count;
        const avgLat = sumLat / count;
        map.flyTo({
          center: [avgLng, avgLat],
          zoom: 12,
          speed: 1.2,
          essential: true
        });
      }
    }
  }, [uploadedGeojson, mapLoaded]);

  // Handler unggah file GeoJSON lokal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string);
        setUploadedGeojson(geojson);
      } catch (err) {
        alert('Format berkas GeoJSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleClosePolygon = async () => {
    if (drawnPolygon.length < 3) return;
    
    // Tutup poligon secara visual
    const closedCoords = [...drawnPolygon];
    if (closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] || closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]) {
      closedCoords.push(closedCoords[0]);
    }
    setDrawnPolygon(closedCoords);
    setDrawMode('none'); // Keluar dari mode menggambar

    // 1. Kalkulasi Luas (Turf.js)
    const polygonFeature = turf.polygon([closedCoords]);
    const areaSqMeters = turf.area(polygonFeature);
    const areaHa = areaSqMeters / 10000;
    setSiteArea(areaHa);

    // 2. Fetch Data Konteks (Overpass API)
    setIsAnalyzing(true);
    try {
      const polyString = closedCoords.map(c => `${c[1]} ${c[0]}`).join(' ');
      const query = `
        [out:json][timeout:25];
        way["building"](poly:"${polyString}"); out count;
        node["amenity"](poly:"${polyString}"); out count;
        way["highway"](poly:"${polyString}"); out count;
      `;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      
      if (data && data.elements && data.elements.length >= 3) {
        setSiteStats({
          buildings: parseInt(data.elements[0].tags?.ways || '0'),
          amenities: parseInt(data.elements[1].tags?.nodes || '0'),
          highway: parseInt(data.elements[2].tags?.ways || '0'),
        });
      }
    } catch (err) {
      console.error('Overpass API error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMasterplan = () => {
    if (drawnPolygon.length < 4) return;
    const poly = turf.polygon([drawnPolygon]);
    const bbox = turf.bbox(poly);
    
    // Grid 50x50 meter
    const cellSize = 0.05; 
    
    try {
      const grid = turf.squareGrid(bbox, cellSize, { units: 'kilometers' });
      const generatedBlocks: any[] = [];
      
      turf.featureEach(grid, (cell) => {
        const intersection = turf.intersect(turf.featureCollection([cell, poly]));
        if (intersection) {
          // Berikan tinggi acak (10 - 50m) untuk visualisasi 3D
          intersection.properties = {
            height: Math.floor(Math.random() * 40) + 10,
            type: 'procedural-block'
          };
          generatedBlocks.push(intersection);
        }
      });
      
      const fc = turf.featureCollection(generatedBlocks);
      if (mapRef.current) {
        const source = mapRef.current.getSource('procedural-masterplan-source') as maplibregl.GeoJSONSource;
        if (source) {
          source.setData(fc as any);
          setIsProceduralGenerated(true);
        }
      }
    } catch (err) {
      console.error('Procedural generation error:', err);
    }
  };
  const handleClearDrawings = () => {
    setDrawnPoints([]);
    setDrawnLine([]);
    setDrawnPolygon([]);
    setDrawMode('none');
    setSiteArea(null);
    setSiteStats(null);
    setIsProceduralGenerated(false);
    setUploadedGeojson(null);
    
    if (mapRef.current) {
      const source = mapRef.current.getSource('procedural-masterplan-source') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
      const uploadSrc = mapRef.current.getSource('uploaded-source') as maplibregl.GeoJSONSource;
      if (uploadSrc) uploadSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  const handleExportMapImage = () => {
    if (!mapRef.current) return;
    const canvas = mapRef.current.getCanvas();
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `arkopolis-map-${selectedStyle}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export map:', err);
      alert('Gagal mengekspor gambar peta. Coba lagi.');
    }
  };

  const scaleNumber = calculateNumericalScale(currentCoords.lat, currentZoom);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#04091a] rounded-lg overflow-hidden border border-blueprint-border/30 flex flex-col justify-end">
      
      {/* Kustom style override untuk MapLibre Scale Control agar bertema Metropolis Blueprint */}
      <style dangerouslySetInnerHTML={{ __html: `
        .maplibregl-ctrl-scale {
          background: rgba(4, 9, 26, 0.85) !important;
          border: 1px solid rgba(6, 182, 212, 0.4) !important;
          border-top: none !important;
          color: #06b6d4 !important;
          font-family: monospace !important;
          font-size: 8px !important;
          padding: 2px 5px !important;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1) !important;
          margin-bottom: 12px !important;
          margin-left: 16px !important;
        }
      `}} />
      
      {/* Kontainer MapLibre Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Backdrop overlay untuk sugesti pencarian jika terbuka */}
      {showSuggestions && (
        <div 
          className="absolute inset-0 z-10 cursor-default" 
          onClick={() => setShowSuggestions(false)}
        />
      )}

      {/* A. HUD BAR PENCARIAN & NAVIGASI LOKASI (Pojok Kiri Atas) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-[240px] md:max-w-[280px]">
        {/* Panel Pencarian */}
        <div className="bg-blueprint-panel/95 border border-cyber-cyan/30 p-2.5 rounded shadow-lg backdrop-blur-md flex flex-col gap-1.5 relative">
          <span className="text-[9px] font-mono text-cyber-cyan font-bold tracking-wider border-b border-white/5 pb-1 mb-0.5 uppercase">Cari Lokasi Geografis</span>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="flex gap-1 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Cari Kota / Tempat..."
              className="bg-black/40 border border-cyber-cyan/20 focus:border-cyber-cyan rounded px-2 py-1 text-white font-mono text-[10px] w-full outline-none transition-all placeholder:text-slate-500"
              aria-label="Cari lokasi geografis"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[9px] cursor-pointer"
                title="Hapus Pencarian"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="bg-cyber-cyan hover:bg-cyber-cyan/85 text-blueprint-base font-bold font-mono text-[9px] px-2.5 rounded cursor-pointer transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              {isSearching ? '...' : 'CARI'}
            </button>
          </form>

          {/* Sugesti Dropdown */}
          {showSuggestions && (
            <div className="absolute top-[52px] left-0 right-0 bg-blueprint-panel border border-cyber-cyan/30 rounded shadow-2xl z-30 flex flex-col overflow-hidden max-h-[140px] overflow-y-auto">
              <span className="text-[8px] font-mono text-slate-400 px-2 py-1 bg-black/30 border-b border-white/5 uppercase">Rekomendasi Jogja</span>
              {localSuggestions.map((place) => (
                <button
                  key={place.name}
                  type="button"
                  onClick={() => {
                    flyToLocation(place.coords[0], place.coords[1], place.name);
                    setShowSuggestions(false);
                  }}
                  className="px-2.5 py-1.5 text-left text-white hover:bg-cyber-cyan/15 text-[9px] font-mono border-b border-white/5 last:border-none cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span className="text-cyber-cyan text-[10px]">📍</span>
                  <span>{place.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel Menggambar Vektor Spasial */}
        <div className="bg-blueprint-panel/95 border border-cyber-cyan/30 p-2.5 rounded shadow-lg backdrop-blur-md flex flex-col gap-1.5">
          <span className="text-[9px] font-mono text-cyber-cyan font-bold tracking-wider border-b border-white/5 pb-1 mb-0.5 uppercase">Analisis Vektor Spasial</span>
          <div className="flex gap-1.5">
            {/* Mouse/Pointer Normal */}
            <button
              type="button"
              onClick={() => setDrawMode('none')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                drawMode === 'none' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-base/80 text-cyber-cyan hover:bg-cyber-cyan/15'
              }`}
              title="Navigasi Pointer"
              aria-label="Pointer Navigasi"
            >
              <MousePointer size={12} />
            </button>
            
            {/* Titik / Marker */}
            <button
              type="button"
              onClick={() => setDrawMode('point')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                drawMode === 'point' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-base/80 text-cyber-cyan hover:bg-cyber-cyan/15'
              }`}
              title="Gambar Titik (📍)"
              aria-label="Gambar Titik"
            >
              <MapPin size={12} />
            </button>

            {/* Garis / Line */}
            <button
              type="button"
              onClick={() => setDrawMode('line')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                drawMode === 'line' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-base/80 text-cyber-cyan hover:bg-cyber-cyan/15'
              }`}
              title="Gambar Garis (📏)"
              aria-label="Gambar Garis"
            >
              <Activity size={12} />
            </button>

            {/* Poligon / Area */}
            <button
              type="button"
              onClick={() => setDrawMode('polygon')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                drawMode === 'polygon' ? 'bg-cyber-cyan text-blueprint-base' : 'bg-blueprint-base/80 text-cyber-cyan hover:bg-cyber-cyan/15'
              }`}
              title="Gambar Area (🔷)"
              aria-label="Gambar Poligon"
            >
              <ShieldAlert size={12} />
            </button>

            {/* Hapus / Reset Gambar */}
            <button
              type="button"
              onClick={handleClearDrawings}
              className="p-1.5 rounded bg-blueprint-base/80 text-urban-red hover:bg-urban-red/20 border border-urban-red/20 hover:border-urban-red/50 transition-all cursor-pointer ml-auto"
              title="Bersihkan Gambar (Esc)"
              aria-label="Bersihkan Gambar"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Tombol Tutup Poligon jika sedang menggambar polygon minimal 3 titik */}
          {drawMode === 'polygon' && drawnPolygon.length >= 3 && (
            <button 
              type="button"
              onClick={handleClosePolygon}
              className="w-full mt-2 py-1.5 bg-green-500/20 border border-green-500/50 text-green-400 text-[9px] font-bold rounded shadow-lg shadow-green-900/20 hover:bg-green-500/40 transition-colors animate-pulse cursor-pointer uppercase"
            >
              Tutup & Analisis Area
            </button>
          )}

          {/* Tombol Generate 3D jika polygon sudah tertutup & area dihitung */}
          {siteArea !== null && drawnPolygon.length >= 4 && !isProceduralGenerated && (
            <button 
              type="button"
              onClick={generateMasterplan}
              className="w-full mt-2 py-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[9px] font-bold rounded shadow-lg shadow-purple-900/20 hover:bg-purple-500/40 transition-colors flex items-center justify-center group cursor-pointer uppercase"
            >
              <Box className="w-3 h-3 mr-1.5 group-hover:scale-125 transition-transform" />
              Generate 3D Layout
            </button>
          )}

          {/* Input Unggah GeoJSON */}
          <label className="flex items-center justify-center gap-1.5 bg-blueprint-base/80 border border-cyber-cyan/20 hover:border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 font-mono text-[9px] py-1 rounded cursor-pointer transition-all mt-1.5 uppercase text-center font-bold">
            <Upload size={10} />
            <span>Unggah GeoJSON</span>
            <input
              type="file"
              accept=".geojson,application/json"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Unggah GeoJSON"
            />
          </label>
        </div>
        
        {/* Dashboard Analisis Tapak */}
        {siteArea !== null && (
          <div className="bg-blueprint-panel/95 backdrop-blur-xl border border-cyan-500/50 p-3 rounded-lg shadow-2xl shadow-cyan-900/40 animate-in slide-in-from-left duration-300">
            <h3 className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider border-b border-cyan-900/50 pb-1.5 mb-2">
              Analisis Tapak
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[9px] block mb-0.5">Luas Estimasi</span>
                <div className="text-xl font-mono font-bold text-white tracking-tight">
                  {siteArea.toFixed(2)} <span className="text-cyan-500 text-[10px]">Ha</span>
                </div>
              </div>

              <div className="bg-black/30 p-2 rounded border border-white/5">
                <span className="text-slate-400 text-[9px] block mb-1.5 border-b border-white/10 pb-1">Konteks (OSM Data)</span>
                {isAnalyzing ? (
                  <div className="flex items-center space-x-1.5 text-cyan-400 text-[9px] animate-pulse py-1">
                    <RotateCcw className="w-2.5 h-2.5 animate-spin" />
                    <span>Menarik data satelit...</span>
                  </div>
                ) : siteStats ? (
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Bangunan</span>
                      <span className="text-green-400 font-bold">{siteStats.buildings}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Jalan/Gang</span>
                      <span className="text-orange-400 font-bold">{siteStats.highway}</span>
                    </div>
                    <div className="col-span-2 mt-0.5">
                      <span className="text-slate-500 block">Fasilitas/Amenity</span>
                      <span className="text-purple-400 font-bold">{siteStats.amenities}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 text-[9px]">Gagal memuat data.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* C. HUD PENGATURAN VISUAL & EKSPOR (Pojok Kanan Atas) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 w-[190px] md:w-[220px]">
        <div className="bg-blueprint-panel/95 border border-cyber-cyan/30 p-2.5 rounded shadow-lg backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-0.5">
            <Sliders size={11} className="text-cyber-cyan" />
            <span className="text-[9px] font-mono text-cyber-cyan font-bold tracking-wider uppercase">Visual & Ekspor</span>
          </div>

          {/* Gaya Basemap */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-mono text-slate-400 uppercase">Gaya Basemap</span>
            <div className="grid grid-cols-3 gap-1">
              {BASEMAP_STYLES.map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id as any)}
                  className={`px-1 py-1 text-[8px] font-mono border rounded transition-all cursor-pointer text-center ${
                    selectedStyle === style.id
                      ? 'bg-cyber-cyan text-blueprint-base border-cyber-cyan font-bold'
                      : 'bg-black/30 text-slate-300 border-white/10 hover:border-cyber-cyan/50'
                  }`}
                >
                  {style.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Perspektif View */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-mono text-slate-400 uppercase">Perspektif View</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.easeTo({ pitch: 0, bearing: 0, duration: 800 });
                  }
                }}
                className={`px-1 py-1 text-[8px] font-mono border rounded transition-all cursor-pointer text-center ${
                  !is3D
                    ? 'bg-cyber-cyan text-blueprint-base border-cyber-cyan font-bold'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:border-cyber-cyan/50'
                }`}
              >
                2D (Atas)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.easeTo({ pitch: 45, bearing: -10, duration: 800 });
                  }
                }}
                className={`px-1 py-1 text-[8px] font-mono border rounded transition-all cursor-pointer text-center ${
                  is3D
                    ? 'bg-cyber-cyan text-blueprint-base border-cyber-cyan font-bold'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:border-cyber-cyan/50'
                }`}
              >
                3D (Persp)
              </button>
            </div>
          </div>

          {/* Opacity Sliders */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
            <span className="text-[8px] font-mono text-slate-400 uppercase">Transparansi Lapisan</span>
            
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[8px] font-mono text-slate-300">
                <span>Zoning Area</span>
                <span className="text-cyber-cyan">{Math.round(zoningOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={zoningOpacity}
                onChange={(e) => setZoningOpacity(parseFloat(e.target.value))}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[8px] font-mono text-slate-300">
                <span>Transit Koridor</span>
                <span className="text-cyber-cyan">{Math.round(transitOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={transitOpacity}
                onChange={(e) => setTransitOpacity(parseFloat(e.target.value))}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[8px] font-mono text-slate-300">
                <span>Bencana / Hazard</span>
                <span className="text-cyber-cyan">{Math.round(hazardOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={hazardOpacity}
                onChange={(e) => setHazardOpacity(parseFloat(e.target.value))}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
              />
            </div>
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleExportMapImage}
            className="flex items-center justify-center gap-1.5 bg-cyber-cyan hover:bg-cyber-cyan/85 text-blueprint-base font-bold font-mono text-[9px] py-1.5 rounded cursor-pointer transition-all uppercase w-full mt-1 shadow-md border-none"
          >
            <Download size={10} />
            <span>Ekspor Peta (PNG)</span>
          </button>
        </div>
      </div>

      {/* HUD Telemetri Skala & Koordinat (Pojok Kiri Bawah - Diletakkan di atas scale bar) */}
      <div className="absolute bottom-14 left-4 bg-blueprint-panel/90 border border-cyber-cyan/30 p-2 rounded text-[9px] font-mono flex flex-col gap-0.5 text-slate-300 backdrop-blur-sm shadow-lg pointer-events-none z-10 w-[180px]">
        <div className="flex items-center gap-1.5">
          <span className="text-cyber-cyan font-bold">SKALA:</span>
          <span className="text-white font-bold">{formatScale(scaleNumber)}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-slate-400 border-t border-white/5 mt-1 pt-1">
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase">LAT:</span>
            <span>{Math.abs(currentCoords.lat).toFixed(5)}°{currentCoords.lat >= 0 ? 'N' : 'S'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase">LNG:</span>
            <span>{Math.abs(currentCoords.lng).toFixed(5)}°{currentCoords.lng >= 0 ? 'E' : 'W'}</span>
          </div>
        </div>
        <div className="text-[7px] text-slate-500 mt-0.5 border-t border-white/5 pt-0.5 flex justify-between">
          <span>ZOOM: {currentZoom.toFixed(1)}</span>
          <span>{is3D ? '3D VIEW' : '2D VIEW'}</span>
        </div>
      </div>

      {/* B. HUD LEGENDA PETA (Pojok Kanan Bawah) */}
      <div className="absolute bottom-4 right-4 bg-blueprint-panel/90 border border-cyber-cyan/30 p-2.5 rounded text-[9px] font-mono flex flex-col gap-1 text-slate-300 backdrop-blur-sm shadow-lg pointer-events-none z-10">
        <span className="text-white font-bold border-b border-white/10 pb-0.5 mb-1 uppercase">Legenda Lapisan Peta</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500/30 border border-blue-500 rounded-sm"></span>
          <span>R-1 Hunian (Biru)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-cyber-cyan/30 border border-cyber-cyan rounded-sm"></span>
          <span>C-1 Pusat Komersil (Cyan)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-purple-400"></span>
          <span>Koridor LRT Jogja (Ungu)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500/25 border border-red-500 rounded-sm"></span>
          <span>Risiko Genangan Banjir (Red)</span>
        </div>
        
        {/* Indikator Mode Menggambar Aktif */}
        {drawMode !== 'none' && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 text-cyber-cyan font-bold animate-pulse text-[8px] uppercase">
            MODE GAMBAR: {drawMode}
          </div>
        )}

        {/* Indikator Tempat yang Dicari */}
        {searchedPlaceName && (
          <div className="mt-1 pt-1.5 border-t border-white/10 text-urban-red font-bold text-[8px] uppercase">
            MARKER: {searchedPlaceName}
          </div>
        )}

        {/* Pintasan Hint */}
        <div className="mt-1.5 pt-1 border-t border-white/5 text-slate-500 text-[8px] leading-relaxed uppercase">
          💡 Pintasan: Z/T/H = Layer | Esc = Reset
        </div>
      </div>
    </div>
  );
};
export default RealGisMap;
