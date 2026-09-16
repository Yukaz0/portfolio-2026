#!/usr/bin/env bash
# collect-data.sh - regenerate src/data JSON from GitHub API.
# Outputs:
#   src/data/public-repos.json  (personal public repos)
#   src/data/org-summary.json   (AGGREGATE ONLY: never per-repo org names)
# Requires: gh CLI logged in, jq. Runtime ~3-5 min on first org scan.
set -euo pipefail

ORG="PT-PLN-ICONPLUS"
ME="Yukaz0"
E1="78480281%2BYukaz0%40users.noreply.github.com"  # %40/%2B encode wajib, @/+ mentah = silent 0
E2="jaffrhere23%40gmail.com"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/data"
mkdir -p "$OUT_DIR"

command -v gh >/dev/null || { echo "gh CLI missing"; exit 1; }
command -v jq >/dev/null || { echo "jq missing"; exit 1; }

echo "== public repos =="
# sanitasi em dash dari deskripsi GitHub (R-02: teks UI tanpa em dash), null-safe
gh api "users/$ME/repos?per_page=100" \
  --jq '[.[] | {name, description: (if .description == null then null else .description | gsub("—"; "-") | gsub("–"; "-") end), language, updatedAt: .updated_at, url: .html_url, fork}] | sort_by(.updatedAt) | reverse' \
  > "$OUT_DIR/public-repos.json"

echo "== org scan (aggregate only) =="
names=()
page=1
while :; do
  batch=$(gh api "orgs/$ORG/repos?per_page=100&page=$page" --jq '.[].name')
  [ -z "$batch" ] && break
  while IFS= read -r n; do names+=("$n"); done <<< "$batch"
  [ "$(printf '%s\n' "$batch" | wc -l)" -lt 100 ] && break
  page=$((page+1))
done
echo "org repos visible: ${#names[@]}"

total_commits=0
repos_with=0
first=""
last=""
for repo in "${names[@]}"; do
  repo_hits=0
  for email in "$E1" "$E2"; do
    p=1
    while :; do
      # sukses(2xx)->tanggal; error->out dikosongkan (jangan pakai --silent: body sukses ikut hilang)
      dates=$(gh api "repos/$ORG/$repo/commits?author=$email&per_page=100&page=$p" \
        --jq '.[].commit.author.date' 2>/dev/null) || dates=''
      dates=$(printf '%s\n' "$dates" | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}T' || true)
      n=$( [ -z "$dates" ] && echo 0 || printf '%s\n' "$dates" | wc -l )
      [ "$n" -eq 0 ] && break
      repo_hits=1
      total_commits=$((total_commits + n))
      mn=$(printf '%s\n' "$dates" | sort | head -1)
      mx=$(printf '%s\n' "$dates" | sort | tail -1)
      if [ -z "$first" ] || [[ "$mn" < "$first" ]]; then first="$mn"; fi
      if [ -z "$last" ]  || [[ "$mx" > "$last"  ]]; then last="$mx";  fi
      [ "$n" -lt 100 ] && break
      p=$((p+1))
    done
    # TANPA break di sini: kedua identitas dijumlah (satu repo bisa punya dua-duanya)
  done
  [ "$repo_hits" -eq 1 ] && repos_with=$((repos_with + 1))
done

jq -n \
  --arg org "$ORG" \
  --arg orgUrl "https://github.com/$ORG" \
  --argjson repos "$repos_with" \
  --argjson commits "$total_commits" \
  --arg first "${first:0:7}" --arg last "${last:0:7}" \
  --arg snapshot "$(date -I)" \
  '{org:$org, orgUrl:$orgUrl, repos:$repos, commits:$commits, firstMonth:$first, lastMonth:$last, snapshot:$snapshot}' \
  > "$OUT_DIR/org-summary.json"

echo "== done =="
cat "$OUT_DIR/org-summary.json"
