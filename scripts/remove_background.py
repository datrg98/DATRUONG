import os
from pathlib import Path
import numpy as np
import torch
import torchvision.transforms as T
import torchvision.models.segmentation as seg
from PIL import Image, ImageFilter
import cv2

IMG_PATH = Path(r"C:\Users\M16\.gemini\antigravity\brain\a0d9e168-c809-4aef-b319-e99f706e1efb\.user_uploaded\media_1791212372932.jpg")
OUT_DIR = Path(r"C:\DATRG\CV\public")
OUT_FILE = OUT_DIR / "dat-truong-avatar.png"
OUT_WEBP = OUT_DIR / "dat-truong-avatar.webp"

print("Loading image...")
img_pil = Image.open(IMG_PATH).convert("RGB")
w, h = img_pil.size
img_np = np.array(img_pil)

print("Loading DeepLabV3 ResNet101...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)
model = seg.deeplabv3_resnet101(weights=seg.DeepLabV3_ResNet101_Weights.DEFAULT).to(device)
model.eval()

transform = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

tensor_img = transform(img_pil).unsqueeze(0).to(device)

with torch.no_grad():
    output = model(tensor_img)['out'][0]
    # Person class is 15 in Pascal VOC
    probs = torch.softmax(output, dim=0)[15].cpu().numpy()

# Resize probs back to original image size
probs_resized = cv2.resize(probs, (w, h), interpolation=cv2.INTER_CUBIC)

# Let's inspect initial mask
mask_bin = (probs_resized > 0.5).astype(np.uint8)

# Now refine using GrabCut guided by DeepLabV3
# Grabcut mask values:
# cv2.GC_BGD = 0 (sure bg)
# cv2.GC_FGD = 1 (sure fg)
# cv2.GC_PR_BGD = 2 (probable bg)
# cv2.GC_PR_FGD = 3 (probable fg)
gc_mask = np.zeros((h, w), dtype=np.uint8)
gc_mask[:] = cv2.GC_PR_BGD

# High confidence fg
gc_mask[probs_resized > 0.75] = cv2.GC_FGD
# Probable fg
gc_mask[(probs_resized > 0.3) & (probs_resized <= 0.75)] = cv2.GC_PR_FGD
# Probable bg
gc_mask[(probs_resized >= 0.05) & (probs_resized <= 0.3)] = cv2.GC_PR_BGD
# Sure bg
gc_mask[probs_resized < 0.05] = cv2.GC_BGD

# Also ensure borders at the top/left/right that are definitely far from person are sure bg
gc_mask[:20, :] = cv2.GC_BGD
gc_mask[:, :20] = cv2.GC_BGD
gc_mask[:, -20:] = cv2.GC_BGD

bgd_model = np.zeros((1, 65), np.float64)
fgd_model = np.zeros((1, 65), np.float64)

print("Refining with GrabCut...")
bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
cv2.grabCut(bgr, gc_mask, None, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_MASK)

fg_mask = np.where((gc_mask == cv2.GC_FGD) | (gc_mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

# Clean up mask holes and stray noise
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)
# Find largest connected component (the person)
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(fg_mask)
if num_labels > 1:
    largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    fg_mask = np.where(labels == largest_label, 255, 0).astype(np.uint8)

# Soft edge feathering and guided edge refinement
# Guided filter or smooth blur on transition boundary
boundary = cv2.morphologyEx(fg_mask, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
alpha = fg_mask.astype(np.float32) / 255.0
alpha_blurred = cv2.GaussianBlur(alpha, (5, 5), 1.0)
alpha = np.where(boundary > 0, alpha_blurred, alpha)

# Clamp alpha
alpha = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)

# Create 4-channel RGBA
rgba = np.dstack([img_np, alpha])
out_pil = Image.fromarray(rgba)

# Save PNG and WebP
out_pil.save(OUT_FILE, format="PNG")
out_pil.save(OUT_WEBP, format="WEBP", quality=95)
print(f"Saved cutouts to:\n{OUT_FILE}\n{OUT_WEBP}")
