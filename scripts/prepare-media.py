"""Create web posters from the portfolio's local media. Originals stay untouched."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = Path('C:/Program Files/Topaz Labs LLC/Topaz Video AI/ffmpeg.exe')
FFPROBE = FFMPEG.with_name('ffprobe.exe')
OUT = ROOT / 'public/posters'
OUT.mkdir(exist_ok=True)
metadata = {}
previews = []
for path in sorted((ROOT / 'public/videos').glob('*.mp4')):
    info = json.loads(subprocess.check_output([str(FFPROBE), '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', str(path)]))
    stream = next(s for s in info['streams'] if s['codec_type'] == 'video')
    duration = float(info['format']['duration'])
    metadata[path.name] = dict(duration=round(duration, 2), width=stream['width'], height=stream['height'])
    if path.stem == 'nhung-dieu-ta-quen':
        im = Image.open('C:/DATRG/AI/HIGGSFIELD FILM CONTEST/THUMB.png').convert('RGB')
        im.resize((2016, 864), Image.Resampling.LANCZOS).save(OUT / 'nhung-dieu-ta-quen.webp', quality=88)
        im.resize((1008, 432), Image.Resampling.LANCZOS).save(OUT / 'nhung-dieu-ta-quen-small.webp', quality=85)
    else:
        frame = OUT / (path.stem + '.jpg')
        subprocess.run([str(FFMPEG), '-v', 'error', '-ss', str(min(3, duration / 4)), '-i', str(path), '-frames:v', '1', '-vf', 'scale=960:-2', '-y', str(frame)], check=True)
        im = Image.open(frame).convert('RGB')
        im.save(OUT / (path.stem + '.webp'), quality=84)
        frame.unlink()
    tile = Image.new('RGB', (300, 220), '#202020')
    tile.paste(ImageOps.contain(im, (300, 190)), (0, 0))
    ImageDraw.Draw(tile).text((8, 198), path.stem, fill='white')
    previews.append(tile)
(ROOT / 'src/media.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
sheet = Image.new('RGB', (1200, ((len(previews) + 3) // 4) * 220), '#202020')
for i, tile in enumerate(previews):
    sheet.paste(tile, ((i % 4) * 300, (i // 4) * 220))
sheet.save(ROOT / '.qa/media-contact-sheet.jpg')
print(f'Prepared {len(metadata)} posters and verified media metadata.')
