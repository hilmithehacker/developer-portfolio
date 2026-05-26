'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipe data untuk bahasa yang didukung
export type Language = 'ID' | 'EN';

// Definisikan struktur kamus terjemahan
interface TranslationDictionary {
  nav: {
    sim: string;
    philosophy: string;
    gis: string;
    portfolio: string;
    contact: string;
    cta: string;
  };
  hero: {
    badge: string;
    title: string;
    desc: string;
    spaces: string;
    spacesSub: string;
    greenIndex: string;
    greenIndexSub: string;
    transit: string;
    transitSub: string;
    ctaGis: string;
    ctaProj: string;
  };
  sandbox: {
    title: string;
    brush: string;
    reset: string;
    statsTitle: string;
    rth: string;
    transitEff: string;
    sustainScore: string;
    hint: string;
    zoneR: string;
    zoneC: string;
    zoneI: string;
    zoneRTH: string;
    zoneRoad: string;
  };
  policy: {
    badge: string;
    title: string;
    desc: string;
    sliderGreen: string;
    sliderTod: string;
    sliderInd: string;
    outEcoTitle: string;
    outAccessTitle: string;
    outEcoDescLow: string;
    outEcoDescOk: string;
    outAccessDescLow: string;
    outAccessDescOk: string;
  };
  gis: {
    badge: string;
    title: string;
    desc: string;
    panelTitle: string;
    panelDesc: string;
    layerZoning: string;
    layerZoningSub: string;
    layerTransit: string;
    layerTransitSub: string;
    layerHazard: string;
    layerHazardSub: string;
    modeSandbox: string;
    modeRealMap: string;
    insightDefault: string;
    insightAll: string;
    insightZoningTransit: string;
    insightZoningHazard: string;
  };
  philosophy: {
    badge: string;
    title: string;
    desc: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
  };
  portfolio: {
    badge: string;
    title: string;
    desc: string;
    filterAll: string;
    statusAcademic: string;
    statusPub: string;
    statusGov: string;
    explore: string;
  };
  contact: {
    badge: string;
    title: string;
    desc: string;
    labelName: string;
    labelEmail: string;
    labelLocation: string;
    labelMessage: string;
    labelCaptcha: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderLocation: string;
    placeholderMessage: string;
    buttonSubmit: string;
    notifErrorCaptcha: string;
    notifSuccess: string;
    hubTitle: string;
    hubDesc: string;
    hubOffice: string;
    hubOfficeVal: string;
    hubEmail: string;
    hubEmailVal: string;
    hubPartnership: string;
    hubPartnershipVal: string;
    statusSys: string;
    statusVal: string;
    timeLabel: string;
    docAccessed: string;
  };
}

const translations: Record<Language, TranslationDictionary> = {
  ID: {
    nav: {
      sim: "01. SIMULASI",
      philosophy: "02. FILOSOFI",
      gis: "03. GIS PLATFORM",
      portfolio: "04. PORTOFOLIO",
      contact: "05. DEBATE",
      cta: "Rencanakan!"
    },
    hero: {
      badge: "PWK Spatial Engine v2.0",
      title: "Seni Merencana <br/>Masa Depan Kota",
      desc: "Bagaimana jika kota dapat beradaptasi secara dinamis? Selamat datang di portal portofolio interaktif Hilmi Abdurrahman. Di sini, penataan ruang bukan sekadar gambar teknis di atas kertas, tetapi orkestrasi dinamis antara data spasial, manusia, dan kelestarian ekologis.",
      spaces: "120K+",
      spacesSub: "Ha Tersimulasi",
      greenIndex: "42.8%",
      greenIndexSub: "Kanopi Ideal",
      transit: "8.4",
      transitSub: "Skor Aksesibilitas",
      ctaGis: "Buka GIS Platform",
      ctaProj: "Lihat Proyek Real"
    },
    sandbox: {
      title: "SANDBOX KOTA: MODEL PERTUMBUHAN SPASIAL",
      brush: "Alat Gambar:",
      reset: "RESET",
      statsTitle: "METRIKKOTA (DYNAMIC EVALUATION)",
      rth: "Rasio Ruang Terbuka Hijau:",
      transitEff: "Efisiensi Transportasi:",
      sustainScore: "Skor Keberlanjutan:",
      hint: "💡 Interaktivitas PWK: Klik/seret kursor di atas kanvas untuk menata jaringan kota. Bangun RTH, Hunian, Bisnis, atau Jalan, lalu saksikan evaluasi indeks langsung.",
      zoneR: "Hunian",
      zoneC: "Bisnis",
      zoneI: "Industri",
      zoneRTH: "RTH",
      zoneRoad: "Jalan"
    },
    policy: {
      badge: "SIMULATOR KEBIJAKAN",
      title: "Simulasikan Kebijakan Spasial Anda",
      desc: "Ubah parameter pembangunan di bawah ini untuk melihat dampaknya langsung terhadap kualitas kota:",
      sliderGreen: "RTH Mandatori (Target Ruang Terbuka Hijau)",
      sliderTod: "Intensitas TOD (Kepadatan Sekitar Stasiun)",
      sliderInd: "Zonasi Penyangga Industri (Buffer Zone)",
      outEcoTitle: "Daya Dukung Lingkungan",
      outAccessTitle: "Aksesibilitas Wilayah",
      outEcoDescLow: "Tutupan hijau minim. Kota rentan efek Urban Heat Island.",
      outEcoDescOk: "Kapasitas RTH memadai. Daya serap karbon optimal.",
      outAccessDescLow: "Pola sirkulasi menyebar, rawan timbul titik kemacetan baru.",
      outAccessDescOk: "Kepadatan tinggi efektif mendorong penggunaan angkutan umum.",
    },
    gis: {
      badge: "03 / GIS MAP SIMULATOR",
      title: "Simulasi Analisis Spasial (GIS Viewer)",
      desc: "Eksplorasi lapisan data spasial kota fiktif Arkopolis. Nyalakan atau matikan lapisan peta di panel sebelah kanan untuk melakukan analisis overlay spasial.",
      panelTitle: "Pengendali Layer Data Spasial",
      panelDesc: "Simulasi visualisasi tumpang-susun data (Spatial Overlay Analysis).",
      layerZoning: "Tata Guna Lahan (Zonasi)",
      layerZoningSub: "Layer A: Peruntukan Ruang (RTRW)",
      layerTransit: "Moda Transit Publik",
      layerTransitSub: "Layer B: LRT, BRT, & Jalur Transportasi",
      layerHazard: "Kerentanan Hazard Banjir",
      layerHazardSub: "Layer C: Heatmap Daerah Aliran Sungai",
      modeSandbox: "Zonasi Skematik",
      modeRealMap: "Peta Geografis (MapLibre)",
      insightDefault: "Nyalakan minimal dua lapisan data di panel samping untuk memicu kalkulasi tumpang-susun data spasial.",
      insightAll: "ANALISIS KESESUAIAN LAHAN: Menempatkan perumahan kepadatan tinggi di dekat zona transit utama dapat menekan tingkat ketergantungan kendaraan pribadi secara signifikan, asalkan zona tersebut terlindungi dari kerentanan bencana banjir.",
      insightZoningTransit: "ANALISIS TOD: Kepadatan kawasan hunian komersial berimbang langsung terhubung dengan stasiun perantara, memperpendek rata-rata waktu tempuh harian penduduk kota.",
      insightZoningHazard: "MITIGASI BENCANA: Sebagian besar pemukiman penduduk berada di dekat batas aliran sungai. Direkomendasikan pembentukan sabuk hijau (green belt Buffer) minimal lebar 50 meter.",
    },
    philosophy: {
      badge: "02 / FILOSOFI PERENCANAAN",
      title: "Prinsip Spasial Adaptif: Kota Sebagai Organisme Hidup",
      desc: "Perencanaan Wilayah & Kota tidak lagi sebatas mengarsir lembaran kertas kalkir bertajuk RTRW. Di era komputasi spasial, kota adalah agregat dari data sensor, keputusan perilaku ekonomi, ekologi sungai, dan pergerakan karbon.",
      p1Title: "Perencanaan Berbasis Kinerja Dinamis (Performance Zoning)",
      p1Desc: "Fleksibilitas zonasi tata guna lahan yang berorientasi pada beban ekologis nyata di lapangan, bukan regulasi rigid yang menghambat inovasi berkelanjutan.",
      p2Title: "Infrastruktur Berbasis Ekologi (Green Infrastructure)",
      p2Desc: "Mengintegrasikan ekosistem alami ke dalam tulang punggung drainase, koridor sirkulasi udara mikro kota, dan mitigasi kebencanaan pesisir.",
    },
    portfolio: {
      badge: "04 / PORTOFOLIO NYATA",
      title: "Rencana Struktur Ruang & Desain Urban",
      desc: "Beberapa dokumen rencana induk, kajian spasial, dan pemodelan wilayah yang telah saya kembangkan di dunia nyata.",
      filterAll: "Semua",
      statusAcademic: "Proposal Akademik",
      statusPub: "Publikasi Ilmiah",
      statusGov: "Rekomendasi Dinas",
      explore: "Eksplorasi Dokumen",
    },
    contact: {
      badge: "05 / MERENCANA BERSAMA",
      title: "Sampaikan Isu Wilayah Anda",
      desc: "Apakah kota Anda menderita kemacetan kronis, penurunan muka air tanah, atau zonasi yang semrawut? Ajukan permasalahan wilayah Anda di bawah ini, mari kita bicarakan solusi taktis berbasis data.",
      labelName: "Nama Pengirim / Instansi",
      labelEmail: "Surel (Email)",
      labelLocation: "Lokasi Fokus Permasalahan Spasial",
      labelMessage: "Deskripsi Isu & Target Solusi",
      labelCaptcha: "Verifikasi Spasial: Berapa hasil 5 + 3?",
      placeholderName: "Contoh: Bappeda Kab. X / Swasta",
      placeholderEmail: "nama@domain.com",
      placeholderLocation: "Contoh: Pesisir Utara Semarang / Pusat Kota Pekanbaru",
      placeholderMessage: "Jelaskan secara ringkas perihal tumpang tindih tata ruang atau kemacetan lalu lintas setempat...",
      buttonSubmit: "Kirim Isu & Mulai Konsultasi Spasial",
      notifErrorCaptcha: "Galat Verifikasi: Jawaban perhitungan matematika salah. Silakan coba kembali.",
      notifSuccess: "Kirim Sukses! Terima kasih Rekan {name}. Isu tata ruang di wilayah {location} telah berhasil direkam oleh sistem telemetri spasial kami. Tanggapan formal akan kami kirimkan ke surel Anda dalam waktu maksimal 2x24 jam kerja.",
      hubTitle: "Hub Spasial Hilmi",
      hubDesc: "Dapat ditemui secara daring maupun luring di koordinat berikut:",
      hubOffice: "Domisili Kantor",
      hubOfficeVal: "Yogyakarta, D.I. Yogyakarta, Indonesia",
      hubEmail: "Surel Korespondensi",
      hubEmailVal: "hilmi.abdurrahman@pwk.mail.com",
      hubPartnership: "Kemitraan Konsultasi",
      hubPartnershipVal: "Tersedia untuk Freelance & Asosiasi Proyek",
      statusSys: "STATUS SISTEM:",
      statusVal: "AKTIF (ONLINE)",
      timeLabel: "WAKTU LOKAL:",
      docAccessed: "DOKUMEN SPASIAL DIAKSES:"
    }
  },
  EN: {
    nav: {
      sim: "01. SIMULATION",
      philosophy: "02. PHILOSOPHY",
      gis: "03. GIS PLATFORM",
      portfolio: "04. PORTFOLIO",
      contact: "05. DEBATE",
      cta: "Let's Plan"
    },
    hero: {
      badge: "PWK Spatial Engine v2.0",
      title: "The Art of Planning <br/>Future Cities",
      desc: "What if cities could adapt dynamically? Welcome to the interactive portfolio portal of Hilmi Abdurrahman. Here, spatial planning is not just technical blueprints on paper, but a dynamic orchestration between spatial data, humanity, and ecological sustainability.",
      spaces: "120K+",
      spacesSub: "Simulated Ha",
      greenIndex: "42.8%",
      greenIndexSub: "Ideal Canopy",
      transit: "8.4",
      transitSub: "Accessibility Score",
      ctaGis: "Open GIS Platform",
      ctaProj: "View Real Projects"
    },
    sandbox: {
      title: "CITY SANDBOX: SPATIAL GROWTH MODEL",
      brush: "Brush Tool:",
      reset: "RESET",
      statsTitle: "CITY METRICS (DYNAMIC EVALUATION)",
      rth: "Green Open Space Ratio:",
      transitEff: "Transit Efficiency:",
      sustainScore: "Sustainability Score:",
      hint: "💡 PWK Interactive: Click/drag the cursor over the canvas to plan the city layout. Draw Green Spaces, Residential, Business, or Roads, and watch index evaluations in real-time.",
      zoneR: "Housing",
      zoneC: "Business",
      zoneI: "Industry",
      zoneRTH: "Green",
      zoneRoad: "Road"
    },
    policy: {
      badge: "POLICY SIMULATOR",
      title: "Simulate Your Spatial Policy",
      desc: "Modify the planning parameters below to instantly evaluate their impact on city quality:",
      sliderGreen: "Mandatory RTH (Target Green Space Ratio)",
      sliderTod: "TOD Intensity (Density Around Stations)",
      sliderInd: "Industrial Buffer Distance (Zoning Buffer)",
      outEcoTitle: "Ecological Capacity",
      outAccessTitle: "Regional Accessibility",
      outEcoDescLow: "Minimal green cover. City is highly vulnerable to Urban Heat Island effects.",
      outEcoDescOk: "Adequate green open spaces. Optimal carbon sequestration capacity.",
      outAccessDescLow: "Highly dispersed circulation patterns, prone to creating traffic bottlenecks.",
      outAccessDescOk: "High transit-oriented density effectively drives public transit adoption.",
    },
    gis: {
      badge: "03 / GIS MAP SIMULATOR",
      title: "Spatial Analysis Simulation (GIS Viewer)",
      desc: "Explore spatial data layers of the hypothetical city Arkopolis. Toggle map layers on the right panel to run a spatial overlay analysis.",
      panelTitle: "Spatial Data Layer Controller",
      panelDesc: "Simulated spatial data overlay analysis visualization.",
      layerZoning: "Land Use (Zoning)",
      layerZoningSub: "Layer A: Spatial Allocations (RTRW)",
      layerTransit: "Public Transit Modes",
      layerTransitSub: "Layer B: LRT, BRT, & Transit Lines",
      layerHazard: "Flood Hazard Vulnerability",
      layerHazardSub: "Layer C: River Basin Heatmap Overlay",
      modeSandbox: "Zoning Schematic",
      modeRealMap: "Geographic Map (MapLibre)",
      insightDefault: "Toggle at least two data layers on the side panel to trigger spatial overlay calculations.",
      insightAll: "LAND SUITABILITY ANALYSIS: Placing high-density housing near major transit zones significantly mitigates private vehicle dependence, provided the zone is fully protected from flood vulnerabilities.",
      insightZoningTransit: "TOD ANALYSIS: Balanced commercial-residential zoning directly connected to feeder stations shortens the average daily commute time for citizens.",
      insightZoningHazard: "DISASTER MITIGATION: A large portion of housing settlements sits near river flood lines. A green belt buffer zone of at least 50m width is recommended.",
    },
    philosophy: {
      badge: "02 / PLANNING PHILOSOPHY",
      title: "Adaptive Spatial Principle: The City as a Living Organism",
      desc: "Urban & Regional Planning is no longer confined to tracing land use lines on paper. In the era of spatial computation, a city is a complex aggregate of sensor feeds, economic behavior, river ecology, and carbon footprints.",
      p1Title: "Performance-Based Dynamic Planning",
      p1Desc: "Flexible land use zoning oriented towards actual environmental carrying capacity, rather than rigid regulations that restrict sustainable development.",
      p2Title: "Ecological Green Infrastructure",
      p2Desc: "Integrating natural ecosystems directly into stormwater drainage networks, microclimate sirkulation corridors, and coastal hazard mitigation.",
    },
    portfolio: {
      badge: "04 / REAL PORTFOLIO",
      title: "Spatial Structure Plans & Urban Design",
      desc: "A collection of masterplans, spatial studies, and regional modeling documents that I have developed for real-world scenarios.",
      filterAll: "All",
      statusAcademic: "Academic Proposal",
      statusPub: "Scientific Publication",
      statusGov: "Government Recommendation",
      explore: "Explore Document",
    },
    contact: {
      badge: "05 / COLLABORATIVE PLANNING",
      title: "Submit Your Regional Issues",
      desc: "Is your city suffering from chronic traffic gridlock, water table depletion, or chaotic zoning? Submit your spatial issues below, let's co-design data-driven solutions.",
      labelName: "Sender Name / Agency",
      labelEmail: "Email Address",
      labelLocation: "Spatial Issue Focus Location",
      labelMessage: "Issue Description & Target Solutions",
      labelCaptcha: "Spatial Verification: What is 5 + 3?",
      placeholderName: "Example: Regency Bappeda / Private Developer",
      placeholderEmail: "name@domain.com",
      placeholderLocation: "Example: Semarang Northern Coastal / Pekanbaru City Center",
      placeholderMessage: "Briefly explain the zoning conflicts or local traffic congestion issues...",
      buttonSubmit: "Submit Issue & Start Spatial Consulting",
      notifErrorCaptcha: "Verification Error: Incorrect math challenge response. Please try again.",
      notifSuccess: "Submission Successful! Thank you, Colleague {name}. The spatial issues for {location} have been logged into our telemetry system. A formal response will be sent to your email within 2x24 business hours.",
      hubTitle: "Hilmi's Spatial Hub",
      hubDesc: "Reach out via digital channels or locate us at these coordinates:",
      hubOffice: "Office Base",
      hubOfficeVal: "Yogyakarta, Special Region of Yogyakarta, Indonesia",
      hubEmail: "Correspondence Email",
      hubEmailVal: "hilmi.abdurrahman@pwk.mail.com",
      hubPartnership: "Consultation Partnership",
      hubPartnershipVal: "Available for Freelance & Project Association",
      statusSys: "SYSTEM STATUS:",
      statusVal: "ACTIVE (ONLINE)",
      timeLabel: "LOCAL TIME:",
      docAccessed: "SPATIAL DOCUMENTS ACCESSED:"
    }
  }
};

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ID');

  // Load language preference from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('metropolis_lang') as Language;
    if (savedLang && (savedLang === 'ID' || savedLang === 'EN')) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'ID' ? 'EN' : 'ID';
    setLanguage(newLang);
    localStorage.setItem('metropolis_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
