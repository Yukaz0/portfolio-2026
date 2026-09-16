#!/usr/bin/env bash
# verify.sh - gerbang antislop otomatis. Jalankan dari root repo.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
note() { printf '%s\n' "$*"; }
bad()  { printf 'FAIL: %s\n' "$*"; fail=1; }
step() { printf '\n== %s ==\n' "$*"; }

step "build"
npm run build >/dev/null
[ -f dist/index.html ] || bad "dist/index.html tidak terbentuk"

# dihitung setelah build supaya selalu mencerminkan hasil build terbaru
HTML_FILES=$(find dist -name '*.html' | sort)

step "anchor internal (R-24)"
# anchor sehalaman: id harus ada di file yang sama
for f in $HTML_FILES; do
  ids=$(grep -oE 'id="[a-z-]+"' "$f" 2>/dev/null | sed 's/id="//;s/"//' | sort -u || true)
  for a in $(grep -oE 'href="#[a-z-]+"' "$f" 2>/dev/null | sed 's/href="#//;s/"//' | sort -u || true); do
    echo "$ids" | grep -qx "$a" || bad "anchor #$a tidak ada targetnya di $f"
  done
done
# anchor lintas halaman: /path#frag harus menemukan id di halaman tujuan
for f in $HTML_FILES; do
  for u in $(grep -oE 'href="/[^"]*#[a-z-]+"' "$f" 2>/dev/null | sed 's/href="//;s/"$//' | sort -u || true); do
    path="${u%%#*}"
    frag="${u##*#}"
    target="dist${path}index.html"
    [ -f "$target" ] || target="dist${path}"
    grep -q "id=\"$frag\"" "$target" 2>/dev/null || bad "anchor $u dari $f tidak menemukan id=$frag di $target"
  done
done

step "link internal punya target nyata"
for f in $HTML_FILES; do
  for u in $(grep -oE 'href="/[^"#]*' "$f" 2>/dev/null | sed 's/href="//' | sort -u || true); do
    if [ -f "dist${u}" ] || [ -f "dist${u}index.html" ]; then :; else
      bad "link internal $u tidak ada hasil build-nya (dari $f)"
    fi
  done
done

step "link eksternal harus 200/301/302"
# skip: linkedin (blokir bot, dicek manual di click-through)
# skip: URL situs sendiri (canonical/hreflang; diuji di gate live, bukan lokal)
for f in $HTML_FILES; do
  for u in $(grep -oE 'href="https://[^"]+"' "$f" 2>/dev/null | sed 's/href="//;s/"//;s/#.*//' | sort -u || true); do
    case "$u" in
      https://www.linkedin.com/*) note "skip (cek manual): $u"; continue;;
      https://www.neuralgin.my.id/*) note "skip (uji live): $u"; continue;;
    esac
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$u" || echo 000)
    case "$code" in
      200|301|302) :;;
      *) bad "HTTP $code -> $u";;
    esac
  done
done

step "em dash di teks (R-02)"
if grep -rlP '\x{2014}' src/pages src/components src/i18n src/data 2>/dev/null; then bad "ada em dash (lihat file di atas)"; fi

step "emoji dekoratif di output"
if grep -rIlP '[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]' dist 2>/dev/null; then bad "ada emoji di output publik"; fi

step "CSS terlarang xai (R-01/10/12)"
if grep -rnE 'backdrop-filter|linear-gradient|radial-gradient|box-shadow: 0 [0-9]+px' src/styles src/components src/layouts 2>/dev/null | grep -v 'elev-'; then bad "gradient/glass/blur-shadow muncul"; fi

step "bocor nama repo org (privasi)"
if [ -f .hermes/data/org-commit-counts.tsv ]; then
  for repo in $(cut -f1 .hermes/data/org-commit-counts.tsv); do
    if grep -rliE "$repo" dist src/data 2>/dev/null | grep -v 'src/data/org-summary.json' | grep -q .; then
      bad "nama repo internal '$repo' muncul di output publik"
    fi
  done
else
  note "(skip: arsip internal tidak ada)"
fi

step "angka agregat masuk akal"
jq -e '.repos>0 and .commits>0 and .snapshot' src/data/org-summary.json >/dev/null || bad "org-summary.json kosong/nol"

step "hreflang sesuai locale aktif (en, id)"
for l in en id; do
  grep -q "hreflang=\"$l\"" dist/index.html || bad "hreflang $l tidak ada"
done
if grep -qE 'hreflang="(zh|ja)"' dist/index.html; then bad "hreflang locale yang sudah dihapus masih ada"; fi
for s in 中文 日本語; do
  if grep -rqF "$s" dist --include='*.html'; then bad "sisa string locale lama '$s' masih dirender"; fi
done

step "CV: ada, PDF asli, dan ikut ter-build"
cv="public/muhammad-jafar-ikbal-cv.pdf"
if [ ! -f "$cv" ]; then
  bad "$cv tidak ada"
else
  [ "$(head -c 4 "$cv")" = "%PDF" ] || bad "$cv bukan PDF (signature %PDF tidak ditemukan)"
  [ -f "dist/muhammad-jafar-ikbal-cv.pdf" ] || bad "CV tidak tersalin ke dist/"
  grep -q "href=\"/muhammad-jafar-ikbal-cv.pdf\"" dist/index.html || bad "CTA CV tidak ada di homepage"
fi

step "klaim tanpa bukti tidak boleh tampil"
claims=(
  "millions of messages per second"
  "10+ nodes"
  "The PocketBase of Event Streaming"
  "enterprise-grade"
  "high-performance"
  "high reliability"
  "< 60 MB"
  "< 29 MB"
  "Kadeck-grade"
  "9093"
)
for c in "${claims[@]}"; do
  if grep -rqiF "$c" dist --include='*.html'; then bad "klaim tampil di output publik: '$c'"; fi
done

step "project card memakai copy terkurasi"
# setiap repo terkurasi harus merender ringkasannya (bahasa EN), dan tidak ada
# deskripsi mentah GitHub yang lolos.
grep -qF "A Kafka-compatible event broker written from scratch in Go" dist/index.html \
  || bad "summary kurasi pocketkafka tidak dirender"
grep -qF "The presentation layer of an OPC UA to Kafka to WebSocket pipeline" dist/index.html \
  || bad "summary kurasi industrial-iot-dashboard tidak dirender"
grep -qF "A Kafka alarm consumer that fans notifications out to Telegram and WhatsApp" dist/index.html \
  || bad "summary kurasi digital-gateway-notifier tidak dirender"

step "case study: route, sitemap, canonical"
slugs=$(grep -oE "slug: '[a-z-]+'" src/data/case-studies.ts | sed "s/slug: '//;s/'//" || true)
[ -n "$slugs" ] || bad "tidak ada slug case study terbaca dari src/data/case-studies.ts"
for s in $slugs; do
  [ -f "dist/projects/$s/index.html" ] || bad "case study EN /projects/$s/ tidak terbentuk"
  [ -f "dist/id/projects/$s/index.html" ] || bad "case study ID /id/projects/$s/ tidak terbentuk"
  grep -qF "https://www.neuralgin.my.id/projects/$s/" dist/sitemap-0.xml || bad "case study $s tidak ada di sitemap (EN)"
  grep -qF "https://www.neuralgin.my.id/id/projects/$s/" dist/sitemap-0.xml || bad "case study $s tidak ada di sitemap (ID)"
  grep -qF "href=\"/projects/$s/\"" dist/index.html || bad "homepage tidak menautkan case study $s"
done
grep -qF "https://www.neuralgin.my.id/" dist/sitemap-0.xml || bad "homepage tidak ada di sitemap"

step "canonical memakai domain www"
for f in $HTML_FILES; do
  canon=$(grep -oE 'rel="canonical" href="[^"]+"' "$f" | sed 's/.*href="//;s/"//' || true)
  case "$canon" in
    https://www.neuralgin.my.id/*) :;;
    *) bad "canonical bukan www di $f: '$canon'";;
  esac
done

step "twitter metadata lengkap"
for tag in 'name="twitter:card" content="summary_large_image"' 'name="twitter:title"' 'name="twitter:description"' 'name="twitter:image"'; do
  grep -qF "$tag" dist/index.html || bad "twitter meta hilang: $tag"
done

step "OG image ada dan berukuran 1200x630"
og="public/og/portfolio.png"
if [ ! -f "$og" ]; then
  bad "$og tidak ada"
else
  ow=$(od -An -tu4 -j16 -N4 --endian=big "$og" | tr -d ' ')
  oh=$(od -An -tu4 -j20 -N4 --endian=big "$og" | tr -d ' ')
  [ "$ow" = "1200" ] && [ "$oh" = "630" ] || bad "OG image berukuran ${ow}x${oh}, harus 1200x630"
  grep -qF 'property="og:image:width" content="1200"' dist/index.html || bad "og:image:width hilang"
  grep -qF 'property="og:image:height" content="630"' dist/index.html || bad "og:image:height hilang"
  grep -qF 'property="og:image:alt"' dist/index.html || bad "og:image:alt hilang"
fi

step "JSON-LD Person dapat diparse"
for f in $HTML_FILES; do
  ld=$(grep -oE '<script type="application/ld\+json">.*</script>' "$f" | sed 's/^<script[^>]*>//;s#</script>$##' || true)
  if [ -z "$ld" ]; then bad "JSON-LD tidak ada di $f"; continue; fi
  echo "$ld" | jq -e '."@type" == "Person" and (.name|length>0) and (.sameAs|length==2)' >/dev/null \
    || bad "JSON-LD tidak valid sebagai Person di $f"
done

if [ "$fail" = "0" ]; then echo; echo "verify OK"; else echo; echo "verify GAGAL"; exit 1; fi
