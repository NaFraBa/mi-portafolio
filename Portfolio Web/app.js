/* ═══════════════════════════════════════════════════════════
   IGNACIO FRAILE — PORTFOLIO PREMIUM
   Interactive JavaScript — Hero & Navigation
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────
  const header     = document.getElementById('header');
  const navToggle  = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');
  const navCta     = document.getElementById('navCta');
  const cursorGlow = document.getElementById('cursorGlow');
  const heroSection = document.getElementById('hero');
  const canvas     = document.getElementById('hero-particles');
  const orbs       = document.querySelectorAll('.hero-orb');

  // ── State ───────────────────────────────────────────────
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;
  let rafId = null;
  let isTouch = false;

  // ══════════════════════════════════════════════════════════
  //  1. MOUSE TRACKING — Smooth gradient + orb parallax
  // ══════════════════════════════════════════════════════════

  /**
   * Lerp (linear interpolation) for smooth cursor following
   */
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Update mouse coordinates and CSS variables
   */
  function onMouseMove(e) {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }

  /**
   * Main animation loop — runs at 60fps
   * Smoothly interpolates cursor position and updates all
   * mouse-dependent effects (gradient, orbs, glow).
   */
  function animateLoop() {
    // Smooth interpolation
    mouseX = lerp(mouseX, targetMouseX, 0.08);
    mouseY = lerp(mouseY, targetMouseY, 0.08);

    // Normalized values (0–1)
    const normX = mouseX / window.innerWidth;
    const normY = mouseY / window.innerHeight;

    // Update CSS custom properties for background gradients
    document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
    document.documentElement.style.setProperty('--mouse-x-norm', normX.toFixed(3));
    document.documentElement.style.setProperty('--mouse-y-norm', normY.toFixed(3));

    // Update cursor glow position
    if (cursorGlow && !isTouch) {
      cursorGlow.style.left = `${mouseX}px`;
      cursorGlow.style.top  = `${mouseY}px`;
    }

    // Parallax orbs — each orb moves at different speed
    const parallaxFactors = [0.03, -0.02, 0.015];
    orbs.forEach((orb, i) => {
      const factor = parallaxFactors[i] || 0.02;
      const offsetX = (mouseX - window.innerWidth / 2) * factor;
      const offsetY = (mouseY - window.innerHeight / 2) * factor;
      orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    rafId = requestAnimationFrame(animateLoop);
  }

  // ══════════════════════════════════════════════════════════
  //  2. PARTICLE SYSTEM — Floating dots with mouse interaction
  // ══════════════════════════════════════════════════════════

  class Particle {
    constructor(canvasWidth, canvasHeight) {
      this.reset(canvasWidth, canvasHeight);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.baseOpacity = this.opacity;
      this.pulseSpeed = Math.random() * 0.01 + 0.005;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(w, h, mx, my, time) {
      // Base movement
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction — subtle attraction/repulsion
      const dx = mx - this.x;
      const dy = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 200;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 0.008;
        this.x += dx * force;
        this.y += dy * force;
        this.opacity = this.baseOpacity + (1 - dist / maxDist) * 0.3;
      } else {
        this.opacity = this.baseOpacity;
      }

      // Pulse
      this.opacity += Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.05;

      // Wrap around edges
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 108, 247, ${Math.max(0, this.opacity)})`;
      ctx.fill();
    }
  }

  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.time = 0;
      this.lineMaxDist = 120;
      this.resize();
      this.init();
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }

    init() {
      // Number of particles based on screen size (performance-aware)
      const area = this.width * this.height;
      const count = Math.min(Math.floor(area / 12000), 80);
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.width, this.height));
      }
    }

    update() {
      this.time++;
      const mx = mouseX;
      const my = mouseY;

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Update and draw particles
      for (const p of this.particles) {
        p.update(this.width, this.height, mx, my, this.time);
        p.draw(this.ctx);
      }

      // Draw connection lines between nearby particles
      this.drawConnections();
    }

    drawConnections() {
      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.lineMaxDist) {
            const opacity = (1 - dist / this.lineMaxDist) * 0.12;
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.strokeStyle = `rgba(74, 108, 247, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  //  3. NAVIGATION
  // ══════════════════════════════════════════════════════════

  /**
   * Mobile menu toggle
   */
  function toggleMobileMenu() {
    const isOpen = navToggle.classList.toggle('active');
    navLinks.classList.toggle('mobile-open');
    navCta.classList.toggle('mobile-open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    navToggle.classList.remove('active');
    navLinks.classList.remove('mobile-open');
    navCta.classList.remove('mobile-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  }

  /**
   * Header scroll state
   */
  function updateHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /**
   * Active navigation link tracking
   */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  //  4. SMOOTH SCROLL for anchor links
  // ══════════════════════════════════════════════════════════

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);

        if (targetEl) {
          const offsetTop = targetEl.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });

          // Close mobile menu if open
          closeMobileMenu();
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  //  5. TEXT TYPING EFFECT for greeting
  // ══════════════════════════════════════════════════════════

  function initTypingEffect() {
    const greeting = document.querySelector('.hero-greeting');
    if (!greeting) return;

    const text = greeting.textContent;
    greeting.textContent = '';
    greeting.style.opacity = '1';
    greeting.style.transform = 'none';
    greeting.style.animation = 'none';
    greeting.style.borderRight = '2px solid var(--color-accent)';

    let i = 0;
    const speed = 60;
    const delay = 800; // Wait for badge animation

    setTimeout(() => {
      function type() {
        if (i < text.length) {
          greeting.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          // Blink cursor then remove
          setTimeout(() => {
            greeting.style.borderRight = 'none';
          }, 2000);
        }
      }
      type();
    }, delay);
  }

  // ══════════════════════════════════════════════════════════
  //  6. TOUCH DETECTION
  // ══════════════════════════════════════════════════════════

  function detectTouch() {
    window.addEventListener('touchstart', () => {
      isTouch = true;
      if (cursorGlow) cursorGlow.style.display = 'none';
    }, { once: true });
  }

  // ══════════════════════════════════════════════════════════
  //  INIT — Bootstrap everything
  // ══════════════════════════════════════════════════════════

  function init() {
    // Touch detection
    detectTouch();

    // Particle system
    let particleSystem = null;
    if (canvas) {
      particleSystem = new ParticleSystem(canvas);
    }

    // Mouse tracking
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Start animation loop
    animateLoop();

    // Particle animation loop (separate from cursor for clarity)
    function animateParticles() {
      if (particleSystem) {
        particleSystem.update();
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Navigation events
    if (navToggle) {
      navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Scroll events (throttled)
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          updateHeaderScroll();
          updateActiveNavLink();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (particleSystem) {
          particleSystem.resize();
          particleSystem.init();
        }
        closeMobileMenu();
      }, 250);
    });

    // Smooth scroll
    initSmoothScroll();

    // Typing effect
    initTypingEffect();

    // Initial scroll state check
    updateHeaderScroll();

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      const nav = document.getElementById('navPill');
      if (nav && !nav.contains(e.target) && navLinks.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });

    // Keyboard accessibility — close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        closeMobileMenu();
        navToggle.focus();
      }
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
