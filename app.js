/* ═══════════════════════════════════════════════════════════
   IGNACIO FRAILE — PORTFOLIO PREMIUM
   Interactive JavaScript — Hero & Navigation
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navCta = document.getElementById('navCta');
  const cursorGlow = document.getElementById('cursorGlow');
  const heroSection = document.getElementById('hero');
  const aboutSection = document.getElementById('about');


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
    if (heroSection) {
      heroSection.style.setProperty('--mouse-x', `${mouseX}px`);
      heroSection.style.setProperty('--mouse-y', `${mouseY}px`);
      heroSection.style.setProperty('--mouse-x-norm', normX.toFixed(3));
      heroSection.style.setProperty('--mouse-y-norm', normY.toFixed(3));
    }

    // (About section mouse variables tracking removed)

    // Update cursor glow position
    if (cursorGlow && !isTouch) {
      cursorGlow.style.left = `${mouseX}px`;
      cursorGlow.style.top = `${mouseY}px`;
    }



    rafId = requestAnimationFrame(animateLoop);
  }

    // ══════════════════════════════════════════════════════════
  //  2. BENTO CONSTELLATION CANVAS & TYPEWRITER HELPERS
  // ══════════════════════════════════════════════════════════

  function initConstellationCanvas() {
    const constellationCanvas = document.getElementById('constellation-canvas');
    if (!constellationCanvas) return;
    const ctx = constellationCanvas.getContext('2d');
    const mouseArea = document.querySelector('.about-bento-section');
    if (!mouseArea) return;

    const config = {
      particleCount: 100,      
      connectionDist: 120,     
      mouseDist: 180,          
      particleColor: '#9d4edd', // --lavender-electric
      lineColorSrc: '#1630be'   // --blue-electric
    };

    let particles = [];
    let mouse = { x: null, y: null };

    function resizeCanvas() {
      constellationCanvas.width = mouseArea.clientWidth;
      constellationCanvas.height = mouseArea.clientHeight;
      initParticles();
    }

    class BentoParticle {
      constructor() {
        this.x = Math.random() * constellationCanvas.width;
        this.y = Math.random() * constellationCanvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > constellationCanvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > constellationCanvas.height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < config.mouseDist) {
            let force = (config.mouseDist - dist) / config.mouseDist;
            this.x += (dx / dist) * force * 0.6;
            this.y += (dy / dist) * force * 0.6;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = config.particleColor;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = constellationCanvas.width < 768 ? config.particleCount / 2 : config.particleCount;
      for (let i = 0; i < count; i++) {
        particles.push(new BentoParticle());
      }
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDist) {
            let alpha = (1 - dist / config.connectionDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(22, 48, 190, ${alpha})`; 
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          let dxMouse = particles[i].x - mouse.x;
          let dyMouse = particles[i].y - mouse.y;
          let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < config.mouseDist) {
            let alphaMouse = (1 - distMouse / config.mouseDist) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(22, 48, 190, ${alphaMouse})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
    }

    let isCanvasVisible = false;
    let animationFrameId = null;

    function animate() {
      if (!isCanvasVisible) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }
      ctx.clearRect(0, 0, constellationCanvas.width, constellationCanvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    }

    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible) {
          if (!animationFrameId) {
            animate();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    mouseArea.addEventListener('mousemove', (e) => {
      const rect = constellationCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    mouseArea.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    let resizeTimeoutCanvas;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeoutCanvas);
      resizeTimeoutCanvas = setTimeout(resizeCanvas, 150);
    });
    resizeCanvas();
    canvasObserver.observe(mouseArea);
  }

  function typeElement(element, speed, callback) {
    const originalHTML = element.innerHTML.trim().replace(/\s+/g, ' ');
    element.innerHTML = '';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.classList.add('typing-cursor');
    
    let index = 0;
    function type() {
      if (index < originalHTML.length) {
        if (originalHTML.charAt(index) === '<') {
          const closingTagIndex = originalHTML.indexOf('>', index);
          if (closingTagIndex !== -1) {
            element.innerHTML = originalHTML.substring(0, closingTagIndex + 1);
            index = closingTagIndex + 1;
          } else {
            element.innerHTML = originalHTML.substring(0, index + 1);
            index++;
          }
        } else {
          element.innerHTML = originalHTML.substring(0, index + 1);
          index++;
        }
        setTimeout(type, speed);
      } else {
        element.classList.remove('typing-cursor');
        if (callback) callback();
      }
    }
    type();
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
      const rect = this.canvas.getBoundingClientRect();
      const mx = mouseX - rect.left;
      const my = mouseY - rect.top;

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
  //  2b. TRIANGLE PARTICLE SYSTEM — Dense dots + triangle mesh
  // ══════════════════════════════════════════════════════════

  class TriangleParticleSystem extends ParticleSystem {
    constructor(canvas) {
      super(canvas);
      this.lineMaxDist = 150;
    }

    init() {
      // Much higher density for the about section
      const area = this.width * this.height;
      const count = Math.min(Math.floor(area / 5000), 180);
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.width, this.height));
      }
    }

    drawConnections() {
      const len = this.particles.length;
      const maxDist = this.lineMaxDist;

      // Draw lines between nearby particles AND fill triangles
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dxAB = a.x - b.x;
          const dyAB = a.y - b.y;
          const distAB = Math.sqrt(dxAB * dxAB + dyAB * dyAB);

          if (distAB < maxDist) {
            // Draw the line
            const lineOpacity = (1 - distAB / maxDist) * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${lineOpacity})`;
            this.ctx.lineWidth = 0.6;
            this.ctx.stroke();

            // Look for a third particle to form a triangle
            for (let k = j + 1; k < len; k++) {
              const c = this.particles[k];
              const dxAC = a.x - c.x;
              const dyAC = a.y - c.y;
              const distAC = Math.sqrt(dxAC * dxAC + dyAC * dyAC);

              if (distAC < maxDist) {
                const dxBC = b.x - c.x;
                const dyBC = b.y - c.y;
                const distBC = Math.sqrt(dxBC * dxBC + dyBC * dyBC);

                if (distBC < maxDist) {
                  // All three sides are close — fill the triangle
                  const avgDist = (distAB + distAC + distBC) / 3;
                  const fillOpacity = (1 - avgDist / maxDist) * 0.035;

                  this.ctx.beginPath();
                  this.ctx.moveTo(a.x, a.y);
                  this.ctx.lineTo(b.x, b.y);
                  this.ctx.lineTo(c.x, c.y);
                  this.ctx.closePath();
                  this.ctx.fillStyle = `rgba(0, 240, 255, ${fillOpacity})`;
                  this.ctx.fill();
                }
              }
            }
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
    if (!navToggle || !navLinks || !navCta) return;
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
    if (!navToggle || !navLinks || !navCta) return;
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
    if (!header) return;
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
        if (!targetId || targetId === '#') return;

        try {
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
        } catch (err) {
          console.warn("Smooth scroll error:", err);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  //  5. TEXT TYPING EFFECT for greeting
  // ══════════════════════════════════════════════════════════

  function initTypingEffect() {
    const greeting = document.querySelector('.hero-greeting');
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    const ctaGroup = document.querySelector('.hero-cta-group');

    if (!greeting || !title || !subtitle) return;

    // First hide everything
    greeting.style.opacity = '0';
    title.style.opacity = '0';
    subtitle.style.opacity = '0';
    if (ctaGroup) {
      ctaGroup.style.opacity = '0';
      ctaGroup.style.transform = 'translateY(25px)';
    }

    const delay = 800;

    setTimeout(() => {
      typeElement(greeting, 40, () => {
        typeElement(title, 30, () => {
          typeElement(subtitle, 15, () => {
            if (ctaGroup) {
              ctaGroup.style.opacity = '1';
              ctaGroup.style.transform = 'translateY(0)';
            }
          });
        });
      });
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

  function initSkillsLoader() {
    const boton = document.getElementById('btn-cargar');
    const contenedores = document.querySelectorAll('.skills-section .skill-container');
    if (!boton || contenedores.length === 0) return;

    let estanLlenas = false;

    function animarContador(elemento, inicio, fin, duracion) {
      const inicioTiempo = performance.now();

      function actualizar(tiempoActual) {
        const tiempoTranscurrido = tiempoActual - inicioTiempo;
        const progreso = Math.min(tiempoTranscurrido / duracion, 1);
        const progresoSuave = 1 - Math.pow(1 - progreso, 3); 
        const valorActual = Math.floor(progresoSuave * (fin - inicio) + inicio);
        
        elemento.textContent = `${valorActual}%`;

        if (progreso < 1) {
          requestAnimationFrame(actualizar);
        }
      }

      requestAnimationFrame(actualizar);
    }

    boton.addEventListener('click', () => {
      if (!estanLlenas) {
        contenedores.forEach((contenedor, indice) => {
          setTimeout(() => {
            const barra = contenedor.querySelector('.progress-bar-fill');
            const texto = contenedor.querySelector('.skill-porcentaje');
            const destino = parseInt(barra.getAttribute('data-porcentaje'));

            barra.style.width = `${destino}%`;
            animarContador(texto, 0, destino, 1500); 
          }, indice * 100); 
        });
        
        boton.textContent = 'Resetear Habilidades';
        estanLlenas = true;
        
      } else {
        [...contenedores].reverse().forEach((contenedor, indice) => {
          setTimeout(() => {
            const barra = contenedor.querySelector('.progress-bar-fill');
            const texto = contenedor.querySelector('.skill-porcentaje');
            const actual = parseInt(barra.getAttribute('data-porcentaje'));

            barra.style.width = '0%';
            animarContador(texto, actual, 0, 1000); 
          }, indice * 80);
        });
        
        boton.textContent = 'Cargar Habilidades';
        estanLlenas = false;
      }
    });
  }

  function initMatrixTrail() {
    const canvas = document.getElementById('matrix-trail-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    let chars = [];
    const characters = ['0', '1', '<', '>', '/', '{', '}', ';', '[', ']', '=>', '++', 'js', 'css', 'git'];

    function resize() {
      canvas.width = skillsSection.clientWidth;
      canvas.height = skillsSection.clientHeight;
    }

    class CodeChar {
      constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 30;
        this.y = y + (Math.random() - 0.5) * 30;
        this.char = characters[Math.floor(Math.random() * characters.length)];
        this.alpha = 1.0;
        this.decay = Math.random() * 0.03 + 0.015;
        this.size = Math.random() * 6 + 11;
        this.color = Math.random() > 0.5 ? '#9d4edd' : '#1630be';
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4 - 0.4;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.font = `600 ${this.size}px 'Space Grotesk', monospace`;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillText(this.char, this.x, this.y);
        ctx.restore();
      }
    }

    skillsSection.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (Math.random() < 0.6) {
        chars.push(new CodeChar(x, y));
      }
    });

    let active = false;
    let animationFrameId = null;

    function animate() {
      if (!active) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = chars.length - 1; i >= 0; i--) {
        const c = chars[i];
        c.update();
        if (c.alpha <= 0) {
          chars.splice(i, 1);
        } else {
          c.draw();
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        active = entry.isIntersecting;
        if (active) {
          if (!animationFrameId) {
            animate();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    let resizeTimeoutMatrix;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeoutMatrix);
      resizeTimeoutMatrix = setTimeout(resize, 150);
    });

    resize();
    observer.observe(skillsSection);
  }

  // ══════════════════════════════════════════════════════════
  //  INIT — Bootstrap everything
  // ══════════════════════════════════════════════════════════

  function init() {
    // Touch detection
    detectTouch();

    // Constellation Canvas for Bento Grid
    initConstellationCanvas();

    // Skills logic and code trail matrix canvas
    initSkillsLoader();
    initMatrixTrail();

    // Mouse tracking
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Start animation loop
    animateLoop();

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
      if (nav && !nav.contains(e.target) && navLinks && navLinks.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });

    // Keyboard accessibility — close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks && navLinks.classList.contains('mobile-open')) {
        closeMobileMenu();
        if (navToggle) navToggle.focus();
      }
    });

    // ══════════════════════════════════════════════════════════
    //  SCROLL REVEAL — IntersectionObserver
    // ══════════════════════════════════════════════════════════
    const revealElements = document.querySelectorAll('.reveal-fade-in');
    if (revealElements.length > 0) {
      let hasScrolled = false;
      window.addEventListener('scroll', () => {
        hasScrolled = true;
      }, { once: true, passive: true });

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (hasScrolled) {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-active');
            } else {
              entry.target.classList.remove('reveal-active');
            }
          } else {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-active');
            }
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });
      revealElements.forEach((el) => revealObserver.observe(el));
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

