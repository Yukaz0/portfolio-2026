#!/usr/bin/env bash
# verify.sh - gerbang antislop otomatis. Jalankan dari root repo.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
note() { printf '%s\n' "$*"; }
bad()  { printf 'FAIL: %s\n' "$*"; fail=1; }

note "== build =="
npm run build >/dev/null
[ -f dist/index.html ] || bad "dist/index.html tidak terbentuk"

note "== anchor internal (R-24) =="
ids=$(grep -oE 'id="[a-z-]+"' dist/index.html src/**/*.astro 2>/dev/null | grep -oE 'id="[a-z-]+"' | sort -u | sed 's/id=//;s/"//g' || true)
for a in $(grep -oE 'href="#[a-z-]+"' dist/index.html | sed 's/href="#//;s/"//g' | sort -u); do
  echo "$ids" | grep -qx "$a" || bad "anchor #$a tidak ada targetnya"
done

note "== link eksternal harus 200 =="
# skip: URL situs sendiri (belum live saat lokal) + linkedin (blokir bot, dicek manual di click-through)
for u in $(grep -oE 'href="https://[^"]+"' dist/index.html | sed 's/href="//;s/"//;s/#.*//' | sort -u); do
  case "$u" in
    https://yukaz0.github.io/portfolio-2026*|https://github.com/Yukaz0/portfolio-2026|https://www.linkedin.com/*) note "skip (cek manual): $u"; continue;;
  esac
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$u" || echo 000)
  [ "$code" = "200" ] || [ "$code" = "302" ] || bad "HTTP $code -> $u"
done

note "== em dash di teks (R-02) =="
if grep -rlP '\x{2014}' src/pages src/components src/i18n src/data 2>/dev/null; then bad "ada em dash (lihat file di atas)"; fi

note "== CSS terlarang xai (R-01/10/12) =="
if grep -rnE 'backdrop-filter|linear-gradient|radial-gradient|box-shadow: 0 [0-9]+px' src/styles src/components src/layouts 2>/dev/null | grep -v 'elev-'; then bad "gradient/glass/blur-shadow muncul"; fi

note "== bocor nama repo org (privasi) =="
if [ -f .hermes/data/org-commit-counts.tsv ]; then
  for repo in $(cut -f1 .hermes/data/org-commit-counts.tsv); do
    if grep -rliE "$repo" dist src/data 2>/dev/null | grep -v 'src/data/org-summary.json' | grep -q .; then
      bad "nama repo internal '$repo' muncul di output publik"
    fi
  done
else
  note "(skip: arsip internal tidak ada)"
fi

note "== angka agregat masuk akal =="
jq -e '.repos>0 and .commits>0 and .snapshot' src/data/org-summary.json >/dev/null || bad "org-summary.json kosong/nol"

note "== hreflang =="
for l in en id zh ja; do
  grep -q "hreflang=\"$l\"" dist/index.html || bad "hreflang $l tidak ada"
done

if [ "$fail" = "0" ]; then echo "verify OK"; else echo "verify GAGAL"; exit 1; fi
