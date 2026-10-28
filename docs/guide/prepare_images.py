"""Turns shots/*.png into the compressed, annotated images the guide uses."""
import glob, os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('img', exist_ok=True)
font = ImageFont.truetype(os.environ.get('GUIDE_FONT', 'C:/Windows/Fonts/segoeuib.ttf'), 30)

def annotate(src, pts, scale):
    im = Image.open(src).convert('RGB'); d = ImageDraw.Draw(im)
    for n, (x, y) in enumerate(pts, 1):
        x, y, r = int(x * scale), int(y * scale), 26
        d.ellipse((x - r - 3, y - r - 3, x + r + 3, y + r + 3), fill='white')
        d.ellipse((x - r, y - r, x + r, y + r), fill='#465fff')
        d.text((x - d.textlength(str(n), font=font) / 2, y - 19), str(n), fill='white', font=font)
    return im

def save(im, name):
    if im.width > 1900: im = im.resize((1900, int(im.height * 1900 / im.width)), Image.LANCZOS)
    im.convert('RGB').save(f'img/{name}.jpg', quality=88, optimize=True)

def crop_dialog(im):
    # The dialog is the only pure-white block over a dimmed, blurred page.
    g = im.convert('L').point(lambda v: 255 if v >= 252 else 0)
    w, h = g.size
    g = g.crop((int(w * .2), int(h * .08), int(w * .8), int(h * .95)))
    box = g.getbbox()
    if not box: return im
    x0, y0, x1, y1 = box; ox, oy = int(w * .2), int(h * .08); pad = 36
    return im.crop((max(ox + x0 - pad, 0), max(oy + y0 - pad, 0), min(ox + x1 + pad, w), min(oy + y1 + pad, h)))

for f in glob.glob('shots/*.png'):
    name = os.path.basename(f)[:-4]
    im = Image.open(f)
    save(crop_dialog(im) if name[:2] in ('50','51','52','53','54') else im, name)
# Numbered markers for the two annotated figures (coordinates are for the 1440px layout).
save(annotate('shots/02-dashboard.png', [(380,245),(1500,135),(380,428),(380,742),(425,1050),(1235,1050)], 1.08), '02-dashboard-a')
save(annotate('shots/10-analytics-users.png', [(385,258),(1760,128),(385,368),(735,368),(395,540),(1180,540),(395,1180),(1180,1180)], 1.10), '10-analytics-users-a')
