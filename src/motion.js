// Native, one-time motion. Content stays visible when scripting or motion is unavailable.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const easeOut = progress => 1 - Math.pow(1 - progress, 3);
const runningAnimations = new Set();

function animate(element, frames, options) {
  if (reducedMotion.matches || !element.animate) return;
  const animation = element.animate(frames, options);
  runningAnimations.add(animation);
  const release = () => runningAnimations.delete(animation);
  animation.addEventListener('finish', release, { once: true });
  animation.addEventListener('cancel', release, { once: true });
}

// Read the declared targets, keeping a separate static value for assistive technology.
const counters = [...document.querySelectorAll('[data-count-to]')].map(element => ({
  element,
  value: element.querySelector('[data-count-value]'),
  target: Number(element.dataset.countTo),
  decimals: Number(element.dataset.countDecimals || 0),
  suffix: element.dataset.countSuffix || '',
  finalText: element.querySelector('[data-count-value]').textContent,
}));
let countFrame = 0;
let countersStarted = false;
let countersFinished = false;
let counterObserver;

function finishCounters() {
  cancelAnimationFrame(countFrame);
  countFrame = 0;
  counters.forEach(counter => { counter.value.textContent = counter.finalText; });
  countersFinished = true;
  document.querySelector('.stats')?.classList.add('count-complete');
  counterObserver?.disconnect();
}

function startCounters() {
  if (countersStarted || countersFinished) return;
  countersStarted = true;
  counterObserver?.disconnect();
  if (reducedMotion.matches) return finishCounters();
  const start = performance.now();
  const duration = 2200;
  const stagger = 100;
  counters.forEach(counter => { counter.value.textContent = (0).toFixed(counter.decimals) + counter.suffix; });
  document.querySelector('.stats')?.classList.add('count-started');
  function tick(now) {
    let allDone = true;
    counters.forEach((counter, index) => {
      const progress = Math.min(1, Math.max(0, (now - start - index * stagger) / duration));
      const units = 10 ** counter.decimals;
      // Floor until the final frame so rounding never displays the target prematurely.
      const value = Math.floor(counter.target * easeOut(progress) * units) / units;
      counter.value.textContent = progress === 1 ? counter.finalText : value.toFixed(counter.decimals) + counter.suffix;
      if (progress < 1) allDone = false;
    });
    if (allDone) finishCounters();
    else countFrame = requestAnimationFrame(tick);
  }
  countFrame = requestAnimationFrame(tick);
}

const stats = document.querySelector('.stats');
if (stats && counters.length) {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) finishCounters();
  else {
    counterObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) startCounters();
    }, { threshold: 0.6, rootMargin: '0px 0px -24px 0px' });
    counterObserver.observe(stats);
  }
}

// Animate individual rows instead of whole sections: no long scroll-locked sequences.
const revealSelector = [
  '.hero-kicker', '.hero-heading', '.hero-aside', '.work-toolbar',
  '.feature-label', '.feature-art', '.feature-caption', '.group-heading',
  '.project-card', '.brand-strip > .eyebrow', '.brand-strip > div',
  '.about-visual', '.about-content > .eyebrow', '.about-content > h2',
  '.about-content > p', '.about-content > .text-link',
  '.career-grid > div:first-child', '.career', '.toolkit > div',
  '.section-heading', '.service-row', '.process > div',
  '.faq-section > div:first-child', '.faq', '.cta-section .availability',
  '.cta-title', '.cta-bottom', '.contact-intro > *', '.contact-form',
].join(',');
let revealObserver;

function revealDelay(element) {
  if (element.matches('.hero-heading')) return 70;
  if (element.matches('.hero-aside')) return 160;
  if (element.matches('.project-card, .service-row, .career, .process > div, .faq')) {
    const index = [...element.parentElement.children].indexOf(element);
    return (index % 4) * 45;
  }
  return 0;
}

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      // An in-progress entrance must never make a focused control invisible.
      if (!element.matches(':focus-within')) {
        animate(element, [
          { opacity: 0, transform: 'translate3d(0, 12px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ], {
          duration: element.matches('.hero-heading, .feature-art') ? 700 : 560,
          delay: revealDelay(element),
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards',
        });
      }
      revealObserver.unobserve(element);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
  document.querySelectorAll(revealSelector).forEach(element => revealObserver.observe(element));
}

document.addEventListener('focusin', event => {
  for (const animation of runningAnimations) {
    if (animation.effect?.target?.contains(event.target)) animation.cancel();
  }
});

// Scroll feedback never changes the framing or scale of the artwork.
const header = document.querySelector('.site-header');
let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  header?.style.setProperty('--page-progress', progress.toFixed(4));
  header?.classList.toggle('is-scrolled', scrollY > 20);
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(scheduleScroll).observe(document.body);
scheduleScroll();

reducedMotion.addEventListener('change', event => {
  if (event.matches) {
    revealObserver?.disconnect();
    for (const animation of runningAnimations) animation.cancel();
    if (counters.length) finishCounters();
  }
  scheduleScroll();
});
