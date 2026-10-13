# DATRUONG — Portfolio

**Dat Truong · Senior Video Editor & Generative AI Media Specialist**

A cinematic, scroll-driven portfolio in a dark-blue tech style. Every section is a full-screen *scene* whose animation is scrubbed by the scroll wheel, so the page plays forwards and backwards like a video timeline.

Available in **English** (`/`) and **Vietnamese** (`/index-vi.html`).

---

## Highlights

| Scene | What happens on scroll |
| --- | --- |
| **Intro** | Greeting with a landing meteor, camera fly-through of orbit rings, keyword flashes and a light "Storytelling" frame |
| **Hero** | Portrait, drawn ribbons and telemetry chips assemble in sequence |
| **Milestones** | A glowing star rides a scroll-drawn S-curve; metric cards light up and counters scrub |
| **Journey** | Career timeline drawn past → present, each role pops in as the line reaches it |
| **Toolkit** | 19 creative apps & generative AI engines on a horizontal reel |
| **AI Film** | 21:9 frame opens with a clip reveal — *Những điều ta quên* (Higgsfield Film Contest) |
| **Brand Films** | 5 commercial 16:9 films on a horizontal reel |
| **Social & Reels** | 16 vertical 9:16 campaigns on a horizontal reel |
| **Pipeline** | Scroll walks through the 4-step generative production workflow |
| **Clients / Contact** | Dual brand marquee and a closing call to action |

Every video opens in a modal player. On phones, small screens or with *reduce motion* enabled, the site falls back to a normal scrolling layout with soft reveals.

## Tech stack

- **Vite** — dev server and production build (multi-page: `index.html`, `index-vi.html`)
- **Vanilla JS** scene engine — no framework, ~25 KB
- **[Lenis](https://github.com/darkroomengineering/lenis)** — inertia smooth scrolling (vendored, MIT)
- **CSS** — glassmorphism, SVG path drawing, fluid `clamp()` typography

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # serve the production build
```

Requires Node.js 18+.

## Project structure

```
├── index.html            # English page
├── index-vi.html         # Vietnamese page
├── src/
│   ├── main.js           # scroll-scrub scene engine, video modal, navigation
│   ├── scenes.css        # pinned scenes, layouts, mobile fallback
│   ├── style.css         # design tokens and shared components
│   └── lenis.min.js      # smooth-scroll library (MIT)
└── public/
    ├── videos/           # showreel media (MP4)
    ├── posters/          # video poster frames
    ├── logos/            # client brand logos
    ├── tools/            # app & AI model icons
    └── fonts/            # Manrope (OFL)
```

## Authoring scenes

Each section is declared in HTML — no JavaScript changes needed to retime animations.

```html
<section class="scene" id="example" data-scene data-length="2" data-rest="0.5" data-label="Example">
  <div class="scene-stage">
    <h2 data-split data-in="0.02 0.15" data-out="0.86 0.98">Words reveal one by one</h2>
    <div data-a="rise" data-in="0.1 0.25" data-out="0.86 0.97">Card</div>
  </div>
</section>
```

| Attribute | Purpose |
| --- | --- |
| `data-length` | Scroll distance of the scene, in viewport heights |
| `data-rest` | Progress (0–1) where navigation links land |
| `data-a` | Entrance type: `up`, `rise`, `down`, `left`, `right`, `zoom`, `pop`, `blur`, `fade` |
| `data-in` / `data-out` | Progress windows for entrance and exit |
| `data-out-type` | Exit type: `up`, `lift`, `zoom`, `down`, `fade` |
| `data-split` | Split a heading into words that blur in sequentially |
| `data-draw` | Draw an SVG path (`pathLength="1"`) by progress |
| `data-follow` + `data-range` | Move an element along an SVG path |
| `data-count-to` + `data-count-range` | Counter scrubbed by progress |
| `.h-track` > `.h-col` | Horizontal reel driven by vertical scroll (`data-range`) |

## Deployment

The build output in `dist/` is fully static and works on any static host (Vercel, Netlify, Cloudflare Pages). Asset paths are root-relative, so deploy at a domain root.

## Contact

- Email — [dattvq98@gmail.com](mailto:dattvq98@gmail.com)
- Phone / Zalo — 0708 814 771

---

© 2026 Dat Truong. All rights reserved. Videos, posters and client logos are shown for portfolio purposes and remain the property of their respective owners.
