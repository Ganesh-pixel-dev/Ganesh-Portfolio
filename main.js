import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { initBlueprintGrid } from './src/blueprint-grid.js';

gsap.registerPlugin(ScrollTrigger);

// ─── SMOOTH SCROLL ───
const lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
window.lenis = lenis;

// CTA scroll buttons
document.querySelectorAll('[data-scroll-to]').forEach(btn => {
  btn.addEventListener('click', () => lenis.scrollTo(btn.dataset.scrollTo));
});

// ─── BLUEPRINT GRID ───
requestAnimationFrame(() => requestAnimationFrame(() => initBlueprintGrid('hero-grid')));

// ─── SCROLL PROGRESS BAR ───
lenis.on('scroll', ({ scroll, limit }) => {
  document.getElementById('scroll-progress').style.width = (scroll / limit * 100) + '%';
});

// ─── MORPHING CURSOR ───
const dot   = document.getElementById('cursor-dot');
const ring  = document.getElementById('cursor-ring');
const label = document.getElementById('cursor-label');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let rx = mx, ry = my;

window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  gsap.to(dot, { x: mx, y: my, duration: 0.06, ease: 'none' });
  document.getElementById('spotlight').style.setProperty('--mx', mx + 'px');
  document.getElementById('spotlight').style.setProperty('--my', my + 'px');
});

(function ringLoop() {
  rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
  gsap.set(ring, { x: rx, y: ry });
  requestAnimationFrame(ringLoop);
})();

// ─── CURSOR PARTICLE TRAIL ───
const trailCount = 8;
const trailDots = [];
for (let i = 0; i < trailCount; i++) {
  const td = document.createElement('div');
  td.className = 'cursor-trail-dot';
  document.body.appendChild(td);
  trailDots.push({ el: td, x: window.innerWidth / 2, y: window.innerHeight / 2 });
}

(function trailLoop() {
  trailDots.forEach((td, i) => {
    const target = i === 0 ? { x: mx, y: my } : trailDots[i - 1];
    const ease = 0.18 - i * 0.016;
    td.x += (target.x - td.x) * ease;
    td.y += (target.y - td.y) * ease;
    td.el.style.left = td.x + 'px';
    td.el.style.top  = td.y + 'px';
    td.el.style.opacity = (1 - (i / trailCount)) * 0.6;
    const size = Math.max(2, 5 - i * 0.4);
    td.el.style.width  = size + 'px';
    td.el.style.height = size + 'px';
  });
  requestAnimationFrame(trailLoop);
})();

// ─── CURSOR HOVER STATES ───
// Project images → filled "VIEW" circle
document.querySelectorAll('[data-cursor-label]').forEach(el => {
  const lbl = el.dataset.cursorLabel || 'VIEW';
  const imageWrap = el.querySelector('.panel-image');
  if (imageWrap) {
    imageWrap.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-project');
      document.body.classList.remove('cursor-link');
      label.textContent = lbl;
    });
    imageWrap.addEventListener('mouseleave', () => document.body.classList.remove('cursor-project'));
  }
});

// Regular links and buttons → ring grow
document.querySelectorAll('a, button, .nav-link, .cta-btn, .contact-block').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (!document.body.classList.contains('cursor-project')) {
      document.body.classList.add('cursor-link');
    }
  });
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-link'));
});

// ─── MAGNETIC PULL ───
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.5, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  });
});

// ─── SPLIT HERO NAME INTO CHARS ───
const heroNameEl = document.querySelector('.hero-name');
const heroNameText = heroNameEl.dataset.text;
const words = heroNameText.split(' ');
heroNameEl.innerHTML = words.map(word =>
  `<span class="word">${
    word.split('').map(c => `<span class="char">${c}</span>`).join('')
  }</span>`
).join('<br>');

// ─── GLITCH DECODE EFFECT ───
const glitchChars = '01#@$%<>?{}!_±&▓░▒';
function glitchDecodeChars() {
  const chars = document.querySelectorAll('.hero-name .char');
  chars.forEach((charEl, i) => {
    const original = charEl.textContent;
    const cycles = 4;
    let count = 0;
    setTimeout(() => {
      const iv = setInterval(() => {
        if (count >= cycles) {
          charEl.textContent = original;
          clearInterval(iv);
          return;
        }
        charEl.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        count++;
      }, 60);
    }, i * 30);
  });
}

// ─── LOADER CURTAIN ───
const loader = document.getElementById('loader');
gsap.to(loader, {
  yPercent: -100, duration: 1, ease: 'power4.inOut', delay: 1.6,
  onComplete: () => loader.style.display = 'none'
});

// ─── HERO ENTRANCE TIMELINE ───
const heroTL = gsap.timeline({ delay: 2.0 });
heroTL
  .to('.hero-eyebrow', { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power4.out' })
  .to('.hero-name .char', {
    y: 0, duration: 1, ease: 'power4.out',
    stagger: { amount: 0.6, from: 'start' },
    onStart: glitchDecodeChars
  }, '-=0.5')
  .to('#hero-divider', { width: '50vw', duration: 1.2, ease: 'expo.out' }, '-=0.8')
  .to('.hero-subtitle', { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power3.out' }, '-=0.9')
  .to('.hero-tagline', { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power3.out' }, '-=0.65')
  .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
  .add(() => {
    document.querySelectorAll('.floating-badges .badge').forEach((badge, i) => {
      gsap.to(badge, {
        opacity: 1, scale: 1, duration: 0.8,
        ease: 'back.out(1.7)', delay: i * 0.1,
        onComplete: () => badge.classList.add('visible')
      });
    });
  }, '-=0.3')
  .to('.impact-marker', { opacity: 0.4, stagger: 0.12, duration: 1 }, '-=0.5');

// ─── SECTION LABEL REVEALS ───
gsap.utils.toArray('.section-label').forEach(el => {
  gsap.from(el, {
    clipPath: 'inset(0 100% 0 0)', opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
  ScrollTrigger.create({
    trigger: el, start: 'top 88%',
    onEnter: () => el.classList.add('in-view'),
  });
});

// ─── TIMELINE ITEM REVEALS ───
gsap.utils.toArray('.timeline-item').forEach((el, i) => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.15,
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
  });
});

// ─── BENTO CLIP-PATH REVEALS ───
gsap.utils.toArray('.bento-item').forEach((el, i) => {
  gsap.to(el, {
    clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power4.out',
    delay: (i % 2) * 0.15,
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});

// ─── ANIMATED STAT COUNTERS ───
document.querySelectorAll('.stat-num').forEach(el => {
  const target = +el.dataset.target;
  ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: target > 10 ? 2 : 1.2,
        ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(this.targets()[0].val); }
      });
    }
  });
});

// ─── HORIZONTAL SCROLL PROJECT GALLERY ───
const galleryTrack = document.querySelector('.gallery-track');
const panels = gsap.utils.toArray('.project-panel');
const galleryCounter = document.getElementById('current-project');
const galleryBar = document.querySelector('.gallery-progress-bar');

if (window.innerWidth > 1024 && panels.length > 0) {
  const totalScroll = () => galleryTrack.scrollWidth - window.innerWidth;

  const scrollTween = gsap.to(galleryTrack, {
    x: () => -totalScroll(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.gallery-wrap',
      pin: true,
      scrub: 1.2,
      end: () => '+=' + galleryTrack.scrollWidth,
      invalidateOnRefresh: true,
      onUpdate: self => {
        const progress = self.progress;
        const idx = Math.min(panels.length, Math.floor(progress * panels.length) + 1);
        if (galleryCounter) galleryCounter.textContent = String(idx).padStart(2, '0');
        if (galleryBar) galleryBar.style.width = (progress * 100) + '%';
      }
    }
  });

  // Per-panel info & image entrance
  panels.forEach((panel, idx) => {
    if (idx === 0) return; // first panel is already in view
    const info = panel.querySelector('.panel-info');
    if (info) {
      gsap.fromTo(info,
        { x: 100, opacity: 0 },
        {
          x: 0, opacity: 1,
          immediateRender: false,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: 'left 80%',
            end: 'left 35%',
            scrub: true,
          }
        }
      );
    }
    const img = panel.querySelector('.panel-image');
    if (img) {
      gsap.fromTo(img,
        { scale: 0.85, opacity: 0.3, y: 30 },
        {
          scale: 1, opacity: 1, y: 0,
          immediateRender: false,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: 'left 90%',
            end: 'left 40%',
            scrub: true,
          }
        }
      );
    }
  });

  // Inner image parallax — images shift within their frames as you scroll
  panels.forEach(panel => {
    const imgEl = panel.querySelector('.panel-image img');
    if (imgEl) {
      gsap.fromTo(imgEl,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: 'left 100%',
            end: 'left -100%',
            scrub: true,
          }
        }
      );
    }
  });

  // Active panel detection — toggles .active class for number animation
  panels[0]?.classList.add('active');
  ScrollTrigger.create({
    trigger: '.gallery-wrap',
    start: 'top top',
    end: () => '+=' + galleryTrack.scrollWidth,
    onUpdate: self => {
      const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
      panels.forEach((p, i) => p.classList.toggle('active', i === idx));
    }
  });
}

// ─── CONTACT TYPING EFFECT ───
const typingEl = document.querySelector('.contact-typing');
if (typingEl) {
  const typingText = typingEl.dataset.text;
  ScrollTrigger.create({
    trigger: '.contact-section',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      typingEl.innerHTML = '';
      let i = 0;
      const iv = setInterval(() => {
        typingEl.innerHTML = typingText.slice(0, i + 1) + '<span class="blink">_</span>';
        i++;
        if (i >= typingText.length) {
          clearInterval(iv);
        }
      }, 45);
    }
  });
}

// ─── 3D TILT (Bento cards) ───
document.querySelectorAll('.bento-item').forEach(card => {
  const max = 5;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * max * 2;
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * -max * 2;
    gsap.to(card, { rotateX: rotX, rotateY: rotY, duration: 0.4, ease: 'power2.out', transformPerspective: 800 });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 1.2, ease: 'elastic.out(1,0.4)' });
  });
});

// ─── 3D TILT (Project images in gallery) ───
document.querySelectorAll('.panel-image').forEach(img => {
  const max = 8;
  img.addEventListener('mousemove', e => {
    const r = img.getBoundingClientRect();
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * -max;
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * max;
    gsap.to(img, { rotateX: rotX, rotateY: rotY, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 });
  });
  img.addEventListener('mouseleave', () => {
    gsap.to(img, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,0.5)' });
  });
});

// ─── SCROLL-VELOCITY SKEW ───
let skewVel = 0;
const skewTargets = gsap.utils.toArray('.section-wrapper, .marquee-ribbon, .stats-row, footer');
lenis.on('scroll', ({ velocity }) => {
  skewVel = velocity;
  const skew = Math.max(-2, Math.min(2, velocity * 0.1));
  gsap.to(skewTargets, { skewY: skew, duration: 0.3, ease: 'power2.out' });
});
// Reset skew when scroll stops
let skewTimer = null;
lenis.on('scroll', () => {
  clearTimeout(skewTimer);
  skewTimer = setTimeout(() => {
    gsap.to(skewTargets, { skewY: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
  }, 150);
});

// ─── SECTION SCAN-LINE ───
const scanLine = document.createElement('div');
scanLine.className = 'scan-line';
document.body.appendChild(scanLine);

const sectionTriggers = ['#about', '#experience', '#projects', '#contact'];
sectionTriggers.forEach(sel => {
  const el = document.querySelector(sel) || document.querySelector(sel.replace('#', '.'));
  if (!el) return;
  ScrollTrigger.create({
    trigger: el, start: 'top 70%', once: true,
    onEnter: () => {
      scanLine.classList.remove('active');
      void scanLine.offsetWidth; // force reflow
      scanLine.classList.add('active');
      setTimeout(() => scanLine.classList.remove('active'), 700);
    }
  });
});

// ─── ACTIVE NAV TRACKING ───
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('#about, #projects, #contact');
function updateNav() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.5) current = sec.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === current);
  });
}
lenis.on('scroll', updateNav);

// ─── BUTTON RIPPLE EFFECT ───
document.querySelectorAll('.cta-btn, .panel-link').forEach(btn => {
  btn.addEventListener('click', e => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ─── HERO NAME RE-GLITCH ON HOVER ───
heroNameEl.addEventListener('mouseenter', () => {
  const chars = document.querySelectorAll('.hero-name .char');
  const glitchSet = '01#@$%<>?{}!_±&▓░▒';
  chars.forEach((charEl, i) => {
    const original = charEl.textContent;
    setTimeout(() => {
      let count = 0;
      const iv = setInterval(() => {
        if (count >= 3) { charEl.textContent = original; clearInterval(iv); return; }
        charEl.textContent = glitchSet[Math.floor(Math.random() * glitchSet.length)];
        count++;
      }, 50);
    }, i * 15);
  });
});

// ─── PARALLAX BG TEXT ───
lenis.on('scroll', ({ scroll }) => {
  gsap.set('.parallax-item', { y: -scroll * 0.07 });
});

// ─── KINETIC TEXT SCRAMBLE (hover) ───
const scrambleChars = '01#%&$<>?/[]{}±*@!';
document.querySelectorAll('.hero-name').forEach(el => {
  let iv = null;
  el.addEventListener('mouseenter', () => {
    const orig = el.dataset.text;
    if (!orig) return;
    let iter = 0;
    clearInterval(iv);
    iv = setInterval(() => {
      // Don't scramble when it has char spans — handled differently
      if (iter >= orig.length) clearInterval(iv);
      iter += 0.5;
    }, 28);
  });
});

// ─── INTERSTELLAR CANVAS ───
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let pts = [], scrollVel = 0, lastSY = 0;
const resizeCanvas = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
resizeCanvas(); window.addEventListener('resize', () => { resizeCanvas(); buildPts(); });

class Star {
  constructor(layer) {
    this.layer = layer;
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size   = this.layer * 0.55 + Math.random() * 0.65;
    this.speedY = 0.04 + this.layer * 0.13;
    this.alpha  = 0.05 + (this.layer / 3) * 0.38;
    this.phase  = Math.random() * Math.PI * 2;
    this.phaseSpd = 0.015 + Math.random() * 0.02;
  }
  update() {
    this.phase += this.phaseSpd;
    const a = this.alpha * (0.65 + 0.35 * Math.sin(this.phase));
    const dx = mx - this.x, dy = my - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 150) { this.x -= dx * 0.007; this.y -= dy * 0.007; }
    this.y -= this.speedY * (1 + Math.abs(scrollVel) * 0.1);
    if (this.y < -4)               this.y = canvas.height + 4;
    if (this.y > canvas.height + 4) this.y = -4;
    if (this.x < -4)               this.x = canvas.width + 4;
    if (this.x > canvas.width + 4)  this.x = -4;
    return a;
  }
  draw(a) {
    const pC = getComputedStyle(document.documentElement).getPropertyValue('--p-color').trim() || '241,245,249';
    const stretch = 1 + Math.abs(scrollVel) * 0.06;
    ctx.fillStyle = `rgba(${pC},${a})`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size, this.size * stretch, 0, 0, 6.28);
    ctx.fill();
  }
}

function buildPts() {
  pts = [];
  [120, 55, 25].forEach((n, i) => { for (let j = 0; j < n; j++) pts.push(new Star(i + 1)); });
}
buildPts();

function drawConstellations() {
  const pC = getComputedStyle(document.documentElement).getPropertyValue('--p-color').trim() || '241,245,249';
  const near = pts.filter(p => { const dx = mx - p.x, dy = my - p.y; return dx * dx + dy * dy < 180 * 180; });
  near.forEach(a => {
    near.forEach(b => {
      if (a === b) return;
      const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        ctx.strokeStyle = `rgba(${pC},${(1 - d / 110) * 0.11})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    });
  });
}

(function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sy = window.pageYOffset;
  scrollVel = sy - lastSY; lastSY = sy;
  pts.forEach(p => p.draw(p.update()));
  drawConstellations();
  requestAnimationFrame(render);
})();
