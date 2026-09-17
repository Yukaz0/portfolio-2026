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

initReveal();
initActiveSection();
initAmbient();
