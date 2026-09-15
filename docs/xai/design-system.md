---
name: x.ai
mood: Dark-first, monochrome, terminal, infrastructure-grade
category: Industrial
tags: [dark, monochrome, brutalist, minimal, terminal, monospace]
---

# Design System: xai (NeedMCP, style locked 2026-09-15)

Referensi token mentah komponen (18 tipe, resolved design tokens JSON): `components.json`.

## Prinsip inti

- Monochrome ketat. Nilai warna satu-satunya yang bukan #1f2228/#ffffff/rgba turunan: `--ring-focus rgba(59,130,246,0.5)`, khusus indikator fokus keyboard.
- Hierarki lewat opacity teks dan skala tipografi, bukan warna.
- Elevasi = ring `box-shadow: 0 0 0 1px` tanpa blur. DILARANG drop shadow ber-blur.
- DILARANG: gradient, backdrop-filter/glass, border-radius pada komponen (0; 4px jarang), transform/scale di hover. Feedback hover = opacity + border-strong.
- Display (heading besar, label tombol) = Geist Mono weight 300/400. Body = Inter weight 400. Tidak ada font ketiga, tidak ada bold di body.
- Grid 8px. Spacing section 96px, band 160px (maksimum).
- Touch target minimum 44px. Breakpoint TW default; kartu 1 kolom s/d sm, grid 2-3 kolom md+.

## Token kunci (mode gelap sebagai default situs)

| Token | Dark | Light |
|---|---|---|
| background | #1f2228 | #f8f8f8 |
| canvas | #1a1d22 | #ffffff |
| bone | #23262c | #f5f5f5 |
| surface-deep | #181a1f | #e5e5e5 |
| card | rgba(255,255,255,0.03) | rgba(31,34,40,0.03) |
| foreground | #ffffff | #1f2228 |
| body text | rgba(255,255,255,0.7) | rgba(31,34,40,0.7) |
| mute | rgba(255,255,255,0.5) | rgba(31,34,40,0.65) |
| hairline | rgba(255,255,255,0.08) | rgba(31,34,40,0.08) |
| hairline-strong | rgba(255,255,255,0.34) | rgba(31,34,40,0.5) |

Tipografi: display-xxl 320px clamp mobile 48px; display-xl 72px (section opener); display-lg 48px; display-md 30px (judul kartu); heading-lg/md Inter 30/20; body-lg/md/sm 18/16/14; button Geist Mono 14px tracking 1.4px; caption Inter 12px; code Geist Mono 14px.

Komponen: nav-bar 56px border-bottom hairline tanpa blur; button primary = fill foreground/text canvas, secondary = border hairline, tinggi 44px, radius 0; card padding 24px border 1px hairline tanpa shadow; badge 2px 8px uppercase caption; table header surface bg + caption text, divider hairline, tanpa zebra.
