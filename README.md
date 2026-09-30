# Dat Truong portfolio

A bilingual static portfolio built with Vite. English and Vietnamese portfolio and contact pages are included.

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` regenerates the four HTML pages and builds the site into `dist/`. The public media directory is copied into the production build.

## Editing

- `src/content.js`: project library, career history, services and FAQ copy in both languages.
- `scripts/render-pages.mjs`: shared page layouts and remaining bilingual copy. Run `npm run render` after editing content or templates.
- `src/style.css`: responsive design.
- `src/main.js`: filters, mobile navigation, video dialog and email-draft form.
- `src/motion.js`: viewport-triggered count-ups, restrained entrances and scroll progress. Artwork stays fixed in its original frame. Motion respects the visitor's reduced-motion preference; counters run once per page visit.
- `src/media.json`: verified media dimensions and runtimes.
- `public/posters/`: lightweight WebP posters.
- `public/fonts/`: the locally bundled Manrope variable font and its SIL Open Font License. The typeface comes from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/manrope); pages make no external font requests.
- `public/videos/`: the original project videos plus the added film.

Do not edit the generated HTML files directly; rendering will replace those changes.

The design uses one variable sans-serif family for English and Vietnamese, a shared spacing scale, and responsive grids. At phone widths, brand films become full-width cards and project filters form a two-column control group. The featured poster always retains its complete 21:9 frame.

The optional `scripts/prepare-media.py` utility regenerates posters and metadata using Pillow and the FFmpeg installation at the paths declared in that script. These tools are not needed for normal development or production builds.

## Contact and hosting

The form prepares a `mailto:` draft and provides a copy-brief fallback. It does not send mail through a backend. Direct email and telephone links are also provided.

Serve `dist/` from a static host that supports the included video sizes and HTTP byte-range requests. The new film is about 354 MB; playback uses the existing quality with no re-encoding. Set a public absolute Open Graph image URL in the page template when the final hosting domain is known.

See `PORTFOLIO-REVIEW.md` for the analysis, implemented changes and verification summary.
