/* ========================
   PORTFOLIO — script.js
   anime.js powered
======================== */

// ── Nav scroll effect ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ── Smooth scroll for nav links and buttons ────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

document.querySelectorAll('.magnetic[data-href]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Magnetic button effect ─────────────────────────────────────────
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    anime({
      targets: btn,
      translateX: dx,
      translateY: dy,
      duration: 300,
      easing: 'easeOutQuad'
    });
  });

  btn.addEventListener('mouseleave', () => {
    anime({
      targets: btn,
      translateX: 0,
      translateY: 0,
      duration: 500,
      easing: 'easeOutElastic(1, 0.5)'
    });
  });
});

// ── Hero entrance sequence ─────────────────────────────────────────
function playHeroEntrance() {
  const tl = anime.timeline({ easing: 'easeOutExpo' });

  // Eyebrow
  tl.add({
    targets: '#hero-eyebrow',
    opacity: [0, 1],
    translateY: [-12, 0],
    duration: 600
  });

  // Title lines
  tl.add({
    targets: '.hero-line',
    translateY: ['110%', '0%'],
    duration: 900,
    delay: anime.stagger(120)
  }, '-=200');

  // Sub
  tl.add({
    targets: '#hero-sub',
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 700
  }, '-=400');

  // Actions
  tl.add({
    targets: '#hero-actions',
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 600
  }, '-=400');

  // Terminal
  tl.add({
    targets: '#hero-terminal',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700
  }, '-=200');

  // Scroll hint
  tl.add({
    targets: '#scroll-hint',
    opacity: [0, 0.6],
    translateY: [8, 0],
    duration: 600
  }, '-=300');

  tl.finished.then(() => startTerminal());
}

// ── Terminal typewriter ────────────────────────────────────────────
const terminalLines = [
  { cmd: 'whoami',                output: 'alex — software developer' },
  { cmd: 'cat interests.txt',     output: 'SWE · Data · Full-Stack · Maps' },
  { cmd: 'echo $NEXT_ROLE',       output: 'Microsoft Discovery Intern 🚀' },
];

let termIdx = 0;

function startTerminal() {
  typeCommand(terminalLines[termIdx]);
}

function typeCommand(entry) {
  const cmdEl    = document.getElementById('terminal-cmd');
  const outEl    = document.getElementById('terminal-output');
  const cursor   = document.getElementById('terminal-cursor');

  cmdEl.textContent = '';
  outEl.textContent = '';
  cursor.style.display = 'inline';

  let i = 0;
  const speed = 60;

  function typeChar() {
    if (i < entry.cmd.length) {
      cmdEl.textContent += entry.cmd[i++];
      setTimeout(typeChar, speed);
    } else {
      // pause then show output
      setTimeout(() => {
        cursor.style.display = 'none';
        outEl.textContent = '→ ' + entry.output;

        // animate output
        anime({
          targets: outEl,
          opacity: [0, 1],
          translateX: [-8, 0],
          duration: 400,
          easing: 'easeOutQuad'
        });

        // next line
        setTimeout(() => {
          termIdx = (termIdx + 1) % terminalLines.length;
          typeCommand(terminalLines[termIdx]);
        }, 2200);
      }, 300);
    }
  }

  typeChar();
}

// ── Scroll reveal (IntersectionObserver) ──────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0');

    setTimeout(() => {
      el.classList.add('visible');

      // Animate skill bars if inside a skill category
      el.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });

      // Count up stats
      el.querySelectorAll('.stat-num').forEach(stat => {
        const target = parseInt(stat.dataset.target);
        anime({
          targets: stat,
          innerHTML: [0, target],
          round: 1,
          duration: 1200,
          easing: 'easeOutExpo'
        });
        // mark stat visible
        stat.closest('.stat')?.classList.add('visible');
      });

    }, delay);

    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-block').forEach(el => revealObserver.observe(el));

// ── Skill bar observer (standalone) ───────────────────────────────
const skillBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
    skillBarObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-category').forEach(el => skillBarObserver.observe(el));

// ── Project card hover glow ────────────────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const x     = ((e.clientX - rect.left) / rect.width) * 100;
    const y     = ((e.clientY - rect.top)  / rect.height) * 100;
    const glow  = card.querySelector('.project-card-glow');
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,212,255,0.18), transparent 60%)`;
    }
  });
});

// ── Contact form ───────────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const btn     = e.target.querySelector('.btn-primary');
  const success = document.getElementById('form-success');

  btn.textContent = 'Sending…';
  btn.disabled = true;

  anime({
    targets: btn,
    scale: [1, 0.97, 1],
    duration: 400,
    easing: 'easeInOutQuad'
  });

  // Simulate send
  setTimeout(() => {
    btn.textContent = 'Sent ✓';
    success.style.display = 'flex';
    anime({
      targets: success,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 500,
      easing: 'easeOutQuad'
    });
    e.target.reset();

    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      success.style.display = 'none';
    }, 4000);
  }, 1000);
}

// ── Stagger footer & nav on load ───────────────────────────────────
anime({
  targets: '#navbar',
  translateY: [-20, 0],
  opacity: [0, 1],
  duration: 700,
  easing: 'easeOutExpo'
});

// ── Start everything ───────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Small delay for fonts
  setTimeout(playHeroEntrance, 150);
});
