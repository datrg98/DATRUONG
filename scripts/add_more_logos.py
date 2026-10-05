import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

OUT = Path('C:/DATRG/CV/public/logos')
LOGOS_JSON = Path('C:/DATRG/CV/src/logos.json')

logos = json.load(open(LOGOS_JSON, 'r', encoding='utf-8'))
slugs = {x['slug'] for x in logos}

new_brands = [
    {
        'slug': 'sony-alpha',
        'name': 'Sony Alpha',
        'text': 'SONY α',
        'font_size': 76,
        'bold': True
    },
    {
        'slug': 'tiktok-shop',
        'name': 'TikTok Shop',
        'text': 'TikTok Shop',
        'font_size': 68,
        'bold': True
    },
    {
        'slug': 'onpoint',
        'name': 'OnPoint',
        'text': 'OnPoint',
        'font_size': 80,
        'bold': True
    },
    {
        'slug': 'uimass',
        'name': 'UI MASS',
        'text': 'UI MASS',
        'font_size': 74,
        'bold': True
    },
    {
        'slug': 'topgum',
        'name': 'TopGum',
        'text': 'TopGum',
        'font_size': 78,
        'bold': True
    },
    {
        'slug': 'vus',
        'name': 'VUS',
        'text': 'VUS',
        'font_size': 86,
        'bold': True
    },
    {
        'slug': 'matthieu',
        'name': 'Matthieu',
        'text': 'MATTHIEU',
        'font_size': 72,
        'bold': False
    }
]

font_bold = 'C:/Windows/Fonts/segoeuib.ttf'
font_reg = 'C:/Windows/Fonts/segoeui.ttf'

for b in new_brands:
    if b['slug'] in slugs:
        continue
    f_path = font_bold if b['bold'] else font_reg
    try:
        font = ImageFont.truetype(f_path, b['font_size'])
    except Exception as e:
        print('Font error:', e)
        font = ImageFont.load_default()
    
    dummy = Image.new('RGBA', (800, 300), (0,0,0,0))
    draw = ImageDraw.Draw(dummy)
    bbox = draw.textbbox((0, 0), b['text'], font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    pad = 20
    im = Image.new('RGBA', (tw + pad * 2, th + pad * 2), (0,0,0,0))
    d = ImageDraw.Draw(im)
    d.text((pad - bbox[0], pad - bbox[1]), b['text'], fill=(240, 243, 255, 245), font=font)
    
    crop = im.crop(im.getbbox())
    cw, ch = crop.size
    scale = min(140.0 / ch, 340.0 / cw, 1.0)
    w_fin = int(cw * scale)
    h_fin = int(ch * scale)
    crop = crop.resize((w_fin, h_fin), Image.Resampling.LANCZOS)
    
    crop.save(OUT / f"{b['slug']}.webp", quality=95)
    arr = np.array(crop)
    density = float(np.mean(arr[:, :, 3] > 30))
    
    logos.append({
        'slug': b['slug'],
        'name': b['name'],
        'width': w_fin,
        'height': h_fin,
        'density': round(density, 3),
        'scale': 1.05
    })
    print(f"Created and added: {b['name']}")

with open(LOGOS_JSON, 'w', encoding='utf-8') as f:
    json.dump(logos, f, indent=1, ensure_ascii=False)

print('Total logos now:', len(logos))
