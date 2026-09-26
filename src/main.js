import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/main.css';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  const label = () =>
    toggle.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  label();
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      label();
    };
    if (document.startViewTransition && !reducedMotion) document.startViewTransition(apply);
    else apply();
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable: theme still applies for this page */
    }
  });
}

function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!button || !nav) return;
  const setOpen = (open) => {
    root.classList.toggle('nav-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  button.addEventListener('click', () => setOpen(!root.classList.contains('nav-open')));
  nav.addEventListener('click', (e) => e.target.closest('a') && setOpen(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
  matchMedia('(min-width: 881px)').addEventListener('change', () => setOpen(false));
}

function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', scrollY > 8);
  update();
  addEventListener('scroll', update, { passive: true });
}

function initReveal() {
  const items = document.querySelectorAll('[data-reveal], .t-item, .product, .receipt, .kanban');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}

function initSpotlight() {
  if (!matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.card').forEach((card) => {
    let frame = 0;
    card.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - r.left}px`);
        card.style.setProperty('--y', `${e.clientY - r.top}px`);
      });
    });
  });
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const format = new Intl.NumberFormat('en-GB');
  const run = (el) => {
    const target = Number(el.dataset.count);
    if (reducedMotion) {
      el.textContent = format.format(target);
      return;
    }
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = format.format(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => io.observe(el));
}

function initTimeline() {
  const timelines = document.querySelectorAll('.timeline');
  if (!timelines.length) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const anchor = innerHeight * 0.7;
    timelines.forEach((tl) => {
      const r = tl.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (anchor - r.top) / r.height));
      tl.style.setProperty('--progress', progress.toFixed(3));
    });
  };
  update();
  addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true });
  addEventListener('resize', update);
}

function initTerminals() {
  document.querySelectorAll('.terminal[data-animate] .line').forEach((line, i) => {
    line.style.setProperty('--i', String(i));
  });
}

function initCopy() {
  document.querySelectorAll('[data-copy-from]').forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const original = button.getAttribute('aria-label');
      const source = document.querySelector(button.dataset.copyFrom);
      try {
        await navigator.clipboard.writeText(source.href.replace(/^mailto:/, ''));
        button.setAttribute('aria-label', 'Copied');
        button.dataset.copied = 'true';
      } catch {
        button.setAttribute('aria-label', 'Copy failed');
      }
      setTimeout(() => {
        button.setAttribute('aria-label', original);
        delete button.dataset.copied;
      }, 1800);
    });
  });
}

// The contact form has no backend: it composes an email in the visitor's own
// mail client, so nothing is sent to a third party.
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const preset = new URLSearchParams(location.search).get('topic');
  if (preset) {
    const radio = form.querySelector(`input[data-topic="${CSS.escape(preset)}"]`);
    if (radio) radio.checked = true;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const company = String(data.get('company') || '').trim();
    const topic = String(data.get('topic') || 'General enquiry');
    const message = String(data.get('message') || '').trim();
    const subject = `${topic} — ${name}${company ? ` (${company})` : ''}`;
    const body = `${message}\n\n— ${name}${company ? `\n${company}` : ''}`;
    const address = ['info', 'edgee.tech'].join('@');
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = 'Your email app should open with the message ready to send.';
  });
}

function initNotFound() {
  const target = document.querySelector('.requested-path');
  if (!target || location.pathname === '/404.html') return;
  try {
    target.textContent = decodeURIComponent(location.pathname).slice(1) || '/';
  } catch {
    target.textContent = location.pathname.slice(1);
  }
}

initTheme();
initNotFound();
initMenu();
initHeader();
initTerminals();
initReveal();
initSpotlight();
initCounters();
initTimeline();
initCopy();
initContactForm();
