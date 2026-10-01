import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── ACTIVE SIDEBAR NAV TRACKING ───
const navLinks = document.querySelectorAll('.sb-nav-link');
const sections = document.querySelectorAll('#work, #log, #contact');
function updateNav() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.4) current = sec.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === current);
  });
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ─── FLOATING HOVER PREVIEW (follows cursor over project rows) ───
const preview = document.getElementById('hoverPreview');
const previewImg = document.getElementById('hoverPreviewImg');
const rows = document.querySelectorAll('.project-row');
let px = 0, py = 0, tx = 0, ty = 0;
let active = false;

if (window.matchMedia('(min-width: 901px)').matches) {
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      previewImg.src = row.dataset.img;
      preview.classList.add('visible');
      active = true;
    });
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('visible');
      active = false;
    });
  });

  window.addEventListener('mousemove', e => {
    tx = e.clientX + 30;
    ty = e.clientY - 140;
  });

  (function raf() {
    px += (tx - px) * 0.18;
    py += (ty - py) * 0.18;
    if (active) preview.style.transform = `translate(${px}px, ${py}px)`;
    requestAnimationFrame(raf);
  })();
}

// ─── ROW / LOG ENTRANCE ───
gsap.utils.toArray('.project-row').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 20, duration: 0.6, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 92%' }
  });
});
gsap.utils.toArray('.log-row').forEach(el => {
  gsap.from(el, {
    opacity: 0, y: 14, duration: 0.5, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 94%' }
  });
});

// ─── SIDEBAR ENTRANCE ───
gsap.from('.sidebar > *', {
  opacity: 0, y: 12, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.1
});
