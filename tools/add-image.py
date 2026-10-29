"""Add your own photo to the site.

  python -P tools/add-image.py <photo.jpg> <group> <id> "<alt text>" ["Author"] ["License"]

  group : boats | fish | places
  id    : the image id used in the data files (e.g. "pura-vida-hunter" or "sailfish")

Creates <id>.webp (max 2000px wide) and <id>-800.webp in src/assets/img/<group>/
and adds/updates the entry in that folder's manifest.json. Then reference the id
in src/data/*.mjs (e.g. a boat's `img: ['pura-vida-hunter', ...]`) and rebuild.
"""
import json
import os
import sys
from PIL import Image, ImageOps

if len(sys.argv) < 5:
    sys.exit(__doc__)
src, group, img_id, alt = sys.argv[1:5]
author = sys.argv[5] if len(sys.argv) > 5 else 'Own photo'
lic = sys.argv[6] if len(sys.argv) > 6 else 'All rights reserved (owner)'
if group not in ('boats', 'fish', 'places'):
    sys.exit('group must be boats, fish or places')

out_dir = os.path.join('src', 'assets', 'img', group)
os.makedirs(out_dir, exist_ok=True)
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
big = im.copy()
if big.width > 2000:
    big = big.resize((2000, round(big.height * 2000 / big.width)), Image.LANCZOS)
big.save(os.path.join(out_dir, f'{img_id}.webp'), 'WEBP', quality=80, method=6)
sm = im.resize((800, round(im.height * 800 / im.width)), Image.LANCZOS)
sm.save(os.path.join(out_dir, f'{img_id}-800.webp'), 'WEBP', quality=78, method=6)

man_path = os.path.join(out_dir, 'manifest.json')
manifest = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else []
manifest = [m for m in manifest if m['id'] != img_id]
manifest.append({
    'id': img_id, 'file': f'{group}/{img_id}.webp', 'file_sm': f'{group}/{img_id}-800.webp',
    'subject': alt, 'alt': alt, 'width': big.width, 'height': big.height,
    'author': author, 'license': lic, 'license_url': '', 'source_url': '', 'notes': 'Added with tools/add-image.py',
})
json.dump(manifest, open(man_path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(f'Added {group}/{img_id}.webp ({big.width}x{big.height}). Rebuild with: npm run build')
