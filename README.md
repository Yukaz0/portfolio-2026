# Portfolio 2026

Situs portofolio Muhammad Jafar Ikbal. Statis, satu halaman, 4 bahasa (EN, ID, ZH, JA), tema gelap dengan pilihan terang.

## Teknologi

- Astro 7 (output statis) + Tailwind CSS 4 via `@tailwindcss/vite`
- Design system: xai (`docs/xai/`), arah di `DESIGN.md`
- Deploy: GitHub Actions ke GitHub Pages (`yukaz0.github.io/portfolio-2026`)

## Development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # hasil di dist/
npx serve dist   # pratinjau build produksi
```

## Data konten

Semua angka dan daftar repo di situs digenerate, bukan ditulis manual:

```sh
bash scripts/collect-data.sh
```

Butuh `gh` CLI yang sudah login (`gh auth status`). Hasilnya:

- `src/data/public-repos.json` - repo publik pribadi (nama, deskripsi, bahasa, url)
- `src/data/org-summary.json` - AGREGAT kerja organisasi (jumlah repo, total commit, rentang, tanggal snapshot). Nama repo organisasi sengaja TIDAK disimpan ke file yang ter-commit.

`profile.json`, `experience.json`, `education.json` diisi manual (sumber: LinkedIn, lihat `.hermes/plans/`).

## Validasi

```sh
bash scripts/verify.sh
```

Build + cek anchor mati, link eksternal 404, em dash, pola CSS terlarang (shadow/gradient/glass), dan kebocoran nama repo internal.

## Catatan privasi

Repo ini publik. Jangan pernah menambahkan nama repository organisasi, konfigurasi internal, atau data klien ke `src/`. Arahannya: angka agregat + link halaman organisasi.
