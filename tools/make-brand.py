"""Generate favicons, app icons, logo PNG and the default Open Graph image.
Run from the project root:  python -P tools/make-brand.py
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join('src', 'assets', 'img', 'brand')
os.makedirs(OUT, exist_ok=True)
NAVY, ABYSS, SUN, WHITE = (7, 31, 46), (4, 18, 28), (255, 178, 63), (255, 255, 255)

SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#04121c"/>
<g transform="translate(12 12)"><circle cx="20" cy="20" r="18.6" fill="none" stroke="#fff" stroke-width="1.8"/>
<path d="M9.5 23C10.4 17.2 11.6 12.6 13.6 9.4c6.1 1.6 12.3 5.4 17.4 10.9V23z" fill="#fff"/>
<path d="M7.5 26.2c2.1 0 2.1-1.6 4.2-1.6s2.1 1.6 4.2 1.6 2.1-1.6 4.2-1.6 2.1 1.6 4.2 1.6 2.1-1.6 4.2-1.6 2.1 1.6 4.2 1.6" fill="none" stroke="#ffb23f" stroke-width="2.2" stroke-linecap="round"/></g></svg>'''
with open(os.path.join(OUT, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(SVG)


def mark(size, bg=True, radius=0.22):
    """Draw the logo mark at 4x then downsample for smooth edges."""
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if bg:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * radius), fill=ABYSS)
    pad = S * 0.19
    k = (S - 2 * pad) / 40.0  # mark is drawn in a 40x40 box
    X = lambda x: pad + x * k
    r = 18.6 * k
    d.ellipse([X(20) - r, X(20) - r, X(20) + r, X(20) + r], outline=WHITE, width=max(2, int(1.8 * k)))
    # sail / dorsal fin
    def bez(p0, p1, p2, p3, n=24):
        return [tuple((1-t)**3*p0[i] + 3*(1-t)**2*t*p1[i] + 3*(1-t)*t**2*p2[i] + t**3*p3[i] for i in (0, 1)) for t in [j / n for j in range(n + 1)]]
    sail = bez((9.5, 23), (10.4, 17.2), (11.6, 12.6), (13.6, 9.4)) + bez((13.6, 9.4), (19.7, 11.0), (25.9, 14.8), (31.0, 20.3)) + [(31.0, 23.0)]
    d.polygon([(X(a), X(b)) for a, b in sail], fill=WHITE)
    # wave
    pts = [(X(7.5 + i * 0.25), X(25.4 + 0.8 * math.cos((i * 0.25) / 8.4 * 2 * math.pi))) for i in range(0, 101)]
    d.line(pts, fill=SUN, width=max(2, int(2.2 * k)), joint='curve')
    return im.resize((size, size), Image.LANCZOS)


for name, size in [('favicon-32.png', 32), ('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512), ('logo-512.png', 512)]:
    mark(size, radius=0.0 if name == 'apple-touch-icon.png' else 0.22).save(os.path.join(OUT, name), optimize=True)


def font(names, size):
    for n in names:
        p = os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', n)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


# Open Graph image 1200x630
W, H = 1200, 630
bg_path = None
for cand in ('hero-coast', 'pacific-sunset', 'sportfisher-running', 'sailfish'):
    for grp in ('places', 'boats', 'fish'):
        p = os.path.join('src', 'assets', 'img', grp, cand + '.webp')
        if os.path.exists(p):
            bg_path = p
            break
    if bg_path:
        break
if bg_path:
    src = Image.open(bg_path).convert('RGB')
    ratio = max(W / src.width, H / src.height)
    src = src.resize((math.ceil(src.width * ratio), math.ceil(src.height * ratio)), Image.LANCZOS)
    left, top = (src.width - W) // 2, (src.height - H) // 2
    og = src.crop((left, top, left + W, top + H))
else:
    og = Image.new('RGB', (W, H), NAVY)
shade = Image.new('RGBA', (W, H))
sd = ImageDraw.Draw(shade)
for y in range(H):
    a = int(255 * (0.25 + 0.65 * (y / H) ** 1.4))
    sd.line([(0, y), (W, y)], fill=(4, 18, 28, min(a, 235)))
for x in range(W):
    a = int(120 * max(0, 1 - x / (W * 0.75)))
    sd.line([(x, 0), (x, H)], fill=(4, 18, 28, a))
og = Image.alpha_composite(og.convert('RGBA'), shade)
d = ImageDraw.Draw(og)
og.alpha_composite(mark(84), (64, 60))
d.text((166, 72), 'COSTA RICA', font=font(['segoeuib.ttf', 'arialbd.ttf'], 18), fill=SUN)
d.text((166, 96), 'Bluewater', font=font(['georgiab.ttf', 'georgia.ttf'], 36), fill=WHITE)
d.text((64, 330), 'COSTA RICA FISHING CHARTERS', font=font(['segoeuib.ttf', 'arialbd.ttf'], 24), fill=SUN)
d.text((64, 368), 'Bluewater. Billfish.', font=font(['georgia.ttf'], 78), fill=WHITE)
d.text((64, 456), 'Pura vida.', font=font(['georgiai.ttf', 'georgia.ttf'], 78), fill=SUN)
d.text((64, 562), 'Sailfish · Marlin · Tuna · Roosterfish — 16 destinations', font=font(['segoeui.ttf', 'arial.ttf'], 24), fill=(255, 255, 255, 220))
og.convert('RGB').save(os.path.join(OUT, 'og-default.jpg'), quality=86, optimize=True, progressive=True)
print('brand assets written to', OUT, '| og background:', bg_path or 'gradient')
