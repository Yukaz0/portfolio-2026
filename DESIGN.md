# DESIGN.md - Arah Desain Portofolio

Design Read: personal engineering portfolio untuk recruiter remote backend/IIoT, bahasa visual terminal-brutalist (design system xai, lihat `docs/xai/`), dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Alasan tiap keputusan (satu baris, aturan R-31)

- Dark-first monochrome: identitas nyata pekerjaan (SCADA/terminal/Kafka), bukan "dark karena tech". Light mode penuh + toggle, keduanya wajib lolos kontras.
- Geist Mono display + Inter body: aturan inti xai; display = grid monospace arsitektural, body = keterbacaan.
- Radius 0, tanpa shadow/gradient/glass: karakter xai; menghapus slop portofolio lama (Font Awesome, pill, glow, typing animation).
- Satu-satunya aksen warna: ring fokus keyboard biru (token xai), tidak pernah dekoratif.
- RHYTHM 2: tiap section punya komposisi sendiri - Work = timeline + 3 angka agregat; Projects = 1 featured penuh lalu grid 2; About asimetris 60/40; Contact = baris teks. Bukan grid kartu seragam.
- MOTION 1: hanya perubahan opacity/border saat hover dan transisi tema 150ms. Tanpa scroll reveal, tanpa transform.
- Energi 2: headline display-xl besar tapi weight 300; satu focal point per layar; whitespace 96/160px.
- Data = konten: angka kerja (repos, commits, rentang) diambil dari GitHub API oleh `scripts/collect-data.sh`, diberi tanggal snapshot. Tanpa angka = lebih baik daripada angka bohong.
- Tanpa testimoni, tanpa FAQ, tanpa "Trusted By", tanpa form kontak (tidak ada backend; tombol = mailto nyata).
- Navbar hanya anchor yang benar-benar ada: About, Work, Projects, Contact. Link luar: GitHub, LinkedIn, halaman organisasi, source repo.
- Bahasa: EN default, lalu ID, ZH, JA. Switcher = teks (`EN ID 中文 日本語`), bukan bendera/emoji. Nama produk (OPC UA, Kafka, IEC 104) tidak diterjemahkan.
- Avatar: kotak inisial "JI" (placeholder jujur; foto menyusul bila user sediakan, sesuai R-23).

## Struktur halaman (satu route, anchor)

1. Hero: nama (display-xl), peran = headline LinkedIn, 2-3 kalimat nyata, CTA: Lihat pekerjaan (anchor), GitHub, LinkedIn.
2. About: paragraf stack nyata + pendidikan (Teknik Informatika, UMS, 2023) + lokasi; kolom kanan ringkas.
3. Work: timeline 2 posisi (PLN Icon Plus sejak Mei 2024; MUTIARA SOLUSINDO Agu 2023 - Apr 2024). Sub-bagian organisasi: link halaman org publik + 3 agregat (21 repositories, 1.344 commits, 2024-2026) + caption snapshot. DILARANG mencantumkan nama repo organisasi di kode ter-commit (privasi perusahaan; dijaga gerbang cek di `scripts/verify.sh`).
4. Projects: 6 repo publik (pocketkafka featured), kartu xai, bahasa + link, deskripsi asli dari API.
5. Contact: mailto, GitHub, LinkedIn sebagai teks monospace.
6. Footer: nama, Built with Astro + link source repo, tahun.

## Aturan konten keras

- Semua angka bersumber + tanggal snapshot.
- Tidak ada klaim yang tidak ada buktinya (no "senior architect", no "crypto quant", no "millions of messages per second" tanpa bukti).
- Tidak ada em dash di teks UI.
- Repo source dipublikasikan (keputusan user): link source valid di footer.
