# PRODUCT REQUIREMENTS DOCUMENT
## METROPOLIS — Portfolio Website Urban Planning & GIS
**Hilmi Abdurrahman | Urban Planner & GIS Analyst**

| | |
|---|---|
| Kode Proyek | PWK-HUD-V3 |
| Versi PRD | 1.0.0 |
| Tanggal | Mei 2026 |
| Status | Draft Final |
| Bahasa Website | Bahasa Indonesia |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Informasi Proyek](#2-informasi-proyek)
3. [Tujuan & Sasaran](#3-tujuan--sasaran)
4. [Target Audiens](#4-target-audiens)
5. [Arsitektur Informasi (Sitemap)](#5-arsitektur-informasi-sitemap)
6. [Spesifikasi Halaman per Section](#6-spesifikasi-halaman-per-section)
7. [Spesifikasi Fitur Fungsional](#7-spesifikasi-fitur-fungsional)
8. [Referensi Design System](#8-referensi-design-system)
9. [Spesifikasi Teknologi](#9-spesifikasi-teknologi)
10. [Kebutuhan Konten](#10-kebutuhan-konten)
11. [Kebutuhan Non-Fungsional](#11-kebutuhan-non-fungsional)
12. [Struktur File Proyek](#12-struktur-file-proyek)
13. [Fase Pengembangan](#13-fase-pengembangan)
14. [Di Luar Cakupan (Out of Scope)](#14-di-luar-cakupan-out-of-scope)
15. [Pertanyaan Terbuka & Item TBD](#15-pertanyaan-terbuka--item-tbd)
16. [Metrik Keberhasilan](#16-metrik-keberhasilan)
17. [Referensi & Dokumen Terkait](#17-referensi--dokumen-terkait)

---

## 1. Ringkasan Eksekutif

METROPOLIS adalah website portofolio berbasis web untuk Hilmi Abdurrahman, mahasiswa Perencanaan Wilayah dan Kota (PWK) dengan spesialisasi di urban design, spatial analysis, GIS, geostatistik, dan teknologi perencanaan berbasis AI.

Website ini bukan portofolio konvensional. Tampilannya dirancang menyerupai sistem operasi kota berbasis data (Urban Operating System) yang menggabungkan antarmuka GIS, data telemetri, dan animasi sinematik. Tujuannya adalah memposisikan Hilmi sebagai urban planner generasi baru yang menguasai tools digital dan berpikir secara sistemik.

Target selesai: secepatnya, dengan desain dasar yang sudah tersedia dalam bentuk HTML prototype dan dua dokumen design system (design.md dan design2.md).

---

## 2. Informasi Proyek

| Field | Detail |
|---|---|
| Nama Produk | METROPOLIS Urban OS Portfolio |
| Pemilik Proyek | Hilmi Abdurrahman |
| Tagline | Urban Planner & GIS Analyst |
| Kode Proyek | PWK-HUD-V3 |
| Versi PRD | 1.0.0 |
| Tanggal Dibuat | Mei 2026 |
| Bahasa Website | Bahasa Indonesia |
| Status Progres | Desain awal (HTML) sudah tersedia, siap dikembangkan |

---

## 3. Tujuan & Sasaran

### 3.1 Tujuan Utama

- Menampilkan kompetensi Hilmi secara visual kepada empat segmen audiens: rekruter perusahaan swasta, instansi pemerintah atau BAPPEDA, akademisi dan peneliti, serta klien freelance.
- Membedakan Hilmi dari portofolio PWK konvensional melalui antarmuka berbasis data dan teknologi.
- Menjadi platform presentasi proyek yang aktif dan interaktif, bukan sekadar PDF online.
- Membangun kepercayaan profesional dengan menampilkan keahlian tools, proses berpikir spasial, dan kemampuan analisis.

### 3.2 Sasaran Terukur

| Sasaran | Indikator | Target |
|---|---|---|
| Keterbacaan profil | Waktu rata-rata di halaman About | > 60 detik |
| Eksplorasi proyek | Jumlah proyek yang dibuka per sesi | > 2 proyek |
| Unduhan CV | Klik tombol Download CV | > 30% pengunjung unik |
| Kontak masuk | Pesan melalui form kontak | > 5 pesan/bulan |
| Performa teknis | Skor Lighthouse | > 90 |
| Kecepatan load | First Contentful Paint | < 2 detik |
| Animasi | Frame rate interaksi | 60 FPS stabil |

---

## 4. Target Audiens

| Segmen Audiens | Kebutuhan & Ekspektasi |
|---|---|
| Rekruter Perusahaan Swasta | Melihat proyek, skills tools, dan CV secara cepat. Butuh kesan profesional dan terorganisir. |
| Instansi Pemerintah / BAPPEDA | Melihat kemampuan analisis spasial, GIS, dan pemahaman kebijakan tata ruang. Butuh kepercayaan teknis. |
| Akademisi / Dosen / Peneliti | Melihat metodologi, riset, dan kemampuan menulis ilmiah. Butuh kedalaman konten dan referensi. |
| Klien Freelance / Konsultan | Melihat portofolio proyek relevan dan cara menghubungi Hilmi. Butuh form kontak yang mudah. |

---

## 5. Arsitektur Informasi (Sitemap)

Website terdiri dari satu halaman utama dengan navigasi berbasis section, ditambah halaman Blog dan halaman detail proyek yang terpisah.

| Halaman / Section | Deskripsi |
|---|---|
| `/` (Home) | Entry point utama. Berisi Hero, Proyek, Skills, About, Blog preview, dan Kontak. |
| `#hero` | Animasi peta interaktif, nama, tagline, dan CTA utama. |
| `#projects` | Grid proyek dengan filter kategori dan detail per proyek. |
| `#about` | Profil, latar belakang akademik, filosofi perencanaan, dan foto. |
| `#skills` | Daftar tools dan kompetensi dengan visual kategori. |
| `#blog` | Preview 3 artikel terbaru dengan link ke halaman Blog. |
| `#contact` | Form kontak dan link media sosial atau email. |
| `/blog` | Daftar seluruh artikel dan tulisan Hilmi. |
| `/blog/:slug` | Halaman detail artikel. |
| `/project/:slug` | Halaman detail proyek (opsional, bisa modal overlay). |

---

## 6. Spesifikasi Halaman per Section

### 6.1 Hero Section

Hero adalah kesan pertama. Harus langsung mengkomunikasikan identitas dan keahlian spasial Hilmi.

**Elemen Wajib**

- Nama: Hilmi Abdurrahman
- Tagline: Urban Planner & GIS Analyst
- Sub-deskripsi singkat: satu kalimat tentang fokus bidang.
- Animasi peta interaktif sebagai background atau elemen dekoratif (SVG atau MapLibre GL).
- Telemetry HUD: koordinat LAT/LNG bergerak, label GIS layer.
- CTA utama: tombol Lihat Proyek dan Unduh CV.
- Cursor kustom: crosshair reticle dengan koordinat real-time (desktop only).

**Behavior**

- Desktop: animasi peta bergerak perlahan, teks muncul dengan blur reveal.
- Mobile: animasi disederhanakan, tidak ada cursor kustom.
- Scroll indicator di bawah hero mengarahkan ke section berikutnya.

---

### 6.2 Section Proyek

Menampilkan daftar proyek dengan sistem filter. Setiap proyek ditampilkan sebagai kartu dengan preview visual.

**Elemen Wajib**

- Filter bar: filter berdasarkan kategori (GIS, Urban Design, Spatial Analysis, AI Planning, Geostatistik).
- Grid proyek: 3 kolom di desktop, 2 di tablet, 1 di mobile.
- Kartu proyek berisi: thumbnail atau peta, judul, kategori tag, deskripsi singkat 1-2 kalimat, dan tombol Detail.
- Detail proyek: judul lengkap, isu yang diangkat, metodologi, tools dipakai, output, dan gambar atau peta.

**Kategori Proyek (untuk Filter)**

- GIS & Pemetaan
- Urban Design
- Spatial Analysis
- AI & Teknologi Perencanaan
- Geostatistik
- Visualisasi Data

**Konten Dummy (Placeholder)**

Seluruh konten proyek menggunakan data dummy sampai Hilmi mengisi konten asli. Dummy harus mencerminkan tipe proyek yang relevan dengan bidang PWK.

---

### 6.3 Section About

**Elemen Wajib**

- Foto profil Hilmi (placeholder sampai foto asli tersedia).
- Nama dan gelar atau status akademik.
- Paragraf pengenalan: latar belakang, fokus studi, dan minat.
- Filosofi perencanaan: 2-3 kalimat tentang cara Hilmi memandang perencanaan kota.
- Timeline akademik atau pengalaman organisasi (opsional, bisa ditambah belakangan).

---

### 6.4 Section Skills & Tools

Menampilkan seluruh tools yang dikuasai Hilmi, dikelompokkan berdasarkan kategori.

| Kategori | Tools |
|---|---|
| GIS & Remote Sensing | QGIS, ArcGIS Pro, Google Earth Engine |
| Pemrograman & Analisis | Google Colab (Python), VSCode |
| Urban Design & 3D | AutoCAD, Autodesk Forma, SketchUp, Esri CityEngine |
| Simulasi & Rendering | ENVI-met, Enscape, D5 Render |
| Desain Visual | Figma, Canva |
| AI & Produktivitas | Antigravity, Kiro |

Setiap tool ditampilkan sebagai kartu atau badge dengan ikon. Level kemahiran tidak perlu ditampilkan sebagai angka persentase, cukup kategori atau visual sederhana.

---

### 6.5 Section Blog

**Elemen Wajib di Homepage**

- Judul section: Tulisan & Pemikiran.
- Preview 3 artikel terbaru: thumbnail, judul, tanggal, dan cuplikan 1-2 kalimat.
- Tombol Lihat Semua Tulisan mengarah ke halaman `/blog`.

**Halaman Blog (/blog)**

- Daftar semua artikel dengan filter atau kategori.
- Kategori artikel: Opini Urban, Tutorial GIS, Catatan Lapangan, Riset & Analisis.
- Setiap artikel memiliki halaman detail (`/blog/:slug`) dengan format tulisan panjang.
- Artikel ditulis dalam Bahasa Indonesia.

---

### 6.6 Section Kontak

**Elemen Wajib**

- Form kontak: nama, email, pesan, dan tombol Kirim.
- Keterangan penggunaan form: untuk konsultasi, kolaborasi, atau pertanyaan.
- Link sosial media atau email langsung sebagai alternatif.
- Form tidak perlu backend kompleks di tahap pertama. Gunakan Formspree atau Netlify Forms sebagai solusi sederhana.

---

## 7. Spesifikasi Fitur Fungsional

| Fitur | Spesifikasi Detail |
|---|---|
| Animasi Peta Interaktif (Hero) | Peta SVG atau MapLibre GL dengan layer GIS sederhana. Peta bergerak perlahan atau merespons gerakan mouse. Warna sesuai design system (Blueprint Black, Cyber Cyan). |
| Filter & Kategori Proyek | Filter berdasarkan tag kategori. State aktif ditandai dengan warna Cyber Cyan. Filter bersifat client-side (tidak ada reload halaman). |
| Download CV Langsung | Tombol mengunduh file PDF CV Hilmi langsung dari browser. File CV disimpan di folder `/public`. Nama file: `hilmi-abdurrahman-cv.pdf`. |
| Form Kontak | Field: nama, email, pesan. Validasi input di sisi klien. Pengiriman menggunakan Formspree atau Netlify Forms. Konfirmasi sukses atau error ditampilkan inline. |
| Blog & Artikel | Artikel ditulis dalam format Markdown atau MDX. Dikelola melalui folder `/content/blog` atau CMS Headless (opsional). Mendukung gambar, tabel, dan kode. |
| Mode Gelap / Terang | Toggle di navigasi. Default: mode gelap (sesuai design system). Mode terang menggunakan palet alternatif yang tetap elegan. Preferensi disimpan di localStorage. |
| Cursor Kustom (Desktop) | Crosshair reticle 40px. Menampilkan koordinat X/Y palsu menggunakan font IBM Plex Mono. Efek lag interpolasi saat bergerak. Dinonaktifkan di perangkat touch. |
| Telemetry HUD Elements | Elemen dekoratif yang menampilkan data fake: LAT/LNG, zoom level, layer aktif, timestamp. Font IBM Plex Mono. Hanya dekoratif, tidak fungsional secara GIS. |

---

## 8. Referensi Design System

Design system lengkap sudah tersedia dalam dua dokumen: `design.md` dan `design2.md`. Bagian ini merangkum poin utama yang wajib diikuti selama pengembangan.

### 8.1 Palet Warna Utama

| Nama | Hex | Fungsi |
|---|---|---|
| Blueprint Black | `#060B18` | Background utama |
| Deep Navy | `#0A1329` | Panel HUD |
| Cyber Cyan | `#06B6D4` | Data telemetry, aksen aktif |
| Urban Green | `#10B981` | Sustainability, RTH |
| Transit Purple | `#A78BFA` | Jaringan transportasi |
| Frost White | `#E5E7EB` | Tipografi utama |
| Urban Red | `#EF4444` | Risiko, kerentanan |
| Planning Orange | `#F97316` | Intervensi urban |
| Industrial Yellow | `#F59E0B` | Aktivitas ekonomi |
| Density Pink | `#EC4899` | Kepadatan penduduk |

### 8.2 Tipografi

| Kategori | Font | Penggunaan |
|---|---|---|
| Display | Space Grotesk | Judul hero, headline section, metrik besar |
| Interface | Inter | Deskripsi, paragraf, metadata |
| Telemetry | IBM Plex Mono | Koordinat, timestamp, label GIS, data HUD |

### 8.3 Glassmorphism

Semua panel floating menggunakan:

```css
background: rgba(255, 255, 255, 0.06);
backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.12);
```

Panel utama menggunakan `blueprint-panel` (`#0A1329`) dengan opacity 70%.

### 8.4 Grid & Spacing

- 12 kolom, max-width 1280px, gutter 2rem.
- Sistem spacing berbasis 4px.
- Border radius: kartu besar 16px, widget 12px, input/tombol 8px, pill/badge full.
- Semua border ketebalan 1px.

### 8.5 Animasi & Motion

| Tipe Animasi | Spesifikasi |
|---|---|
| Blur Reveal | Elemen masuk dengan `opacity: 0` dan `filter: blur(10px)`, transisi ke `opacity: 1` dan blur: 0. |
| Vector Tracing | Path SVG dianimasikan menggunakan `stroke-dashoffset` saat masuk viewport. |
| Scanning Line | Garis horizontal 1px yang bergerak vertikal secara periodik di atas panel. |
| Horizontal Slide | Navigasi antar project slide menggunakan GSAP ScrollTrigger (desktop). |
| Counter Roll | Angka metrik besar berputar ke nilai akhir saat masuk viewport. |

---

## 9. Spesifikasi Teknologi

| Kategori | Teknologi |
|---|---|
| Framework Utama | Next.js 14+ (App Router) + React 18 |
| Styling | TailwindCSS v3 |
| Animasi | GSAP (ScrollTrigger, motionPath) + Framer Motion |
| Scroll Engine | Lenis Smooth Scroll |
| GIS & Peta | MapLibre GL JS + Turf.js |
| 3D / WebGL | Three.js + React Three Fiber (opsional) |
| Blog | Markdown/MDX lokal, atau Contentlayer sebagai parser |
| Form Kontak | Formspree atau Netlify Forms |
| Font | Google Fonts: Space Grotesk, Inter, IBM Plex Mono |
| Icons | Lucide React atau Heroicons |
| Deployment | Vercel |
| Version Control | Git + GitHub |

---

## 10. Kebutuhan Konten

### 10.1 Konten yang Dibutuhkan dari Hilmi

| Item Konten | Keterangan |
|---|---|
| Foto profil | Resolusi minimum 800x800px, background netral atau lingkungan urban. |
| CV dalam format PDF | Akan diunduh langsung dari website. Nama file: `hilmi-abdurrahman-cv.pdf`. |
| Deskripsi diri | 2-3 paragraf tentang latar belakang, fokus studi, dan minat. |
| Data proyek (minimal 3) | Judul, isu, metodologi, tools, dan output. Gambar atau peta masing-masing proyek. |
| Artikel blog (minimal 1) | Untuk mengisi preview di homepage. Format Markdown. |
| Link sosial media | LinkedIn, Instagram, atau platform lain yang ingin ditampilkan. |
| Email kontak | Untuk form kontak dan tampilan di footer. |

### 10.2 Konten Dummy (Placeholder)

Selama konten asli belum tersedia, gunakan dummy berikut:

- Proyek: tiga proyek dummy bertema GIS analisis kerentanan banjir, pemetaan aksesibilitas transportasi, dan simulasi kepadatan urban.
- Foto profil: avatar placeholder dengan inisial HA.
- Artikel blog: satu artikel dummy bertema integrasi AI dalam perencanaan kota.
- CV: file PDF kosong atau placeholder.

---

## 11. Kebutuhan Non-Fungsional

### 11.1 Performa

- Skor Lighthouse: minimum 90 di semua kategori.
- First Contentful Paint (FCP): di bawah 2 detik.
- Frame rate animasi: 60 FPS pada perangkat mid-range.
- Total ukuran deployment: di bawah 25 MB.
- Strategi optimasi: inline SVG, format AVIF/WebP, lazy loading, dynamic import.

### 11.2 Responsivitas

| Breakpoint | Behavior | Catatan |
|---|---|---|
| Desktop (>= 1024px) | Pengalaman penuh: horizontal slide, cursor kustom, animasi lengkap. | Prioritas utama desain. |
| Tablet (768–1023px) | 2 kolom grid, HUD disederhanakan, motion dikurangi. | Tetap harus terlihat profesional. |
| Mobile (< 768px) | Stack vertikal, touch-first, telemetry HUD minimal, cursor standar. | Konten tetap lengkap, tidak ada yang dihapus. |

### 11.3 Aksesibilitas

- Navigasi keyboard: semua elemen interaktif harus bisa diakses via keyboard.
- Reduced motion: hormati preferensi `prefers-reduced-motion` dari sistem operasi pengguna.
- Kontras teks: memenuhi standar WCAG AA minimum.
- Ukuran teks: skala mengikuti preferensi browser pengguna.
- Touch target: minimum 44x44px untuk semua elemen interaktif di mobile.

### 11.4 SEO

- Meta title dan description yang relevan untuk setiap halaman.
- Open Graph image untuk berbagi di media sosial.
- URL yang bersih dan deskriptif.
- Sitemap XML digenerate otomatis oleh Next.js.
- Schema markup untuk profil profesional (Person schema).

### 11.5 Keamanan

- Form kontak menggunakan layanan pihak ketiga (Formspree) untuk menghindari spam.
- Tidak ada data sensitif yang disimpan di frontend.
- Header keamanan dikonfigurasi di Vercel (X-Frame-Options, CSP).

---

## 12. Struktur File Proyek

```plaintext
/metropolis
├── public/
│   ├── cv/                  # File PDF CV Hilmi
│   ├── images/              # Foto profil, thumbnail proyek, gambar umum
│   ├── maps/                # Data GeoJSON untuk peta
│   └── svg/                 # Aset SVG: ikon, dekorasi, grid background
│
├── src/
│   ├── app/                 # App Router Next.js: layout.tsx, page.tsx, dsb.
│   │   ├── blog/            # Halaman daftar artikel dan detail artikel
│   │   └── project/         # Halaman detail proyek (opsional)
│   │
│   ├── components/
│   │   ├── hud/             # Komponen HUD: cursor, telemetry, nav
│   │   ├── gis/             # Komponen peta dan layer GIS
│   │   ├── portfolio/       # Komponen kartu proyek, filter, grid
│   │   ├── motion/          # Wrapper animasi, reveal, scan line
│   │   └── ui/              # Komponen UI umum: tombol, badge, form
│   │
│   ├── content/
│   │   ├── blog/            # File Markdown atau MDX artikel
│   │   └── projects/        # File JSON atau MDX data proyek
│   │
│   ├── lib/                 # Utility functions, konstanta, konfigurasi
│   └── styles/              # File CSS global dan konfigurasi Tailwind
│
└── package.json
```

---

## 13. Fase Pengembangan

| Fase | Cakupan Pekerjaan | Output |
|---|---|---|
| Fase 1: Fondasi | Setup Next.js, Tailwind, GSAP. Implementasi design system (warna, font, spacing). Komponen dasar: nav, hero, footer. | Website berjalan di localhost dengan layout dasar. |
| Fase 2: Konten Utama | Section Hero dengan animasi peta. Section Proyek dengan filter. Section About dan Skills. | Homepage 80% fungsional dengan konten dummy. |
| Fase 3: Fitur Tambahan | Blog dan halaman artikel. Form kontak. Download CV. Cursor kustom. Mode gelap/terang. | Semua fitur wajib berjalan. |
| Fase 4: Animasi & Polish | Implementasi GSAP ScrollTrigger. Horizontal slide engine. Efek telemetry HUD. Optimasi performa. | Pengalaman cinematic lengkap. |
| Fase 5: Konten & Launch | Isi konten asli dari Hilmi. Testing lintas perangkat. Deploy ke Vercel. SEO dan meta tags. | Website live dan siap diakses publik. |

---

## 14. Di Luar Cakupan (Out of Scope)

Berikut adalah fitur yang tidak termasuk dalam versi pertama ini:

- Backend atau database sendiri (semua data statis atau dari file lokal).
- Sistem login atau area member.
- Integrasi real-time GIS dengan data live dari server eksternal.
- Fitur komentar di blog.
- Multibahasa (hanya Bahasa Indonesia di versi pertama).
- E-commerce atau sistem pembayaran.
- Chatbot atau integrasi AI di frontend.

---

## 15. Pertanyaan Terbuka & Item TBD

| Pertanyaan | Status |
|---|---|
| Apakah proyek ditampilkan sebagai modal overlay atau halaman terpisah? | TBD — perlu keputusan dari Hilmi |
| Domain apa yang akan digunakan? | TBD |
| CMS Headless untuk blog atau cukup file Markdown lokal? | TBD — tergantung kemudahan update konten |
| Apakah ada proyek akademik atau organisasi yang ingin ditonjolkan? | TBD — menunggu konten dari Hilmi |
| Foto profil dan CV tersedia kapan? | TBD — menunggu dari Hilmi |
| Apakah ada elemen branding personal selain yang ada di design system? | TBD |
| Apakah section Timeline akademik perlu ada di versi pertama? | TBD |

---

## 16. Metrik Keberhasilan

Website dinyatakan berhasil jika memenuhi semua kriteria berikut dalam 30 hari setelah launch:

1. Skor Lighthouse Performance, Accessibility, dan Best Practices masing-masing di atas 90.
2. Website tampil dengan benar di Chrome, Firefox, Safari, dan Edge versi terbaru.
3. Website responsif dan fungsional di smartphone Android dan iOS.
4. Semua 6 fitur wajib berjalan tanpa error: animasi peta, filter proyek, download CV, form kontak, blog, dan mode gelap/terang.
5. Setidaknya 3 proyek dengan konten asli sudah tampil di website.
6. Website sudah mendapat setidaknya satu respons dari audiens target (kontak masuk, unduhan CV, atau feedback langsung).

---

## 17. Referensi & Dokumen Terkait

| Dokumen | Keterangan |
|---|---|
| `design.md` | Design System Manual lengkap: filosofi, warna, tipografi, interaksi, arsitektur halaman. |
| `design2.md` | Token design system dalam format YAML: nilai warna, tipografi, spacing, border radius. |
| `urban_planning_master_portfolio.html` | Prototype HTML awal yang sudah dibuat sebagai referensi visual. |

---

*PRD ini bersifat living document. Setiap keputusan yang diambil selama pengembangan harus dicatat sebagai catatan revisi di bagian atas dokumen.*

---

**METROPOLIS PRD v1.0.0 | Hilmi Abdurrahman | Mei 2026 | PWK-HUD-V3**
