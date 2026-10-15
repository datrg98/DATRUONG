// ==========================================================================
// DAT TRUONG — SCROLL-DRIVEN "VIDEO" PORTFOLIO ENGINE
// Modelled on SAMPLE.mp4 (screen recording of a scrollytelling portfolio).
//
// Every <section data-scene> is a scroll spacer. Its .scene-stage is pinned
// full-screen and all motion inside is scrubbed by the scene progress p (0→1),
// so the mouse wheel plays the page forwards / backwards like a timeline.
//
// Markup API
//   data-a="up|rise|down|left|right|zoom|pop|blur|fade"  animation type
//   data-in="a b"        progress window for the entrance
//   data-out="c d"       progress window for the exit
//   data-out-type="up|lift|zoom|down|fade"
//   data-split           split a heading into words that blur in one by one
//   data-draw="a b"      SVG path (pathLength="1") drawn by progress
//   data-follow="#path" data-range="a b"   star that rides along a path
//   data-count-to / data-count-range       counters scrubbed by progress
// ==========================================================================

import './lenis.min.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const parseRange = (s) => (s ? s.trim().split(/[\s,]+/).map(Number) : null);

// Presets use only transform + opacity so every scrubbed frame stays on the GPU compositor
// (animated CSS blur forces a full re-raster each frame and was the main source of jank).
const IN = {
  up: { y: 70 },
  rise: { y: 80, s: 0.94 },
  down: { y: -56 },
  left: { x: -90 },
  right: { x: 90 },
  zoom: { s: 0.84 },
  pop: { s: 0.45 },
  blur: { s: 1.12 },
  fade: {},
};

const OUT = {
  up: { y: -60 },
  lift: { y: -60, s: 0.97 },
  zoom: { s: 1.14 },
  down: { y: 50 },
  fade: {},
};

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let lenis = null;
let scenes = [];
let mode = null; // 'scenes' | 'flow'
let vw = window.innerWidth;
let vh = window.innerHeight;
let lastY = -1;
let currentScene = null;
let flowObserver = null;

const progressLine = $('#scrollProgressLine');
const orbs = $$('.ambient-orb');

// Desktop scene layout for any landscape screen ≥ 900 × 460. Reduced-motion users keep the
// same layout (the scrub is driven by their own scroll); only Lenis + ambient motion are disabled.
const wantScenes = () =>
  window.innerWidth >= 900 && window.innerHeight >= 460;

const getScroll = () => (lenis ? lenis.scroll : window.scrollY);

// --------------------------------------------------------------------------
// Element animation
// --------------------------------------------------------------------------

function makeAnim(el, type) {
  return {
    el,
    in: parseRange(el.dataset.in),
    out: parseRange(el.dataset.out),
    inT: IN[type] || IN.fade,
    outT: OUT[el.dataset.outType || 'up'] || OUT.up,
    key: '',
  };
}

function applyAnim(a, p) {
  const tin = a.in ? easeOut(span(p, a.in[0], a.in[1])) : 1;
  const tout = a.out ? easeInOut(span(p, a.out[0], a.out[1])) : 0;
  const I = a.inT;
  const O = a.outT;
  const k = 1 - tin;

  const x = (I.x || 0) * k + (O.x || 0) * tout;
  const y = (I.y || 0) * k + (O.y || 0) * tout;
  const s = lerp(I.s ?? 1, 1, tin) * lerp(1, O.s ?? 1, tout);
  const blur = (I.blur || 0) * k + (O.blur || 0) * tout;
  const o = tin * (1 - tout);

  const key = `${o.toFixed(3)}|${x.toFixed(1)}|${y.toFixed(1)}|${s.toFixed(4)}|${blur.toFixed(1)}`;
  if (key === a.key) return;
  a.key = key;

  const st = a.el.style;
  const still = Math.abs(x) < 0.05 && Math.abs(y) < 0.05 && Math.abs(s - 1) < 0.0005;
  st.opacity = o > 0.999 ? '1' : o.toFixed(3);
  st.transform = still ? '' : `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
  st.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : '';
  st.visibility = o < 0.002 ? 'hidden' : '';
}

function splitWords(el) {
  const words = [];
  Array.from(el.childNodes).forEach((child) => {
    if (child.nodeType === 3) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === 1 && child.tagName !== 'BR') {
      child.classList.add('w');
      words.push(child);
    }
  });
  return words;
}

function placeFollow(f, p) {
  if (!f.len) return;
  const t = span(p, f.r[0], f.r[1]);
  const pt = f.path.getPointAtLength(f.len * t);
  const m = f.m || (f.m = f.path.getScreenCTM());
  if (!m) return;
  const x = pt.x * m.a + pt.y * m.c + m.e;
  const y = pt.x * m.b + pt.y * m.d + m.f;
  const tin = span(p, f.r[0] - 0.03, f.r[0] + 0.01);
  const tout = f.out ? easeInOut(span(p, f.out[0], f.out[1])) : 0;
  f.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  f.el.style.opacity = (tin * (1 - tout)).toFixed(3);
}

// --------------------------------------------------------------------------
// Scene-specific choreography
// --------------------------------------------------------------------------

function setStep(sc, i) {
  if (!sc || sc.q.active === i) return;
  sc.q.active = i;
  sc.q.btns.forEach((b, k) => b.classList.toggle('active', k === i));
  sc.q.panels.forEach((pnl, k) => pnl.classList.toggle('active', k === i));
}

const HOOKS = {
  intro: {
    init(sc) {
      sc.q.orbits = $('.intro-orbits', sc.el);
      sc.q.flash = $('.intro-flash', sc.el);
      sc.q.rows = $$('.flash-row', sc.el);
    },
    update(p, sc) {
      const { orbits, flash, rows } = sc.q;
      // Camera flies through the orbit rings (SAMPLE.mp4 00:02–00:06)
      const zin = easeOut(span(p, 0.08, 0.24));
      const fly = easeIn(span(p, 0.22, 0.8));
      const s = 0.4 + 0.6 * zin + 2.6 * fly;
      orbits.style.opacity = (zin * (1 - span(p, 0.6, 0.78))).toFixed(3);
      orbits.style.transform = `translate(-50%, -50%) scale(${s.toFixed(3)}) rotate(${(p * 90).toFixed(2)}deg)`;
      // Light flash frame with outlined rows (SAMPLE.mp4 00:08)
      const f = easeOut(span(p, 0.7, 0.8)) * (1 - easeInOut(span(p, 0.9, 1)));
      flash.style.opacity = f.toFixed(3);
      flash.style.visibility = f < 0.003 ? 'hidden' : 'inherit';
      const drift = span(p, 0.65, 1);
      rows.forEach((r, i) => {
        const dir = i % 2 ? 1 : -1;
        r.style.transform = `translate3d(${(-10 + dir * drift * 12).toFixed(2)}%, 0, 0)`;
      });
    },
    reset(sc) {
      [sc.q.orbits, sc.q.flash, ...sc.q.rows].forEach((el) => el.removeAttribute('style'));
    },
  },

  hero: {
    init(sc) {
      sc.q.visual = $('.hero-visual', sc.el);
    },
    update(p, sc) {
      sc.q.visual.style.translate = `0 ${((p - 0.45) * -60).toFixed(1)}px`;
    },
    reset(sc) {
      sc.q.visual.style.translate = '';
    },
  },

  'ai-film': {
    init(sc) {
      sc.q.reveal = $('.film-reveal', sc.el);
      sc.q.img = $('.film-hero-banner img', sc.el);
    },
    update(p, sc) {
      const t = easeOut(span(p, 0.06, 0.36));
      const ix = (1 - t) * 28;
      const iy = (1 - t) * 20;
      sc.q.reveal.style.clipPath = t > 0.999 ? '' : `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% round 22px)`;
      sc.q.reveal.style.opacity = span(p, 0.02, 0.12).toFixed(3);
      sc.q.img.style.scale = (1.25 - 0.2 * t - 0.05 * span(p, 0.36, 0.9)).toFixed(4);
    },
    reset(sc) {
      sc.q.reveal.style.clipPath = '';
      sc.q.reveal.style.opacity = '';
      sc.q.img.style.scale = '';
    },
  },

  pipeline: {
    init(sc) {
      sc.q.btns = $$('.step-tab-btn', sc.el);
      sc.q.panels = $$('.pipeline-step-panel', sc.el);
      sc.q.active = sc.q.btns.findIndex((b) => b.classList.contains('active'));
    },
    update(p, sc) {
      const i = Math.max(0, Math.min(3, Math.floor((p - 0.1) / 0.2)));
      setStep(sc, i);
      const lt = span(p, 0.1 + i * 0.2, 0.28 + i * 0.2);
      const panel = sc.q.panels[i];
      const fill = panel && $('.pp-bar i', panel);
      const val = panel && $('.pp-val', panel);
      if (fill) fill.style.transform = `scaleX(${lt.toFixed(3)})`;
      if (val) val.textContent = `${Math.round(lt * 100)}%`;
    },
    reset(sc) {
      sc.q.panels.forEach((pnl) => {
        const fill = $('.pp-bar i', pnl);
        const val = $('.pp-val', pnl);
        if (fill) fill.style.transform = 'scaleX(1)';
        if (val) val.textContent = '100%';
      });
    },
  },

  clients: {
    init(sc) {
      sc.q.shifts = $$('.marquee-shift', sc.el);
    },
    update(p, sc) {
      sc.q.shifts.forEach((s, i) => {
        s.style.transform = `translate3d(${((i ? 1 : -1) * (p - 0.5) * 260).toFixed(1)}px, 0, 0)`;
      });
    },
    reset(sc) {
      sc.q.shifts.forEach((s) => (s.style.transform = ''));
    },
  },

  contact: {
    init(sc) {
      sc.q.star = $('.outro-star', sc.el);
      sc.q.pill = $('.outro-headline .t-pill', sc.el);
    },
    update(p, sc) {
      const { star, pill } = sc.q;
      if (!star || !pill) return;
      // Star drifts in and lands on the corner of the pill (SAMPLE.mp4 00:40–00:42)
      if (!sc.q.rect || p < 0.4) sc.q.rect = pill.getBoundingClientRect();
      const r = sc.q.rect;
      const tx = r.left + 6;
      const ty = r.top + 4;
      const ax = vw * 0.86;
      const ay = vh * 0.2;
      const cx = (ax + tx) / 2;
      const cy = Math.max(ay, ty) + vh * 0.2;
      const t = easeInOut(span(p, 0.08, 0.36));
      const u = 1 - t;
      const x = u * u * ax + 2 * u * t * cx + t * t * tx;
      const y = u * u * ay + 2 * u * t * cy + t * t * ty;
      star.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      star.style.opacity = span(p, 0.04, 0.1).toFixed(3);
    },
    reset(sc) {
      if (sc.q.star) sc.q.star.removeAttribute('style');
    },
  },
};

// --------------------------------------------------------------------------
// Build, layout, render
// --------------------------------------------------------------------------

function buildScenes() {
  scenes = $$('[data-scene]').map((el, index) => {
    const sc = {
      el,
      index,
      id: el.id,
      stage: $('.scene-stage', el),
      length: parseFloat(el.dataset.length || '2'),
      rest: parseFloat(el.dataset.rest || '0.5'),
      overlap: parseFloat(el.dataset.overlap ?? '0.3'),
      label: el.dataset.label || el.id,
      anims: [],
      words: [],
      draws: [],
      follows: [],
      counters: [],
      tracks: [],
      top: 0,
      range: 1,
      last: null,
      visible: false,
      hook: HOOKS[el.id] || null,
      q: {},
    };

    $$('[data-a]', el).forEach((node) => sc.anims.push(makeAnim(node, node.dataset.a)));

    $$('[data-split]', el).forEach((node) => {
      const words = splitWords(node);
      const r = parseRange(node.dataset.in) || [0, 0.15];
      const total = r[1] - r[0];
      const w = Math.min(total, Math.max(total * 0.5, 0.06));
      const n = words.length;
      words.forEach((wEl, i) => {
        const start = r[0] + (n > 1 ? ((total - w) * i) / (n - 1) : 0);
        sc.words.push({ el: wEl, in: [start, start + w], out: null, inT: { y: 34 }, outT: {}, key: '' });
      });
      if (node.dataset.out) {
        sc.anims.push({ el: node, in: null, out: parseRange(node.dataset.out), inT: {}, outT: OUT[node.dataset.outType || 'up'], key: '' });
      }
    });

    $$('[data-draw]', el).forEach((node) => sc.draws.push({ el: node, r: parseRange(node.dataset.draw), key: '' }));

    $$('[data-follow]', el).forEach((node) => {
      const path = $(node.dataset.follow);
      if (path) sc.follows.push({ el: node, path, r: parseRange(node.dataset.range) || [0, 1], out: parseRange(node.dataset.out), len: 0 });
    });

    $$('[data-count-to]', el).forEach((node) => {
      const valEl = $('[data-count-value]', node) || node;
      sc.counters.push({
        el: node,
        valEl,
        to: parseFloat(node.dataset.countTo),
        dec: parseInt(node.dataset.countDecimals || '0', 10),
        suffix: node.dataset.countSuffix || '',
        r: parseRange(node.dataset.countRange) || [0.1, 0.4],
        final: valEl.textContent,
        key: '',
      });
    });

    $$('.h-track', el).forEach((track) => {
      sc.tracks.push({
        track,
        view: track.parentElement,
        cols: $$(':scope > .h-col', track).map((c) => ({ el: c, x: 0, w: 0, key: '' })),
        bar: $('.tool-progress-bar i', el),
        r: parseRange(track.dataset.range) || [0.1, 0.9],
        max: 0,
        viewW: 0,
      });
    });

    sc.hook?.init?.(sc);
    return sc;
  });
}

// --------------------------------------------------------------------------
// Horizontal tracks: vertical scroll drives a sideways reel (toolkit, films, reels)
// --------------------------------------------------------------------------

function layoutTracks(sc) {
  sc.tracks.forEach((tr) => {
    tr.cols.forEach((c) => {
      c.x = c.el.offsetLeft;
      c.w = c.el.offsetWidth;
      c.key = '';
    });
    tr.viewW = tr.view.clientWidth || vw;
    const last = tr.cols[tr.cols.length - 1];
    const padR = parseFloat(getComputedStyle(tr.track).paddingRight) || 0;
    tr.max = last ? Math.max(0, last.x + last.w + padR - tr.viewW) : 0;
  });
}

function renderTracks(sc, p) {
  sc.tracks.forEach((tr) => {
    const t = easeInOut(span(p, tr.r[0], tr.r[1]));
    const shift = -tr.max * t;
    tr.track.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0)`;
    if (tr.bar) tr.bar.style.transform = `scaleX(${t.toFixed(4)})`;
    tr.cols.forEach((c, i) => {
      const left = c.x + shift;
      const enter = easeOut(clamp01((tr.viewW - left) / (tr.viewW * 0.3)));
      const intro = easeOut(span(p, i * 0.012, 0.07 + i * 0.012));
      const k = Math.min(enter, intro);
      const key = k.toFixed(3);
      if (key === c.key) return;
      c.key = key;
      c.el.style.opacity = k > 0.999 ? '' : key;
      c.el.style.transform = k > 0.999 ? '' : `translate3d(0, ${((1 - k) * 70).toFixed(1)}px, 0) rotate(${((1 - k) * 4).toFixed(2)}deg)`;
    });
  });
}

function resetTracks(sc) {
  sc.tracks.forEach((tr) => {
    tr.track.style.transform = '';
    if (tr.bar) tr.bar.style.transform = '';
    tr.cols.forEach((c) => {
      c.key = '';
      c.el.style.opacity = '';
      c.el.style.transform = '';
    });
  });
}

function layout() {
  vw = window.innerWidth;
  vh = window.innerHeight;
  if (mode !== 'scenes') return;

  scenes.forEach((sc, i) => {
    sc.range = sc.length * vh;
    const h = i === scenes.length - 1 ? sc.range + vh : sc.range;
    sc.el.style.height = `${Math.round(h)}px`;
    sc.el.style.marginTop = i === 0 ? '0px' : `${Math.round(-sc.overlap * vh)}px`;
  });

  const y = window.scrollY;
  scenes.forEach((sc) => {
    sc.top = sc.el.getBoundingClientRect().top + y;
    sc.last = null;
    sc.follows.forEach((f) => {
      f.len = f.path.getTotalLength();
      f.m = null;
    });
    layoutTracks(sc);
    sc.hook?.layout?.(sc);
  });

  lenis?.resize();
  update(true);
}

function render(sc, p) {
  sc.last = p;
  for (const a of sc.anims) applyAnim(a, p);
  for (const w of sc.words) applyAnim(w, p);
  for (const d of sc.draws) {
    const v = (1 - span(p, d.r[0], d.r[1])).toFixed(4);
    if (v !== d.key) {
      d.key = v;
      d.el.style.strokeDashoffset = v;
    }
  }
  for (const c of sc.counters) {
    const v = (c.to * easeOut(span(p, c.r[0], c.r[1]))).toFixed(c.dec) + c.suffix;
    if (v !== c.key) {
      c.key = v;
      c.valEl.textContent = v;
    }
  }
  for (const f of sc.follows) placeFollow(f, p);
  renderTracks(sc, p);
  sc.hook?.update?.(p, sc);
}

function setCurrent(sc) {
  if (sc === currentScene) return;
  currentScene?.el.classList.remove('is-current');
  currentScene = sc;
  sc?.el.classList.add('is-current');
  const id = sc?.id;
  $$('.nav-link').forEach((a) => {
    const also = (a.dataset.also || '').split(/\s+/);
    a.classList.toggle('is-active', a.getAttribute('href') === `#${id}` || also.includes(id));
  });
  $$('.rail-item').forEach((b) => b.classList.toggle('is-active', b.dataset.target === id));
}

function ambient(g) {
  if (orbs[0]) orbs[0].style.translate = `${(-g * 12).toFixed(2)}vw ${(g * 26).toFixed(2)}vh`;
  if (orbs[1]) orbs[1].style.translate = `${(-g * 8).toFixed(2)}vw ${(-g * 30).toFixed(2)}vh`;
  if (orbs[2]) orbs[2].style.translate = `${(g * 14).toFixed(2)}vw ${(-g * 12).toFixed(2)}vh`;
}

function update(force = false) {
  const y = getScroll();
  if (!force && y === lastY) return;
  lastY = y;

  const max = Math.max(1, root.scrollHeight - vh);
  const g = clamp01(y / max);
  if (progressLine) progressLine.style.transform = `scaleX(${g.toFixed(4)})`;
  ambient(g);

  if (mode !== 'scenes') return;

  let current = null;
  scenes.forEach((sc, i) => {
    const raw = (y - sc.top) / sc.range;
    const isLast = i === scenes.length - 1;
    const visible = raw >= 0 && (raw < 1 || isLast);
    if (visible !== sc.visible) {
      sc.visible = visible;
      sc.el.classList.toggle('is-visible', visible);
    }
    if (!visible) {
      const endP = raw >= 1 ? 1 : 0;
      if (sc.last !== null && sc.last !== endP) render(sc, endP);
      return;
    }
    current = sc;
    const p = clamp01(raw);
    if (force || p !== sc.last) render(sc, p);
  });
  setCurrent(current);
}

// --------------------------------------------------------------------------
// Modes: pinned scenes (desktop) vs. normal flow (mobile / reduced motion)
// --------------------------------------------------------------------------

function clearInline() {
  scenes.forEach((sc) => {
    sc.el.style.height = '';
    sc.el.style.marginTop = '';
    sc.el.classList.remove('is-visible', 'is-current');
    sc.visible = false;
    sc.last = null;
    [...sc.anims, ...sc.words].forEach((a) => {
      a.key = '';
      a.el.style.opacity = '';
      a.el.style.transform = '';
      a.el.style.filter = '';
      a.el.style.visibility = '';
    });
    sc.draws.forEach((d) => {
      d.key = '';
      d.el.style.strokeDashoffset = '';
    });
    sc.follows.forEach((f) => (f.el.style.opacity = '0'));
    sc.counters.forEach((c) => {
      c.key = '';
      c.valEl.textContent = c.final;
    });
    resetTracks(sc);
    sc.hook?.reset?.(sc);
  });
  currentScene = null;
}

function setupFlowReveal() {
  if (flowObserver) return;
  flowObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in-view')),
    { threshold: 0.06 }
  );
  scenes.forEach((sc) => flowObserver.observe(sc.el));
}

function setMode(next) {
  if (next === mode) return;
  mode = next;
  root.classList.toggle('scenes-on', mode === 'scenes');
  root.classList.toggle('no-scenes', mode !== 'scenes');
  if (mode === 'scenes') {
    layout();
  } else {
    clearInline();
    setupFlowReveal();
    lenis?.resize();
  }
}

// --------------------------------------------------------------------------
// Navigation
// --------------------------------------------------------------------------

function scrollToY(target, duration) {
  if (lenis) lenis.scrollTo(target, { duration, easing: easeInOut });
  else window.scrollTo({ top: target, behavior: 'smooth' });
}

function goTo(id, at) {
  const sc = scenes.find((s) => s.id === id);
  if (!sc) return;
  if (mode === 'scenes') {
    const target = sc.top + sc.range * (at ?? sc.rest);
    const dist = Math.abs(target - getScroll());
    scrollToY(target, Math.min(2.6, 0.9 + (dist / vh) * 0.12));
  } else {
    const top = sc.el.getBoundingClientRect().top + window.scrollY - 70;
    scrollToY(Math.max(0, top), 1.2);
  }
}

function buildRail() {
  const rail = document.createElement('nav');
  rail.className = 'scene-rail';
  rail.setAttribute('aria-label', 'Chapters');
  scenes.forEach((sc) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-item';
    b.dataset.target = sc.id;
    b.innerHTML = `<span class="rail-label">${sc.label}</span><span class="rail-dot"></span>`;
    b.addEventListener('click', () => goTo(sc.id));
    rail.appendChild(b);
  });
  document.body.appendChild(rail);
}

function bindAnchors() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id || id === 'top') {
        e.preventDefault();
        scrollToY(0, 1.8);
        return;
      }
      if (scenes.some((s) => s.id === id)) {
        e.preventDefault();
        goTo(id);
        return;
      }
      const target = document.getElementById(id);
      const owner = target?.closest('[data-scene]');
      if (owner) {
        e.preventDefault();
        goTo(owner.id);
      }
    });
  });
}

function bindPipelineClicks() {
  const sc = scenes.find((s) => s.id === 'pipeline');
  if (!sc) return;
  sc.q.btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (mode === 'scenes') goTo('pipeline', 0.19 + i * 0.2);
      else setStep(sc, i);
    });
  });
}

// --------------------------------------------------------------------------
// Video modal
// --------------------------------------------------------------------------

function bindVideoModal() {
  const dialog = $('#film-player');
  const title = $('#player-title');
  const video = $('#player-video');
  const direct = $('#player-direct');
  const closeBtn = $('.close-player-btn');
  if (!dialog || !video) return;

  const close = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (dialog.open) dialog.close();
    lenis?.start();
  };

  $$('[data-video]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const file = trigger.dataset.video;
      const src = file.startsWith('/') ? file : `/videos/${encodeURIComponent(file)}`;
      title.textContent = trigger.dataset.title || 'Video Preview';
      video.src = src;
      if (direct) direct.href = src;
      lenis?.stop();
      dialog.showModal();
      video.play().catch(() => {});
    });
  });

  closeBtn?.addEventListener('click', close);
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) close();
  });
  dialog.addEventListener('close', () => {
    video.pause();
    lenis?.start();
  });
}

// --------------------------------------------------------------------------
// Cursor light
// --------------------------------------------------------------------------

function bindSpotlight() {
  if (!window.matchMedia('(pointer: fine)').matches || reduceMotion.matches) return;
  const light = document.createElement('div');
  light.className = 'tech-cursor-spotlight';
  document.body.appendChild(light);
  let mx = vw / 2;
  let my = vh / 2;
  let cx = mx;
  let cy = my;
  let running = false;
  const tick = () => {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    light.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.5) requestAnimationFrame(tick);
    else running = false;
  };
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });
  light.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
}

// --------------------------------------------------------------------------
// Boot
// --------------------------------------------------------------------------

function boot() {
  buildScenes();
  buildRail();
  bindAnchors();
  bindPipelineClicks();
  bindVideoModal();
  bindSpotlight();

  const Lenis = globalThis.Lenis;
  if (Lenis && !reduceMotion.matches) {
    // Lerp-based inertia: the wheel glides the timeline instead of stepping it
    lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    lenis.on('scroll', () => update());
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', () => update(), { passive: true });
  }

  setMode(wantScenes() ? 'scenes' : 'flow');
  update(true);

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const next = wantScenes() ? 'scenes' : 'flow';
      if (next !== mode) setMode(next);
      else layout();
      update(true);
    }, 120);
  });
  reduceMotion.addEventListener?.('change', () => setMode(wantScenes() ? 'scenes' : 'flow'));

  window.addEventListener('load', () => layout());
  document.fonts?.ready.then(() => layout());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
