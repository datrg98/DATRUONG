import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(r"c:\DATRG\CV")
SOURCE_DIR = Path(r"C:\DATRG\CV source\VIDEO")
DEST_DIR = ROOT / "public" / "videos"
POSTERS_DIR = ROOT / "public" / "posters"
MEDIA_JSON = ROOT / "src" / "media.json"

FFMPEG = Path(r"C:\datrg\AI\FlowEraser-Portable\node_modules\ffmpeg-static\ffmpeg.exe")
FFPROBE = Path(r"C:\Program Files\Topaz Labs LLC\Topaz Video AI\ffprobe.exe")

DEST_DIR.mkdir(parents=True, exist_ok=True)
POSTERS_DIR.mkdir(parents=True, exist_ok=True)

new_videos = [
    {
        "file": "BTD19122709.mp4",
        "ss": 3.0,
        "scale": "1080:1920",
    },
    {
        "file": "CONG HOA.mp4",
        "ss": 3.0,
        "scale": "2560:-2", # Keeps ultra-widescreen aspect ratio, perfectly sharp
    },
    {
        "file": "CV0707449.mp4",
        "ss": 3.0,
        "scale": "1080:1920",
    },
    {
        "file": "BEL0001954.mp4",
        "ss": 3.0,
        "scale": "1080:1920",
    }
]

print("=== Starting video transcoding & poster extraction ===")

with open(MEDIA_JSON, "r", encoding="utf-8") as f:
    media_data = json.load(f)

# Also remove ADD0203302.mp4 from media_data if desired, or keep it
# media_data is a lookup of video info

for item in new_videos:
    src_file = SOURCE_DIR / item["file"]
    dest_file = DEST_DIR / item["file"]
    poster_webp = POSTERS_DIR / item["file"].replace(".mp4", ".webp")
    temp_jpg = POSTERS_DIR / "temp_poster.jpg"
    
    print(f"\nProcessing {item['file']}...")
    
    # 1. Transcode video
    cmd_encode = [
        str(FFMPEG), "-y",
        "-i", str(src_file),
        "-vf", f"scale={item['scale']}",
        "-c:v", "libx264",
        "-crf", "22",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "160k",
        "-movflags", "+faststart",
        str(dest_file)
    ]
    subprocess.run(cmd_encode, check=True)
    size_mb = dest_file.stat().st_size / (1024 * 1024)
    print(f"Transcoded -> {dest_file.name} ({size_mb:.2f} MB)")
    
    # 2. Extract poster frame
    cmd_poster = [
        str(FFMPEG), "-y",
        "-ss", str(item["ss"]),
        "-i", str(dest_file),
        "-vframes", "1",
        "-q:v", "2",
        str(temp_jpg)
    ]
    subprocess.run(cmd_poster, check=True)
    
    im = Image.open(temp_jpg).convert("RGB")
    im.save(poster_webp, quality=86)
    if temp_jpg.exists():
        temp_jpg.unlink()
    print(f"Poster created -> {poster_webp.name} ({im.width}x{im.height})")
    
    # 3. Probe duration and resolution
    probe_cmd = [
        str(FFPROBE), "-v", "error",
        "-show_entries", "format=duration:stream=codec_type,width,height",
        "-of", "json",
        str(dest_file)
    ]
    info = json.loads(subprocess.check_output(probe_cmd))
    stream = next(s for s in info["streams"] if s["codec_type"] == "video")
    duration = float(info["format"]["duration"])
    
    media_data[item["file"]] = {
        "duration": round(duration, 2),
        "width": stream["width"],
        "height": stream["height"]
    }

with open(MEDIA_JSON, "w", encoding="utf-8") as f:
    json.dump(media_data, f, indent=2)

print("\n=== All 4 videos and posters processed successfully! media.json updated. ===")
