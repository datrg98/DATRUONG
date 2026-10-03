"""Prepare the supplied client logos for the dark logo wall, in their brand colours.

Sources stay untouched. Each logo becomes a trimmed WebP on transparency. Brand colours are
kept; black and grey artwork becomes white so it reads on the dark wall, and very dark
colours are lifted just enough to stay visible. SVGs are rasterised with headless Chrome and AVIF is decoded
with FFmpeg, both at the paths declared below.
"""
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parents[1]
SRC = Path('C:/DATRG/CV source/LOGO')
OUT = ROOT / 'public/logos'
CHROME = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
FFMPEG = Path('C:/Program Files/Topaz Labs LLC/Topaz Video AI/ffmpeg.exe')
MAX_W, MAX_H = 360, 150
MIN_LIGHTNESS = .56  # OKLab L; keeps dark brand colours legible on the #04060c wall

# Display order, interleaving categories so visual weight spreads across the wall.
# Options: lo/hi tune the ink curve; mode='dark' keeps only dark artwork (for a dark mark on a coloured field);
# mode='tile' keeps the artwork with its coloured field; mode='frame' redraws Betadine's clipped frame;
# bg fixes the background colour when artwork touches the border; inset trims stray edge lines (px);
# keep_inner keeps white lettering enclosed by a badge; tint='bg' recolours white-on-tile artwork in the tile colour;
# ribbon rebuilds Belcube's white band from its gold edges; solid_shape makes white enclosed by the artwork opaque; shield keeps a rimmed white shield opaque; fill_shapes fills large outlined shapes; raw keeps original colours;
# denoise cleans a small, compressed JPEG before separation; scale enlarges a mark on the wall.
BRANDS = [
    ('adidas', 'adidas', 'Adidas_Logo.svg.webp', {}),
    ('nivea', 'NIVEA', 'Nivea_logo.svg.webp', {}),
    ('pg', 'P&G', 'P&G_logo.png', {}),
    ('unilever', 'Unilever', 'Unilever.png', {}),
    ('lg', 'LG', 'LG_logo_(2014).svg.webp', {'lo': .04, 'hi': .3}),
    ('puma', 'PUMA', 'Puma_complete_logo.svg.webp', {}),
    ('converse', 'Converse', 'Converse_logo.svg', {}),
    ('gillette', 'Gillette', 'Gillette.png', {}),
    ('olay', 'Olay', 'Olay.png', {}),
    ('oral-b', 'Oral-B', 'Oral-B_Logo_2024.svg', {}),
    ('logitech', 'Logitech', 'Logitech_logo.svg', {}),
    ('kenvue', 'Kenvue', 'kenvue.png', {}),
    ('rohto', 'Rohto', 'Rohto_2024.svg', {}),
    ('obagi', 'Obagi Medical', 'Obagi.png', {}),
    ('cerave', 'CeraVe', 'images (1).png', {'mode': 'tile', 'scale': 1.15}),
    ('the-body-shop', 'The Body Shop', 'the body shop.jpg', {}),
    ('innisfree', 'innisfree', 'Innisfree_logo.png', {'tint': 'bg'}),
    ('dermalogica', 'Dermalogica', 'Dermalogica-Logo.png', {}),
    ('sensodyne', 'Sensodyne', 'Sensodyne.jpg', {}),
    ('vaseline', 'Vaseline', 'Vaseline_new_logo.png', {}),
    ('swisse', 'Swisse', 'swisse.png', {'mode': 'tile', 'scale': 1.25}),
    ('blackmores', 'Blackmores', 'Logo-blackmores.svg.webp', {}),
    ('aptamil', 'Aptamil', 'Aptamil.jpg', {'shield': True, 'scale': 1.35}),
    ('suntory-pepsico', 'Suntory PepsiCo', 'images (2).png', {}),
    ('unicharm', 'Unicharm', 'images.png', {'solid_shape': {'lo': .25, 'close': 1, 'min_area': .02}}),
    ('venus', 'Gillette Venus', 'Venus-logo-2014.jpg', {}),
    ('st-ives', 'St. Ives', 'st.ives.png', {'inset': 3, 'lo': .16}),
    ('betadine', 'Betadine', 'betadine-nz-logo-scaled.webp', {'mode': 'frame', 'scale': 1.15}),
    ('yaman', 'YA-MAN', 'yaman.jpg', {}),
    ('coolmate', 'Coolmate', 'COOLMATE_FULL_LOGO_-_BLACK_(1).avif', {}),
    ('romano', 'Romano', 'images (1).jpg', {}),
    ('wipro', 'Wipro', 'Wipro.png', {}),
    ('vitadairy', 'VitaDairy', 'vita dairy.jpg', {}),
    ('belcube', 'Belcube', 'The Laughing Cow 2024.png', {'raw': True, 'scale': 1.35}),
    ('colosbaby', 'ColosBaby', 'Colosbaby.png', {}),
    ('fatzbaby', 'Fatzbaby', 'Fatzbaby.jpg', {'keep_inner': True}),
    ('ajmal', 'Ajmal', 'AJMAL.png', {'solid_shape': {'lo': .25, 'close': 3}, 'raw': True}),
    ('noreva', 'Noreva', 'noreva.png', {}),
    ('acne-aid', 'Acne-Aid', 'Acne aid.png', {}),
    ('aqua', 'AQUA', 'Logo-AQUA.png', {}),
]


def load(path: Path, tmp: Path) -> Image.Image:
    """Open any supplied format as RGBA."""
    if path.suffix == '.avif':
        png = tmp / (path.stem + '.png')
        subprocess.run([str(FFMPEG), '-v', 'error', '-y', '-i', str(path), str(png)], check=True)
        return Image.open(png).convert('RGBA')
    if path.suffix == '.svg':
        # Render through Chrome on a transparent page at 1600 px wide.
        html, png = tmp / (path.stem + '.html'), tmp / (path.stem + '.png')
        html.write_text(f'<html><body style="margin:0;background:transparent"><img src="{path.as_uri()}" style="width:1600px;display:block"></body></html>', encoding='utf8')
        svg = path.read_text(encoding='utf8')
        vb = re.search(r'viewBox="([\d.\s-]+)"', svg)
        w, h = (map(float, vb.group(1).split()[2:]) if vb else
                (float(re.search(r'<svg[^>]*?\swidth="([\d.]+)', svg, re.S).group(1)), float(re.search(r'<svg[^>]*?\sheight="([\d.]+)', svg, re.S).group(1))))
        subprocess.run([str(CHROME), '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
                        '--default-background-color=00000000', f'--window-size=1600,{round(1600 * h / w)}',
                        f'--screenshot={png}', html.as_uri()], check=True, capture_output=True)
        return Image.open(png).convert('RGBA')
    return Image.open(path).convert('RGBA')


def srgb_to_linear(c: np.ndarray) -> np.ndarray:
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)


def linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0, 1)
    return np.where(c <= .0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - .055)


M1 = np.array([[.4122214708, .5363325363, .0514459929], [.2119034982, .6806995451, .1073969566], [.0883024619, .2817188376, .6299787005]])
M2 = np.array([[.2104542553, .7936177850, -.0040720468], [1.9779984951, -2.4285922050, .4505937099], [.0259040371, .7827717662, -.8086757660]])


def to_oklab(rgb: np.ndarray) -> np.ndarray:
    return np.cbrt(srgb_to_linear(rgb) @ M1.T) @ M2.T


def from_oklab(lab: np.ndarray) -> np.ndarray:
    return linear_to_srgb((lab @ np.linalg.inv(M2).T) ** 3 @ np.linalg.inv(M1).T)


def for_dark_wall(rgb: np.ndarray, keep: np.ndarray | None = None) -> np.ndarray:
    """Black and grey artwork turns white; brand colours keep their hue, with only very dark
    tones (navy, maroon) lifted to a lightness that stays visible on the near-black wall."""
    lab = to_oklab(rgb)
    chroma = np.hypot(lab[..., 1], lab[..., 2])
    neutral = chroma < .045
    lab[..., 0] = np.maximum(lab[..., 0], MIN_LIGHTNESS)
    out = from_oklab(lab)
    out[neutral] = 1
    if keep is not None:
        out[keep & neutral] = rgb[keep & neutral]  # e.g. a white badge with a silver rim stays as drawn
    return out


def rebuild_frame(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Betadine: a square-left, round-right frame whose top and right edges are clipped by the
    image. Measure it, then redraw it smooth and complete at 2× with the original colours."""
    ink_mask = rgb @ np.array([.299, .587, .114]) < .6
    h, w = ink_mask.shape
    x0 = int(np.nonzero(ink_mask.any(0))[0].min())
    run = np.nonzero(ink_mask[h // 2])[0]
    t = int(run[np.argmax(np.diff(run) > 1)] - x0 + 1)  # line thickness, from the left side
    bottom = np.array([np.nonzero(c)[0].max() if c.any() else -1 for c in ink_mask.T])
    radius = h / 2
    cx = float(np.nonzero(bottom[w // 2:] < bottom[x0 + 4 * t] - 2)[0][0] + w // 2)  # where the round end begins
    S = 2
    W, H = int((cx + radius - x0 + 4) * S), h * S
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / S
    xx += x0
    cy = (h - 1) / 2

    def inside(inset: float) -> np.ndarray:
        # Signed distance to the shape (positive inside), so edges anti-alias smoothly.
        straight = np.minimum.reduce([xx - (x0 + inset), yy - inset, (h - 1 - inset) - yy])
        round_end = (radius - inset) - np.hypot(xx - cx, yy - cy)
        d = np.where(xx < cx, straight, np.minimum(round_end, xx - (x0 + inset)))
        return np.clip(d * S + .5, 0, 1)

    outer, inner = inside(0), inside(t)
    sx = np.clip(xx.round().astype(int), 0, w - 1)
    sy = np.clip(yy.round().astype(int), 0, h - 1)
    original = rgb[sy, sx]
    original[(xx >= w)] = 1  # area beyond the clipped edge is the white interior
    # Frame colour runs left→right along the bottom line; the round end keeps its last tone.
    line_colour = rgb[h - 1 - t // 2, np.clip(np.arange(w), x0 + t, int(cx) - 1)]
    frame = line_colour[np.clip(xx.astype(int), 0, w - 1)]
    colour = original * inner[..., None] + frame * (1 - inner[..., None])
    return colour, outer


def extract(im: Image.Image, opts: dict) -> tuple[np.ndarray, np.ndarray]:
    """Return (colour, alpha): the artwork separated from its background."""
    rgba = np.asarray(im).astype(np.float32) / 255
    if n := opts.get('inset'):
        rgba = rgba[n:-n, n:-n]
    rgb, alpha = rgba[..., :3], rgba[..., 3]
    border_alpha = np.concatenate([alpha[0], alpha[-1], alpha[:, 0], alpha[:, -1]])
    if opts.get('mode') == 'frame':
        return rebuild_frame(rgb)
    if opts.get('mode') == 'tile':
        # The brand lockup includes its field (Swisse's red, CeraVe's white rectangle); keep it whole.
        if opts.get('denoise'):
            h, w = rgb.shape[:2]
            clean = Image.fromarray((rgb * 255).round().astype(np.uint8)).resize((w * 2, h * 2), Image.Resampling.LANCZOS)
            rgb = np.asarray(clean.filter(ImageFilter.MedianFilter(3))).astype(np.float32) / 255
        if pad := opts.get('pad'):
            # A logo floating on a large white canvas: crop to the artwork plus an even margin.
            ys, xs = np.nonzero(np.abs(rgb - 1).max(axis=2) > .12)
            m = round(pad * max(ys.ptp(), xs.ptp()))
            rgb = np.pad(rgb, ((m, m), (m, m), (0, 0)), constant_values=1)  # artwork may touch the canvas edge
            rgb = rgb[ys.min():ys.max() + 2 * m + 1, xs.min():xs.max() + 2 * m + 1]
        return rgb, np.ones(rgb.shape[:2], np.float32)
    if opts.get('mode') == 'dark':
        # A dark mark on a coloured tile (Swisse): keep the mark only, as white.
        luma = rgb @ np.array([.299, .587, .114], np.float32)
        return np.ones_like(rgb), np.clip((.32 - luma) / (.32 - .16), 0, 1)
    if np.median(border_alpha) < .5:
        # Already on transparency (SVG, transparent PNG/WebP): the artwork is used as drawn.
        return (rgb if opts.get('raw') else for_dark_wall(rgb)), alpha
    if opts.get('denoise'):
        # Small, heavily compressed JPEG: upscale, then a median filter removes block noise first.
        h, w = rgb.shape[:2]
        clean = Image.fromarray((rgb * 255).round().astype(np.uint8)).resize((w * 2, h * 2), Image.Resampling.LANCZOS)
        rgb = np.asarray(clean.filter(ImageFilter.MedianFilter(5))).astype(np.float32) / 255
    # Opaque background: its colour is the median of the outer border.
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.array(opts['bg'], np.float32) if 'bg' in opts else np.median(border, axis=0)
    dist = np.abs(rgb - bg).max(axis=2)  # Chebyshev distance keeps saturated yellows/reds solid
    lo, hi = opts.get('lo', .06), opts.get('hi', .42)
    a = np.clip((dist - lo) / (hi - lo), 0, 1)
    if opts.get('keep_inner'):
        # Only background connected to the edge is removed, so white lettering inside a badge stays.
        # Letter counters are enclosed too, but by dark strokes; a badge is a lighter brand colour.
        regions, count = ndimage.label(dist < hi)
        edge = set(np.concatenate([regions[0], regions[-1], regions[:, 0], regions[:, -1]]).tolist())
        lightness = to_oklab(rgb)[..., 0]
        for label, box in enumerate(ndimage.find_objects(regions), start=1):
            if label in edge:
                continue
            pad = np.s_[max(box[0].start - 3, 0):box[0].stop + 3, max(box[1].start - 3, 0):box[1].stop + 3]
            region = regions[pad] == label
            ring = ndimage.binary_dilation(region, iterations=3) & ~region & (dist[pad] >= hi)
            if ring.any() and lightness[pad][ring].mean() > .45:
                a[pad][region] = 1
    inside = None
    if opts.get('fill_shapes'):
        # Illustrated badge (Belcube): large outlined shapes are filled solid, so the white of the
        # face and earrings stays; letters are small, so their counters still open to the wall.
        solid = ndimage.binary_closing(dist > .25, iterations=2)
        labels, count = ndimage.label(solid)
        for label, box in enumerate(ndimage.find_objects(labels), start=1):
            part = labels[box] == label
            filled = ndimage.binary_fill_holes(part)
            own, full = part.sum(), filled.sum()
            if own > .08 * solid.size or (full > .004 * solid.size and full > 1.5 * own):
                a[box][filled] = 1
    if opts.get('ribbon'):
        # Belcube's white ribbon is drawn only by its two gold edge lines, which never close.
        # Fit a curve through each line and make the band between them opaque white.
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        gold = (r - b > .25) & (g > .35) & (r > .55) & (g < r) & (r - g < .35)
        labels, count = ndimage.label(ndimage.binary_closing(gold, iterations=2))
        h, w = gold.shape
        arcs = []
        for label, box in enumerate(ndimage.find_objects(labels), start=1):
            if box[1].stop - box[1].start > .25 * w:
                ys, xs = np.nonzero((labels == label) & gold)
                cols = np.unique(xs)
                mean_y = np.array([ys[xs == c].mean() for c in cols])
                arcs.append((mean_y.mean(), cols, mean_y))
        arcs.sort(key=lambda arc: arc[0])
        top = np.polyfit(arcs[0][1], arcs[0][2], 2)
        bottom = np.polyfit(np.concatenate([arc[1] for arc in arcs[1:]]), np.concatenate([arc[2] for arc in arcs[1:]]), 2)
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        # The band tapers to a point at each end of the top line, like the printed swoosh.
        x0, x1 = arcs[0][1].min(), arcs[0][1].max()
        t = np.clip(np.minimum(xx - x0, x1 - xx) / (.12 * (x1 - x0)), 0, 1)
        upper = np.polyval(top, xx)
        lower = upper + (np.polyval(bottom, xx) - upper) * t * t * (3 - 2 * t)
        band = np.clip(np.minimum(yy - upper, lower - yy) + .5, 0, 1)
        a = np.maximum(a, band)
    if shape := opts.get('solid_shape'):
        # White that the artwork encloses is part of the logo (ribbon band, label box, petal
        # separators): close thin gaps in the outline, then every enclosed area becomes opaque.
        ink_mask = dist > shape['lo']
        closed = ndimage.binary_closing(ink_mask, structure=ndimage.generate_binary_structure(2, 1), iterations=shape['close'])
        enclosed = ndimage.binary_fill_holes(closed) & ~ink_mask
        if min_area := shape.get('min_area'):
            # Keep only large enclosed areas (an emblem's interior), not letter counters.
            labels, _ = ndimage.label(enclosed)
            sizes = np.bincount(labels.ravel())
            enclosed &= (sizes[labels] > min_area * enclosed.size) & (labels > 0)
        a = np.where(enclosed, 1, np.clip((dist - shape['lo']) / (lo + .1 - shape['lo']), 0, 1) if shape['lo'] < lo else a)
    if opts.get('shield'):
        # White shield with a silver rim (Aptamil): everything inside the rim's convex outline is opaque.
        lab = to_oklab(rgb)
        rim = (dist > .1) & (np.hypot(lab[..., 1], lab[..., 2]) < .025) & (lab[..., 0] > .7)
        labels, _ = ndimage.label(rim)
        sizes = np.bincount(labels.ravel())
        rim &= sizes[labels] > 200
        pts = np.argwhere(rim)[:, ::-1].astype(float)
        hull = pts[ConvexHull(pts).vertices]
        h, w = rim.shape
        mask = Image.new('L', (w * 4, h * 4), 0)
        ImageDraw.Draw(mask).polygon([tuple(p * 4 + 2) for p in hull], fill=255)
        cover = np.asarray(mask.resize((w, h), Image.Resampling.BOX)).astype(np.float32) / 255
        a = np.maximum(a, cover)
        inside = cover > .5
    # Un-mix anti-aliased edges from the background colour.
    safe = np.maximum(a, 1e-3)[..., None]
    colour = np.clip((rgb - (1 - a[..., None]) * bg) / safe, 0, 1)
    if opts.get('raw'):
        return colour, a  # illustration: original colours, black linework included
    if opts.get('tint') == 'bg':
        colour = np.broadcast_to(bg, colour.shape).copy()  # white-on-colour tile → wordmark in the tile colour
        return colour, a
    return for_dark_wall(colour, inside), a


def main() -> None:
    OUT.mkdir(exist_ok=True)
    manifest = []
    with tempfile.TemporaryDirectory() as tmp:
        for slug, name, file, opts in BRANDS:
            colour, cov = extract(load(SRC / file, Path(tmp)), opts)
            ys, xs = np.nonzero(cov > .04)
            crop = np.s_[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            cov = cov[crop]
            pixels = np.dstack([colour[crop], cov[..., None]])
            mark = Image.fromarray((pixels * 255).round().astype(np.uint8), 'RGBA')
            mark.thumbnail((MAX_W, MAX_H), Image.Resampling.LANCZOS)
            mark.save(OUT / f'{slug}.webp', lossless=True, method=6)
            manifest.append(dict(slug=slug, name=name, width=mark.width, height=mark.height,
                                 density=round(float(cov.mean()), 3), **({'scale': opts['scale']} if 'scale' in opts else {})))
            print(f'{slug:16} {mark.width:4}x{mark.height:<4} density {cov.mean():.2f}')
    (ROOT / 'src/logos.json').write_text(json.dumps(manifest, indent=1), encoding='utf8')


if __name__ == '__main__':
    main()
