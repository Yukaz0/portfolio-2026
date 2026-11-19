// Motion enhancement (MOTION 2). Script ini hanya menambah class; animasinya
// ada di motion.css, jadi konten tetap terbaca ketika script gagal dimuat.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Reveal section, sekali saja, lalu observer dilepas.
function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger]');
  if (targets.length === 0) return;

  if (prefersReducedMotion.matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
  );

  targets.forEach((el) => observer.observe(el));
}

// Pita deteksi section aktif dipersempit ke tengah-atas viewport supaya section
// dianggap aktif saat dibaca, bukan saat menyentuh tepi bawah layar. Footer jadi
// penanda "sudah di ujung": section terakhir lebih pendek dari pita itu, jadi
// tanpa penanda ini indikator tertinggal di section sebelumnya yang tinggi.
function initActiveSection() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-section]'));
  const links = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-link]'));
  if (sections.length === 0 || links.length === 0) return;

  const footer = document.querySelector('footer');
  const visible = new Set<string>();
  let atEnd = false;

  const sync = () => {
    const current = atEnd
      ? sections[sections.length - 1]
      : sections.find((section) => visible.has(section.dataset.navSection ?? ''));

    for (const link of links) {
      if (current && link.dataset.navLink === current.dataset.navSection) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.navSection ?? '';
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
      }
      sync();
    },
    { rootMargin: '-30% 0px -55% 0px' },
  );

  sections.forEach((section) => observer.observe(section));

  if (footer) {
    const endObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) atEnd = entry.isIntersecting;
        sync();
      },
      { rootMargin: '0px' },
    );
    endObserver.observe(footer);
  }
}

// Ambient loop hanya berjalan saat diagram terlihat dan tab aktif.
function initAmbient() {
  const ambient = Array.from(document.querySelectorAll<HTMLElement>('[data-ambient]'));
  if (ambient.length === 0) return;

  const setPaused = (paused: boolean) => {
    for (const el of ambient) el.classList.toggle('is-paused', paused);
  };

  document.addEventListener('visibilitychange', () => setPaused(document.hidden));

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      }
    },
    { threshold: 0 },
  );

  ambient.forEach((el) => observer.observe(el));
}

// Angka statistik menghitung naik sekali saat terlihat. Nilai akhir sudah ada di
// HTML, jadi tanpa JavaScript atau dengan reduced motion angka tetap benar.
function initCount() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  if (els.length === 0 || prefersReducedMotion.matches) return;

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(target * (1 - (1 - p) ** 3)).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );
  els.forEach((el) => observer.observe(el));
}

// Posisi kursor untuk border spotlight kartu proyek.
function initSpotlight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.addEventListener('pointermove', (e) => {
    const card = (e.target as Element).closest?.<HTMLElement>('.project-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

initReveal();
initActiveSection();
initAmbient();
initCount();
initSpotlight();
