# PRD: Personal Portfolio Software Engineer

Versi 1.1 | Status: Draft | Pemilik: Timur Dian Radha Sejati | Tanggal: 19 Oktober 2026

## 1. Ringkasan

Website portofolio personal untuk seorang software engineer yang menampilkan proyek, pengalaman kerja, keahlian, dan sertifikat. Konten tidak ditulis manual di kode, melainkan diambil dari dua sumber: **Glio Headless CMS** (master konten) dan **SejatiDimedia API** (6 proyek unggulan yang disinkronkan dari portal
 agency). Situs dibangun dengan **Next.js, Tailwind CSS, Iconify, dan Framer Motion**, lalu di-hosting gratis di **GitHub Pages** (`github.io`) sebagai situs statis.

## 2. Latar Belakang dan Masalah

- Konten portofolio tersebar di beberapa sistem dan sulit dijaga tetap sinkron.
- Mengubah konten lewat edit kode dan deploy ulang memakan waktu.
- Sebagian proyek profesional terikat NDA, sehingga detailnya tidak boleh ditampilkan penuh.
- GitHub Pages hanya menyajikan file statis, jadi tidak ada server untuk menyimpan API key dengan aman.

## 3. Tujuan dan Non-Tujuan

### Tujuan

1. Menampilkan profil profesional yang jelas dan cepat dimuat bagi calon klien, recruiter, dan rekan engineer.
2. Konten cukup diubah di Glio atau portal SejatiDimedia, lalu tampil di situs tanpa menyentuh kode.
3. Biaya hosting nol dan perawatan minimal.
4. Mendukung Bahasa Indonesia dan Inggris, dengan animasi Framer Motion yang membuat tampilan lebih hidup tanpa mengorbankan performa.
5. API key tidak pernah terekspos ke browser pengunjung.

### Non-Tujuan (v1)

- Blog, CMS buatan sendiri, atau panel admin.
- Form kontak dengan backend (v1 memakai tautan email).
- Autentikasi, komentar, atau fitur pengguna.
- Halaman detail per proyek (masuk roadmap).

## 4. Target Pengguna

| Pengguna | Kebutuhan utama |
|---|---|
| Recruiter / hiring manager | Menilai pengalaman dan tech stack dalam hitungan menit |
| Calon klien agency | Melihat proyek unggulan, hasil, dan cara menghubungi |
| Sesama engineer | Melihat kualitas proyek dan teknologi yang dipakai |
| Pemilik situs | Memperbarui konten tanpa deploy manual |

## 5. Ruang Lingkup Fitur

### 5.1 Fitur v1 (wajib)

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F1 | Hero | Nama, peran, ringkasan singkat, tautan email, GitHub, LinkedIn | P0 |
| F2 | Proyek unggulan | 6 proyek dari SejatiDimedia: thumbnail, nama, kategori, ringkasan, tech stack, tautan | P0 |
| F3 | Proyek lainnya | Daftar ringkas sisa proyek dari Glio | P1 |
| F4 | Pengalaman kerja | Timeline dengan posisi, perusahaan, lokasi, periode, poin deskripsi | P0 |
| F5 | Keahlian | Dikelompokkan per kategori, dengan indikator level 0-100 | P1 |
| F6 | Sertifikat | Judul, penerbit, tanggal, tautan kredensial atau file | P1 |
| F7 | Dua bahasa | Rute `/id/` dan `/en/`, pergantian bahasa, redirect awal sesuai bahasa browser | P0 |
| F8 | Penanganan NDA | Proyek `isNda` menampilkan label NDA dan menyembunyikan tautan | P0 |
| F9 | SEO dasar | Title, description, Open Graph, sitemap, robots | P1 |
| F10 | Dark mode | Mengikuti pengaturan sistem | P2 |
| F11 | Animasi | Framer Motion: entrance hero bertahap, parallax gambar proyek, garis timeline mengikuti scroll, bilah keahlian terisi, indikator nav aktif (lihat 10.1) | P1 |

### 5.2 Roadmap (setelah v1)

- Halaman detail proyek (`/projects/[slug]`) dengan dokumen dan studi kasus.
- Form kontak lewat layanan pihak ketiga.
- Gambar Open Graph dinamis.
- Filter proyek berdasarkan kategori atau teknologi.
- Analytics yang menghormati privasi.

## 6. Sumber Data dan Kontrak API

| Sumber | Endpoint | Auth | Data |
|---|---|---|---|
| Glio | `GET /api/public/experiences` | `x-api-key` | Pengalaman kerja |
| Glio | `GET /api/public/certificates` | `x-api-key` | Sertifikat |
| Glio | `GET /api/public/skills` | `x-api-key` | Keahlian |
| Glio | `GET /api/public/projects` | `x-api-key` | Seluruh proyek |
| SejatiDimedia | `GET /api/public/featured-projects` | Publik (CORS) | 6 proyek unggulan |

**Aturan penggabungan:** data proyek unggulan diambil dari SejatiDimedia, lalu dilengkapi atau ditimpa oleh data Glio dengan `slug` yang sama karena lebih lengkap. Jika API SejatiDimedia gagal, 6 proyek pertama berdasarkan `order` dari Glio dipakai sebagai cadangan.

**Lokalisasi:** untuk field berpasangan (`descriptionId`/`descriptionEn`, `summaryId`/`summaryEn`, dan sebagainya), situs memakai bahasa aktif, lalu bahasa lain, lalu field generik.

## 7. Arsitektur dan Keputusan Teknis

| Area | Keputusan | Alasan |
|---|---|---|
| Framework | Next.js (App Router), `output: "export"` | Menghasilkan HTML statis untuk GitHub Pages |
| Styling | Tailwind CSS v4 | Cepat dikembangkan, konsisten |
| Icon | Iconify via plugin Tailwind (Lucide, Simple Icons) | Icon menjadi CSS saat build, tanpa request runtime |
| Animasi | Framer Motion (paket `motion`, impor dari `motion/react`) dengan `LazyMotion` dan komponen `m.*` | Animasi kaya dengan tambahan bundle kecil; berjalan di sisi klien pada situs statis |
| Font | `@fontsource` (self-hosted) | Tidak bergantung CDN pihak ketiga saat build |
| Pengambilan data | Saat build (Server Components) | API key tetap di server/CI, tidak masuk bundle browser |
| Hosting | GitHub Pages lewat GitHub Actions | Gratis, deploy otomatis |
| Bahasa | Rute statis `/id/` dan `/en/` | SEO baik, tanpa flicker |

```
Glio CMS ──────────┐
                   ├─> Build (GitHub Actions) ─> HTML statis ─> GitHub Pages
SejatiDimedia API ─┘
```

**Catatan keamanan penting:** pendekatan awal dengan variabel `VITE_GLIO_API_KEY` akan menanamkan key ke JavaScript publik. Karena itu key hanya dibaca saat build lewat GitHub Secrets (`GLIO_API_KEY`, tanpa prefix `NEXT_PUBLIC_`).

## 8. Strategi Kesegaran Konten

| Pemicu | Mekanisme |
|---|---|
| Push ke `main` | Build dan deploy otomatis |
| Terjadwal | Cron setiap 6 jam |
| Konten berubah | Webhook dari Glio/SejatiDimedia memanggil `repository_dispatch` (`content-updated`) |
| Manual | `workflow_dispatch` |

**Kegagalan:** jika Glio tidak dapat diakses atau key hilang di CI, build gagal sehingga versi situs sebelumnya tetap online. Kegagalan API featured tidak menggagalkan build (memakai fallback).

## 9. Persyaratan Non-Fungsional

| Kategori | Target |
|---|---|
| Performa | Lighthouse Performance minimal 95 di mobile; LCP di bawah 2,5 detik |
| Aksesibilitas | Lighthouse Accessibility minimal 95; navigasi keyboard, fokus terlihat, skip-link, `prefers-reduced-motion` dihormati |
| SEO | Lighthouse SEO minimal 95; sitemap dan robots valid |
| Responsif | Berfungsi dari lebar 320px hingga desktop |
| Keamanan | Tidak ada secret di bundle; tautan eksternal memakai `rel="noopener"` |
| Ketahanan | Tidak ada halaman kosong ter-deploy akibat error API |
| Biaya | Rp0 untuk hosting dan CI |
| Browser | Dua versi mayor terakhir Chrome, Safari, Firefox, Edge |
| Animasi | Tambahan JS maksimal 30 KB gzip; hanya animasi transform dan opacity; tidak ada layout shift; konten tetap tampil tanpa JavaScript atau saat reduced motion aktif |

## 10. Arah Desain

- **Karakter:** tenang, tipografis, profesional; menghindari tampilan template generik.
- **Tipografi:** Fraunces (judul) dan Instrument Sans (isi).
- **Warna:** latar abu-kebiruan terang atau navy gelap, teks tinta, satu aksen biru kobalt.
- **Tata letak:** satu kolom lebar maksimum 64rem, rata kiri; proyek unggulan berupa baris besar bergambar, proyek lain berupa daftar ringkas.
- **Gerak:** terarah dan bermakna, memakai Framer Motion; spesifikasi di 10.1.
- **Konten NDA:** ditandai jelas dengan ikon gembok dan label NDA.

### 10.1 Spesifikasi Animasi (Framer Motion)

Animasi dipakai untuk mengarahkan perhatian dan menandai perubahan, bukan sebagai hiasan di setiap blok. Satu momen utama ada di hero; sisanya halus dan hanya muncul sekali.

| Elemen | Animasi | Pemicu |
|---|---|---|
| Hero | Nama muncul bertahap (stagger per baris), lalu ringkasan dan tautan kontak | Saat halaman dimuat, sekali |
| Proyek unggulan | Gambar bergeser halus (parallax ringan) dan zoom kecil saat hover atau fokus | Scroll, hover, fokus |
| Timeline pengalaman | Garis vertikal tergambar mengikuti progres scroll; titik penanda menyala saat tercapai | Scroll (`useScroll`) |
| Bilah keahlian | Terisi dari 0 ke level masing-masing | Masuk viewport, sekali |
| Navigasi | Indikator tautan aktif berpindah halus (`layoutId`) | Scroll |
| Tombol dan tautan | Umpan balik tekan singkat (`whileTap`) | Interaksi |

**Aturan implementasi**

- Gunakan paket `motion` dan impor dari `motion/react`, dengan `LazyMotion` + `domAnimation` dan komponen `m.*` agar bundle kecil.
- Section tetap Server Components; animasi dibungkus komponen klien kecil (misalnya `Reveal`, `StaggerText`, `ScrollProgressLine`) agar kompatibel dengan static export.
- Bungkus aplikasi dengan `MotionConfig reducedMotion="user"`; pengguna yang mengaktifkan reduced motion hanya melihat perubahan opacity atau tanpa animasi.
- Animasikan hanya `transform` dan `opacity`; hindari animasi `width`, `height`, atau `top`.
- Durasi 200-600 ms, easing seragam di seluruh situs; animasi masuk memakai `viewport={{ once: true }}`.
- Konten harus tetap terlihat jika JavaScript gagal dimuat; kondisi awal tersembunyi hanya diterapkan setelah hidrasi.
- Tidak ada animasi otomatis yang berulang tanpa henti.

**Kriteria penerimaan animasi**

1. Tambahan JS akibat animasi tidak lebih dari 30 KB gzip, dan skor Lighthouse Performance tetap 95 atau lebih.
2. CLS tidak naik akibat animasi (target 0,05 atau lebih rendah).
3. Dengan reduced motion aktif, tidak ada gerakan parallax atau stagger.
4. Semua animasi tetap berjalan 60 fps pada perangkat mobile kelas menengah.

## 11. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Skor Lighthouse (Performance, Accessibility, SEO) | 95 atau lebih |
| Waktu dari perubahan konten ke tampil di situs | Di bawah 10 menit dengan webhook, maksimal 6 jam tanpa webhook |
| Build gagal yang menimpa situs dengan konten kosong | 0 |
| Waktu build | Di bawah 3 menit |
| Kunjungan ke tautan kontak (email, LinkedIn, GitHub) | Dipantau setelah analytics ditambahkan |

## 12. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| API Glio atau SejatiDimedia down saat build | Situs tidak ter-update | Build gagal dengan aman; cron mencoba lagi; fallback untuk featured |
| Perubahan skema API | Komponen error atau data hilang | Tipe TypeScript terpusat, typecheck di CI, field opsional ditangani |
| Kebocoran informasi proyek NDA | Pelanggaran kontrak | Flag `isNda` menyembunyikan tautan; tinjau ringkasan sebelum dipublikasikan |
| Limit GitHub Actions atau Pages | Deploy terhambat | Penggunaan ringan; cron 6 jam masih jauh di bawah batas |
| Gambar eksternal (Unsplash, UploadThing) berubah atau hilang | Gambar rusak | Lazy-load dan placeholder; pertimbangkan menyalin aset saat build |
| Token webhook bocor | Rebuild tidak sah | Fine-grained token dengan izin minimal, disimpan di sisi layanan pengirim |

## 13. Rencana Rilis

| Fase | Cakupan | Kriteria selesai |
|---|---|---|
| M0: Fondasi | Scaffold project, CI/CD, secrets, deploy kosong | Situs tampil di `github.io` |
| M1: Konten inti | Hero, proyek unggulan, pengalaman, `/id` dan `/en` | Data Glio dan SejatiDimedia tampil benar |
| M2: Pelengkap | Keahlian, sertifikat, proyek lain, SEO, dark mode, animasi Framer Motion | Skor Lighthouse tercapai |
| M3: Otomasi | Webhook `repository_dispatch`, pengujian skenario gagal | Perubahan konten tampil dalam 10 menit |
| M4: Peluncuran | Domain, cek aksesibilitas, tinjauan konten NDA | Dipublikasikan |

## 14. Kriteria Penerimaan

1. Mengakses `/` mengarahkan ke `/id/` atau `/en/` sesuai bahasa browser.
2. Enam proyek unggulan dari SejatiDimedia tampil; jika API gagal, fallback dari Glio tampil.
3. Proyek ber-flag NDA tidak menampilkan tautan.
4. Pergantian bahasa mempertahankan semua konten dan mengganti teks sesuai field `Id`/`En`.
5. Hasil build tidak mengandung `GLIO_API_KEY` (diverifikasi dengan mencari string key di folder `out`).
6. Build CI gagal jika `GLIO_API_KEY` kosong atau Glio mengembalikan error.
7. Push ke `main`, jadwal cron, dan `repository_dispatch` semuanya memicu deploy.
8. Seluruh fitur dapat dipakai dengan keyboard saja dan lolos pemeriksaan kontras.

## 15. Pertanyaan Terbuka

- Apakah akan memakai custom domain, atau cukup `username.github.io`?
- Apakah detail proyek (studi kasus) dibutuhkan di v1 atau ditunda?
- Apakah level keahlian dalam persen tetap ditampilkan, atau diganti label seperti Mahir/Menengah?
- Alat analytics apa yang dipakai, jika ada?
- Siapa yang meninjau ringkasan proyek profesional sebelum tampil publik?