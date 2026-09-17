# DESIGN.md - Arah Desain Portofolio

Design Read: personal engineering portfolio untuk recruiter remote backend/IIoT, bahasa visual terminal-brutalist (design system xai, lihat `docs/xai/`), dial ENERGY 2 / RHYTHM 2 / MOTION 2.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 2

## Alasan tiap keputusan (satu baris, aturan R-31)

- Dark-first monochrome: identitas nyata pekerjaan (SCADA/terminal/Kafka), bukan "dark karena tech". Light mode penuh + toggle, keduanya wajib lolos kontras.
- Geist Mono display + Inter body: aturan inti xai; display = grid monospace arsitektural, body = keterbacaan.
- Radius 0, tanpa shadow/gradient/glass: karakter xai; menghapus slop portofolio lama (Font Awesome, pill, glow, typing animation).
- Satu-satunya aksen warna: ring fokus keyboard biru (token xai), tidak pernah dekoratif.
- RHYTHM 2: tiap section punya komposisi sendiri - Work = timeline + 3 angka agregat; Projects = 1 featured penuh lalu grid 2; About asimetris 60/40; Contact = baris teks. Bukan grid kartu seragam.
- MOTION 2: motion subordinat terhadap konten; entrance opacity + translate maksimum 8px, micro-interaction maksimum 4px, tanpa scale/rotate/parallax, ambient loop hanya satu indikator yang memetakan aliran data nyata, reveal berjalan sekali, `prefers-reduced-motion` dihormati.
- Energi 2: headline display-xl besar tapi weight 300; satu focal point per layar; whitespace 96/160px.
- Data = konten: angka kerja (repos, commits, rentang) diambil dari GitHub API oleh `scripts/collect-data.sh`, diberi tanggal snapshot. Tanpa angka = lebih baik daripada angka bohong.
- Tanpa testimoni, tanpa FAQ, tanpa "Trusted By", tanpa form kontak (tidak ada backend; tombol = mailto nyata).
- Navbar hanya anchor yang benar-benar ada: About, Work, Projects, Contact. Link luar: GitHub, LinkedIn, halaman organisasi, source repo.
- Indikator section aktif di navbar memakai prefix `/` (bukan pill, blob, atau glow): satu halaman panjang butuh penanda posisi, dan `/` sudah menjadi motif tipografi terminal di situs ini.
- Bahasa: EN dan ID aktif. Switcher = teks (`EN ID`), bukan bendera/emoji. Nama produk (OPC UA, Kafka, IEC 104) tidak diterjemahkan. ZH/JA dihapus 2026-09-16 karena tidak ada penutur kompeten yang me-review terjemahannya (R-38: lebih baik tidak ada daripada teks yang tidak bisa dipertanggungjawabkan).
- Hero CTA berurutan: Download CV (primary), View flagship project (secondary), lalu GitHub dan LinkedIn sebagai text link. Alasan: recruiter butuh jalur tercepat ke CV, lalu ke bukti teknis; link sosial bukan keputusan utama.
- Avatar: kotak inisial "JI" (placeholder jujur; foto menyusul bila user sediakan, sesuai R-23).

## Struktur halaman (satu route, anchor)

1. Hero: eyebrow peran, nama (display-xl), 2-3 kalimat nyata, CTA: Download CV, View flagship project, GitHub, LinkedIn.
2. About: paragraf stack nyata + pendidikan (Teknik Informatika, UMS, 2023) + lokasi; kolom kanan ringkas.
3. Work: timeline 2 posisi (PLN Icon Plus sejak Mei 2024; MUTIARA SOLUSINDO Agu 2023 - Apr 2024). Sub-bagian organisasi: link halaman org publik + 3 agregat (21 repositories, 1.344 commits, 2024-2026) + caption snapshot. DILARANG mencantumkan nama repo organisasi di kode ter-commit (privasi perusahaan; dijaga gerbang cek di `scripts/verify.sh`).
4. Projects: 6 repo publik dengan copy terkurasi dari `src/data/project-curation.ts` (pocketkafka featured). Deskripsi mentah GitHub tidak pernah dirender; hanya repo yang punya entri kurasi yang tampil. Tiga di antaranya menautkan case study.
5. Contact: mailto, GitHub, LinkedIn sebagai teks monospace.
6. Footer: nama, Built with Astro + link source repo, tahun.
7. Case study: 3 halaman di `/projects/<slug>/` dan `/id/projects/<slug>/`, satu komponen `CaseStudyPage.astro`, layout spec-sheet bernomor, setiap klaim dapat dilacak ke repo publik.

## Aset

- `public/muhammad-jafar-ikbal-cv.pdf`: CV 1 halaman, sumber HTML di `.hermes/cv/cv.html` (lokal).
- `public/og/portfolio.png`: OG image 1200x630 dari token xai, sumber di `.hermes/og/og.html` (lokal).

## Motion (MOTION 2)

Upgrade dari MOTION 1 ke MOTION 2 pada 2026-09-17. Alasan: situs satu halaman yang panjang kehilangan urutan baca tanpa sinyal masuk yang halus, dan identitas backend/IIoT lebih kuat lewat motion yang terasa seperti signal, state, dan packet daripada dekorasi.

### Aturan

- Motion selalu subordinat terhadap konten: tidak ada animasi yang menghalangi navigation, reading, atau klik CTA.
- Entrance hanya opacity + translateY maksimum 8px, durasi 280-360ms.
- Micro-interaction maksimum translate 4px, durasi 120-180ms.
- Dilarang: scale dekoratif, rotate, parallax, 3D tilt, cursor follower, magnetic button, marquee, bounce, elastic, spring berlebihan, typing animation.
- Ambient loop maksimal satu di viewport yang sama, hanya untuk indikator yang memetakan data nyata.
- Reveal berjalan sekali, lalu observer dilepas.
- `prefers-reduced-motion: reduce` wajib dihormati: tanpa reveal, tanpa loop, tanpa count animation, scroll langsung.
- Progressive enhancement: konten terlihat penuh tanpa JavaScript. Aturan reveal hanya aktif setelah `html.js` dipasang oleh script.
- Hanya `transform` dan `opacity` yang dianimasikan; tidak ada animasi `width`, `height`, `top`, `left`, `margin`, atau `padding`. Timeline memakai `transform: scaleY()` dengan `transform-origin: top`.

### Token

```css
--motion-fast: 120ms;    /* hover/focus link dan tombol */
--motion-base: 180ms;    /* state control: tema, bahasa, border kartu */
--motion-enter: 280ms;   /* entrance hero dan reveal section */
--motion-slow: 360ms;    /* entrance elemen terbesar/dek observasi */
--ease-standard: cubic-bezier(.2, .8, .2, 1);
--ease-enter: cubic-bezier(.16, 1, .3, 1);
```

Stagger: 60ms desktop, 40ms mobile. Batas total delay 350ms.

### Alasan tiap motion

- Hero staggered entrance (280-360ms, maksimum 8px): mata mengikuti urutan peran, nama, deskripsi, CTA, yang memang urutan kepentingan bagi recruiter. Tanpa ini, hero terbaca sebagai satu blok rata.
- Section reveal (280ms, 8px, sekali): menandai batas antar section pada halaman yang panjang, tanpa mengubah layout.
- Indikator section aktif (prefix `/`): memberi posisi baca saat scroll, menggantikan kebutuhan scroll-spy visual yang lebih berat.
- Project hover + arrow 3px: mengarahkan perhatian ke affordance navigasi (case study dan source) pada kartu yang isinya panjang.
- Label bahasa project opacity .55 ke 1 saat hover: bahasa adalah metadata sekunder; meredupkannya menjaga judul sebagai focal point, dan hover mengembalikannya.
- Timeline draw (scaleY dari atas, 400-650ms): garis waktu adalah urutan kronologis, jadi menumbuhkannya ke bawah menyampaikan arah waktu.
- Aliran PocketKafka (loop 2-3 detik, berhenti saat tab tidak aktif atau off-screen): satu-satunya ambient loop. Memetakan jalur data nyata sistem featured (producer, broker, consumer, plus cabang storage) yang tidak bisa ditunjukkan sesingkat itu oleh teks. Dinyatakan `aria-hidden`, dan urutannya tetap ada sebagai teks statis.

### Dilarang pada level ini

Jangan naik ke MOTION 3. Tidak ada scroll-jacking, pin, parallax, WebGL, canvas, particle, Matrix rain, text scramble, terminal boot sequence, neon glow, infinite ticker, atau animated gradient.

## Aturan konten keras

- Semua angka bersumber + tanggal snapshot.
- Tidak ada klaim yang tidak ada buktinya (no "senior architect", no "crypto quant", no "millions of messages per second" tanpa bukti).
- Tidak ada em dash di teks UI.
- Repo source dipublikasikan (keputusan user): link source valid di footer.
- Klaim pada case study hanya boleh berasal dari source publik, README publik, output test/build, atau release.
