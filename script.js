/**
 * TELSIO ISIDORO — PORTFOLIO SCRIPT
 * "Terminal Vivo" — Interactive animations & system behaviors
 */

'use strict';

/* ============================================================
   0. UTILITY
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   1. BOOT SEQUENCE
   ============================================================ */
function initBoot() {
  const overlay   = $('#boot-overlay');
  const linesEl   = $('#boot-lines');
  const barEl     = $('#boot-bar');
  const statusEl  = $('#boot-status');

  const lines = [
    '> BIOS v2026.04 detected...',
    '> Loading kernel: telsio.dev.sys',
    '> Mounting file system... [OK]',
    '> Initializing network stack...',
    '> Loading portfolio modules:',
    '   [■■■] hero.js        [OK]',
    '   [■■■] projects.js    [OK]',
    '   [■■■] stack.js       [OK]',
    '   [■■■] contact.js     [OK]',
    '> All modules loaded. Launching UI...',
  ];

  const statuses = [
    'LOADING MODULES...', 'MOUNTING ASSETS...', 'BOOT COMPLETE'
  ];

  let lineIndex = 0;
  let progress  = 0;

  function addLine() {
    if (lineIndex >= lines.length) return;
    const div = document.createElement('div');
    div.className = 'boot-line';
    div.textContent = lines[lineIndex];
    div.style.animationDelay = '0ms';
    linesEl.appendChild(div);
    lineIndex++;
  }

  // Animate progress bar and lines
  const lineInterval = setInterval(() => {
    addLine();
    progress = Math.min(100, progress + Math.random() * 18 + 8);
    barEl.style.width = progress + '%';

    if (progress > 40)  statusEl.textContent = statuses[1];
    if (progress >= 100) statusEl.textContent = statuses[2];

    if (lineIndex >= lines.length) {
      clearInterval(lineInterval);
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.add('booted');
        // Trigger hero animations
        initHero();
      }, 600);
    }
  }, 140);
}

/* ============================================================
   2. CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor = $('#cursor');
  const trail  = $('#cursor-trail');
  if (!cursor || !trail) return;

  let mx = -100, my = -100;
  let tx = -100, ty = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Smooth trail follows
  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    rafId = requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Cursor interactions
  const hoverEls = $$('a, button, .project-card, .pillar, .tag, .contact-link, .stack-category');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hover');
      trail.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hover');
      trail.classList.remove('is-hover');
    });
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity  = '0';
    trail.style.opacity   = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity  = '1';
    trail.style.opacity   = '1';
  });
}

/* ============================================================
   3. GRID CANVAS — animated dot grid background
   ============================================================ */
function initGridCanvas() {
  const canvas = $('#grid-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W, H, dots = [];
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const spacing = 48;
    const cols = Math.ceil(W / spacing) + 1;
    const rows = Math.ceil(H / spacing) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x:   c * spacing,
          y:   r * spacing,
          ox:  c * spacing,
          oy:  r * spacing,
          vx:  0,
          vy:  0,
          size: 1,
        });
      }
    }
  }

  const section = $('.section-hero');
  if (section) {
    section.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    section.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    dots.forEach(d => {
      const dx    = mouseX - d.x;
      const dy    = mouseY - d.y;
      const dist  = Math.sqrt(dx * dx + dy * dy);
      const radius = 100;

      if (dist < radius) {
        const force = (radius - dist) / radius;
        d.vx -= (dx / dist) * force * 2;
        d.vy -= (dy / dist) * force * 2;
      }

      // Spring back
      d.vx += (d.ox - d.x) * 0.08;
      d.vy += (d.oy - d.y) * 0.08;
      // Damping
      d.vx *= 0.75;
      d.vy *= 0.75;
      d.x  += d.vx;
      d.y  += d.vy;

      // Color based on proximity to mouse
      const mdist = Math.sqrt((mouseX - d.x) ** 2 + (mouseY - d.y) ** 2);
      const alpha = mdist < 120 
        ? 0.08 + (1 - mdist / 120) * 0.4 
        : 0.08;
      const color = mdist < 120
        ? `rgba(96, 165, 250, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size + (mdist < 120 ? (1 - mdist / 120) * 1.5 : 0), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ============================================================
   4. HERO ANIMATIONS
   ============================================================ */
function initHero() {
  initTypewriter();
  initCounters();
}

// Typewriter effect for hero role
function initTypewriter() {
  const el     = $('#role-typewriter');
  if (!el) return;

  const roles  = [
    'Full-Stack Developer',
    'PHP & Node.js Specialist',
    'Real-Time Systems Architect',
    'Backend Engineer',
  ];

  let roleIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let timeout;

  function type() {
    const current = roles[roleIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        timeout = setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting  = false;
        roleIdx   = (roleIdx + 1) % roles.length;
      }
    }

    timeout = setTimeout(type, deleting ? 45 : 75);
  }

  timeout = setTimeout(type, 500);
}

// Animated number counters
function initCounters() {
  const counters = $$('.stat-num');
  counters.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current  = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 35);
  });
}

/* ============================================================
   5. NAVIGATION
   ============================================================ */
function initNav() {
  const header  = $('.site-header');
  const toggle  = $('#nav-toggle');
  const mobileMenu = $('#mobile-menu');

  // Scrolled state
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });

  // Close mobile menu on link click
  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', true);
    });
  });

  // Smooth scroll for all anchor links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id  = link.getAttribute('href');
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   6. SCROLL REVEAL (Intersection Observer)
   ============================================================ */
function initReveal() {
  const els = $$('.reveal-up');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   7. PROFICIENCY BARS ANIMATION
   ============================================================ */
function initProfBars() {
  const bars = $$('.prof-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.dataset.width;
        // Slight delay for dramatic effect
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(b => observer.observe(b));
}

/* ============================================================
   8. TERMINAL CODE ANIMATION
   ============================================================ */
function initTerminal() {
  const el = $('#terminal-code-content');
  if (!el) return;

  const codeLines = [
    { text: "// Telsio's engineering philosophy", class: 't-comment' },
    { text: '' },
    { text: 'const developer = {', class: 't-punct' },
    { text: "  <span class='t-prop'>name</span><span class='t-punct'>:</span> <span class='t-string'>'Telsio Isidoro'</span><span class='t-punct'>,</span>" },
    { text: "  <span class='t-prop'>stack</span><span class='t-punct'>:</span> <span class='t-punct'>[</span><span class='t-string'>'PHP'</span><span class='t-punct'>,</span> <span class='t-string'>'Node.js'</span><span class='t-punct'>,</span> <span class='t-string'>'MySQL'</span><span class='t-punct'>],</span>" },
    { text: "  <span class='t-prop'>philosophy</span><span class='t-punct'>:</span> <span class='t-string'>'clean · fast · minimal'</span><span class='t-punct'>,</span>" },
    { text: "  <span class='t-fn'>build</span><span class='t-punct'>(</span><span class='t-value'>idea</span><span class='t-punct'>) {</span>" },
    { text: "    <span class='t-keyword'>return</span> <span class='t-fn'>ship</span><span class='t-punct'>(</span><span class='t-fn'>optimize</span><span class='t-punct'>(</span><span class='t-fn'>architect</span><span class='t-punct'>(</span>idea<span class='t-punct'>)))</span><span class='t-punct'>;</span>" },
    { text: "  <span class='t-punct'>}</span>" },
    { text: '<span class="t-punct">};</span>' },
    { text: '' },
    { text: "developer.<span class='t-fn'>build</span><span class='t-punct'>(</span><span class='t-string'>'your next project'</span><span class='t-punct'>);</span>" },
    { text: "<span class='t-comment'>// → Deployed. Optimized. Live.</span>" },
  ];

  let lineIdx  = 0;
  let observer;

  function writeLines() {
    if (lineIdx >= codeLines.length) return;
    const line = codeLines[lineIdx++];
    const span = document.createElement('span');
    span.style.display = 'block';

    if (line.text === '') {
      span.innerHTML = '&nbsp;';
    } else if (line.class) {
      span.className = line.class;
      span.textContent = line.text;
    } else {
      span.innerHTML = line.text;
    }

    el.appendChild(span);
    // Add a blinking cursor after last line
    if (lineIdx === codeLines.length) {
      span.innerHTML += "<span class='cursor-blink' style='color:var(--accent)'>_</span>";
    }

    setTimeout(writeLines, 80);
  }

  // Start when visible
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && lineIdx === 0) {
        setTimeout(writeLines, 400);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(el.closest('.terminal-block'));
}

/* ============================================================
   9. PROJECT CARD TILT EFFECT
   ============================================================ */
function initCardTilt() {
  const cards = $$('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `
        translateY(-4px) 
        rotateX(${-dy * 3}deg) 
        rotateY(${dx * 3}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s var(--ease)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

/* ============================================================
   10. GLITCH TEXT EFFECT ON HERO NAME (hover on accent-line)
   ============================================================ */
function initGlitch() {
  const nameLines = $$('.name-line');
  nameLines.forEach(line => {
    line.addEventListener('mouseenter', () => {
      line.dataset.original = line.textContent;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%';
      let iteration = 0;
      const original  = line.textContent;
      const interval = setInterval(() => {
        line.textContent = original.split('').map((char, idx) => {
          if (char === ' ') return ' ';
          if (idx < iteration) return original[idx];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iteration >= original.length) clearInterval(interval);
        iteration += 0.5;
      }, 35);
    });
  });
}

/* ============================================================
   11. NOISE TEXTURE OVERLAY (subtle grain on hero)
   ============================================================ */
function initNoiseOverlay() {
  const hero = $('.section-hero');
  if (!hero) return;

  const canvas  = document.createElement('canvas');
  canvas.width  = 256;
  canvas.height = 256;
  canvas.setAttribute('aria-hidden', 'true');

  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(256, 256);
  const d   = img.data;

  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 8; // very subtle
  }

  ctx.putImageData(img, 0, 0);

  const overlay = document.createElement('div');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    background-image: url(${canvas.toDataURL()});
    background-repeat: repeat;
    pointer-events: none;
    z-index: 1;
    opacity: 0.4;
  `;
  hero.appendChild(overlay);
}

/* ============================================================
   12. SECTION NUMBER COUNTER — animated on scroll
   ============================================================ */
function initSectionNumbers() {
  const nums = $$('.section-num');
  nums.forEach((num, i) => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          num.style.opacity = '0';
          num.style.transform = 'translateX(-10px)';
          setTimeout(() => {
            num.style.transition = 'all 0.5s var(--ease)';
            num.style.opacity = '1';
            num.style.transform = 'translateX(0)';
          }, 100 + i * 100);
          observer.unobserve(num);
        }
      });
    }, { threshold: 1 });
    observer.observe(num);
  });
}

/* ============================================================
   INIT — wait for DOM
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBoot();
  initCursor();
  initGridCanvas();
  initNav();
  initReveal();
  initProfBars();
  initTerminal();
  initCardTilt();
  initGlitch();
  initNoiseOverlay();
  initSectionNumbers();
});