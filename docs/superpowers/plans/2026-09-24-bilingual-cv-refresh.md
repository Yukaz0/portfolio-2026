# Bilingual CV Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create polished English and Indonesian one-page A4 CV PDFs and route each portfolio locale to its matching download.

**Architecture:** Keep the existing HTML-to-PDF workflow as the editable source. Create two language-specific HTML sources under `.hermes/cv/`, render both with headless Chromium to `public/`, and store the language-specific URLs in `profile.json` so `PageShell.astro` selects the correct file from the locale.

**Tech Stack:** HTML/CSS, self-hosted Inter and Geist Mono fonts, Headless Chromium, Poppler (`pdfinfo`, `pdftoppm`), Astro static output.

## Global Constraints

- Both PDFs remain one-page A4 and text-selectable.
- Translate and edit existing facts only; do not invent outcomes, scale, or performance figures.
- Keep private company repository names and client details out of both versions.
- Preserve the monochrome portfolio visual identity with readable typography and restrained accent use.
- The English homepage links to the English PDF; the Indonesian homepage links to the Indonesian PDF.

---

### Task 1: Create the bilingual CV sources and render PDFs

**Files:**
- Create: `.hermes/cv/cv-en.html`
- Create: `.hermes/cv/cv-id.html`
- Create: `public/muhammad-jafar-ikbal-cv-en.pdf`
- Create: `public/muhammad-jafar-ikbal-cv-id.pdf`
- Modify: `public/muhammad-jafar-ikbal-cv.pdf` to remain an English compatibility alias only if the renderer output is identical to the English version.

- [ ] **Step 1: Mark the PDF authoring operation**

Run exactly once before rendering:

```bash
node /home/neu/.codex/plugins/cache/openai-primary-runtime/pdf/26.915.20218/skills/pdf/container_tools/mark_artifact_operation_started.mjs --operation-kind edit --expected-output-count 2 --output-format pdf
```

Expected: command exits successfully.

- [ ] **Step 2: Write the English CV source**

Use the current CV facts but replace Summary with a first-person introduction. Organize sections as Introduction, Experience, Selected projects, Skills, and Education. Keep the existing evidence-backed counts and project claims. Use CSS grid/flex only for alignment, a clear 10-11pt body, 15mm margins, and compact section rules so the page remains one A4 sheet.

- [ ] **Step 3: Write the Indonesian CV source**

Translate the same sections and facts into natural Indonesian. Keep product names and protocol names unchanged. Use the same layout tokens as the English source so both PDFs remain visually parallel.

- [ ] **Step 4: Render both PDFs**

Run:

```bash
chromium --headless --no-sandbox --disable-gpu --print-to-pdf=public/muhammad-jafar-ikbal-cv-en.pdf file:///home/neu/Documents/code/pribadi/portofolio-me-2026/.hermes/cv/cv-en.html
chromium --headless --no-sandbox --disable-gpu --print-to-pdf=public/muhammad-jafar-ikbal-cv-id.pdf file:///home/neu/Documents/code/pribadi/portofolio-me-2026/.hermes/cv/cv-id.html
```

Expected: both files exist and `pdfinfo` reports one A4 page.

- [ ] **Step 5: Keep the legacy PDF path compatible**

Copy the English output over `public/muhammad-jafar-ikbal-cv.pdf` so existing external links keep working while new locale-specific links are introduced.

- [ ] **Step 6: Commit the PDF sources and artifacts**

```bash
git add .hermes/cv/cv-en.html .hermes/cv/cv-id.html public/muhammad-jafar-ikbal-cv*.pdf
git commit -m "feat: add bilingual recruiter CVs"
```

---

### Task 2: Route the portfolio download to the matching language

**Files:**
- Modify: `src/data/profile.json`
- Modify: `src/components/PageShell.astro`

- [ ] **Step 1: Add locale-specific resume paths**

Extend `profile.json` with `resumeUrls.en` and `resumeUrls.id`, preserving `resumeUrl` for compatibility.

- [ ] **Step 2: Select the locale-specific path**

In `PageShell.astro`, replace the single `profile.resumeUrl` reference with `profile.resumeUrls[locale] ?? profile.resumeUrl`, keeping the existing base path handling.

- [ ] **Step 3: Verify generated links**

Run:

```bash
npm run build
rg -n "muhammad-jafar-ikbal-cv-(en|id)\.pdf" dist/index.html dist/id/index.html
```

Expected: English points to `cv-en.pdf`; Indonesian points to `cv-id.pdf`.

- [ ] **Step 4: Commit routing**

```bash
git add src/data/profile.json src/components/PageShell.astro
 git commit -m "feat: localize CV download links"
```

---

### Task 3: Render and inspect both PDFs

**Files:**
- Create: `tmp/pdfs/cv-en.png`
- Create: `tmp/pdfs/cv-id.png`

- [ ] **Step 1: Render page previews**

```bash
mkdir -p tmp/pdfs
pdftoppm -f 1 -l 1 -png -r 144 public/muhammad-jafar-ikbal-cv-en.pdf tmp/pdfs/cv-en
pdftoppm -f 1 -l 1 -png -r 144 public/muhammad-jafar-ikbal-cv-id.pdf tmp/pdfs/cv-id
```

- [ ] **Step 2: Inspect both rendered images**

Check visually for clipping, overflow, unreadable text, awkward page breaks, broken glyphs, and inconsistent hierarchy. If either PDF spills to a second page or clips content, adjust the source CSS and rerender.

- [ ] **Step 3: Verify text and metadata**

```bash
pdfinfo public/muhammad-jafar-ikbal-cv-en.pdf | rg "Pages|Page size"
pdfinfo public/muhammad-jafar-ikbal-cv-id.pdf | rg "Pages|Page size"
pdftotext public/muhammad-jafar-ikbal-cv-en.pdf - | rg "I'm|Muhammad Jafar Ikbal|Experience|Selected projects"
pdftotext public/muhammad-jafar-ikbal-cv-id.pdf - | rg "Saya|Muhammad Jafar Ikbal|Pengalaman|Proyek pilihan"
```

Expected: each reports `Pages: 1`, A4 dimensions, and language-appropriate headings.

- [ ] **Step 4: Run repository validation**

```bash
npm run build
bash scripts/verify.sh
git diff --check
git status --short
```

Expected: build and verification pass, with only intended tracked files changed.
