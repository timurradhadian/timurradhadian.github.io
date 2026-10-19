# Personal Portfolio — Timur Dian Radha Sejati

[![Deploy to GitHub Pages](https://github.com/timurradhadian/timurradhadian.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/timurradhadian/timurradhadian.github.io/actions/workflows/deploy.yml)

🌐 **Live Website**: [https://timurradhadian.github.io/](https://timurradhadian.github.io/)

Situs portofolio personal software engineer berbasis **Next.js (App Router)**, **Tailwind CSS v4**, **Iconify**, dan **Framer Motion**, yang di-export statis dan di-deploy otomatis ke **GitHub Pages**.

---

## 🚀 Arsitektur & Sumber Data

Konten portofolio tidak di-hardcode, melainkan disinkronkan saat proses build (Server-Side build time):

```
Glio Headless CMS ─────┐
                       ├─> Static Build (GitHub Actions) ─> out/ ─> GitHub Pages
SejatiDimedia API ─────┘
```

1. **Glio Headless CMS** (`x-api-key`): Master konten untuk pengalaman kerja, sertifikasi, keahlian, dan seluruh daftar proyek.
2. **SejatiDimedia API** (Publik CORS): Menyediakan 6 proyek unggulan agensi yang disinkronkan langsung dari portal SejatiDimedia.
3. **Penggabungan Data & Fallback**:
   - 6 proyek dari SejatiDimedia diperkaya/ditimpa oleh data Glio dengan `slug` yang sama.
   - Jika API SejatiDimedia tidak dapat diakses, sistem otomatis mengambil 6 proyek teratas dari Glio berdasarkan field `order`.
   - Di lingkungan lokal (tanpa API key), sistem otomatis menggunakan mock data realistis berkualitas tinggi agar pengembang dapat langsung bekerja tanpa setup rumit.
   - Di lingkungan CI (`CI=true`), jika `GLIO_API_KEY` kosong atau request gagal, build akan gagal secara aman (`fail-safe`) sehingga situs versi sebelumnya di GitHub Pages tetap aktif dan tidak tertimpa halaman kosong.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) dengan `output: "export"` & `trailingSlash: true`
- **Styling**: Tailwind CSS v4 & Modern Web Typography (`text-wrap: balance`, `text-wrap: pretty`)
- **Tipografi**: `@fontsource/fraunces` (Headings) & `@fontsource/instrument-sans` (Body)
- **Animasi**: Framer Motion (`motion/react`) dengan `LazyMotion`, `domAnimation`, dan `reducedMotion="user"`
- **Icons**: Iconify via `@iconify/tailwind` (Lucide & Simple Icons yang dikonversi menjadi inline CSS saat build)
- **Bahasa (i18n)**: Rute statis `/id/` dan `/en/`, dengan deteksi bahasa browser otomatis di `/`
- **Hosting**: GitHub Pages via GitHub Actions

---

## 📂 Struktur Direktori

```
├── .github/
│   └── workflows/
│       └── deploy.yml           # Workflow build, audit keamanan secret, & deploy Pages
├── src/
│   ├── app/
│   │   ├── [lang]/              # Rute statis /id/ dan /en/
│   │   │   ├── layout.tsx       # Layout dengan Navbar & Footer
│   │   │   └── page.tsx         # Halaman utama portofolio
│   │   ├── globals.css          # Desain tokens, fontsource, & tailwind setup
│   │   ├── layout.tsx           # Root layout dengan MotionProvider
│   │   ├── page.tsx             # Root redirect otomatis berdasarkan browser locale
│   │   ├── robots.ts            # SEO robots.txt generator
│   │   └── sitemap.ts           # SEO sitemap.xml generator
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, LanguageSwitcher
│   │   ├── motion/              # MotionProvider, Reveal, ScrollProgressLine, SkillBar
│   │   ├── sections/            # Hero, FeaturedProjects, OtherProjects, Experiences, Skills, Certificates
│   │   └── ui/                  # NdaBadge dan komponen UI atomik
│   ├── lib/
│   │   ├── api.ts               # Klien data Glio & SejatiDimedia dengan fallback
│   │   ├── i18n.ts              # Kamus lokalisasi & helper getLocalized()
│   │   ├── mock-data.ts         # Data awal & fallback lokal
│   │   ├── useIsMounted.ts      # Hook deteksi hidrasi tanpa cascading re-render
│   │   └── utils.ts             # Helper cn (clsx + tailwind-merge)
│   └── types/
│       └── portfolio.ts         # Definisi TypeScript kontrak data
├── PRD.md                       # Product Requirements Document
└── next.config.ts               # Konfigurasi Next.js Static Export
```

---

## 💻 Menjalankan di Komputer Lokal

### Prasyarat
- Node.js >= 18.18 (disarankan Node 20+)
- `pnpm` (disarankan v10+)

### 1. Salin Environment Variables
```bash
cp .env.example .env.local
```

### 2. Jalankan Server Pengembangan
```bash
pnpm dev
```
Buka browser di `http://localhost:3000`. Halaman akan otomatis mengarahkan ke `/id/` atau `/en/`.

### 3. Pemeriksaan Kode & Type Checking
```bash
# Typecheck TypeScript
pnpm typecheck

# Lint ESLint
pnpm lint

# Build Static Export
pnpm build
```

---

## 🔒 Keamanan API Key & Validasi Build

Sesuai kriteria penerimaan PRD:
- Variabel rahasia `GLIO_API_KEY` **hanya dibaca saat proses build** dan **tidak menggunakan prefix `NEXT_PUBLIC_`**.
- Pada workflow GitHub Actions (`.github/workflows/deploy.yml`), terdapat langkah pemindaian otomatis:
  ```bash
  grep -rn "$GLIO_API_KEY" out/
  ```
  Jika kunci rahasia terdeteksi masuk ke dalam bundel file statis, pipeline CI akan langsung dibatalkan demi keamanan.

---

## 🌐 Deployment ke GitHub Pages

Proyek ini telah dikonfigurasi dengan GitHub Actions untuk:
1. **Push ke branch `main`**: Build dan deploy otomatis.
2. **Terjadwal (Cron)**: Rebuild otomatis setiap 6 jam (`0 */6 * * *`) untuk menyinkronkan konten terbaru.
3. **Webhook (`repository_dispatch`)**: Rebuild otomatis saat ada event `content-updated` dari Glio CMS.
4. **Manual (`workflow_dispatch`)**: Rebuild melalui tombol 'Run workflow' di tab Actions GitHub.
