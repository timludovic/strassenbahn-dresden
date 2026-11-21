"""Kontaktblatt aller Haltestellen-Kacheln (2x, mit Linien-Beschriftung)."""
import json, os
from PIL import Image, ImageDraw

H = json.load(open('tools/geo/hubs35.json'))
tiles = [(o, f"artifacts/tiles/{o['id']}.png") for o in H if os.path.exists(f"artifacts/tiles/{o['id']}.png")]
tiles.sort(key=lambda t: (-len(t[0]['lines']), t[0]['name']))

if not tiles:
    raise SystemExit('keine Kacheln')

tw, th = Image.open(tiles[0][1]).size
scale = 0.5
tw, th = int(tw * scale), int(th * scale)
cols = 5
rows = (len(tiles) + cols - 1) // cols
pad, lab = 8, 30
W = cols * tw + (cols + 1) * pad
Hh = rows * (th + lab) + (rows + 1) * pad
sheet = Image.new('RGB', (W, Hh), (12, 16, 20))
d = ImageDraw.Draw(sheet)
for i, (o, path) in enumerate(tiles):
    c, r = i % cols, i // cols
    x = pad + c * (tw + pad)
    y = pad + r * (th + lab + pad)
    d.text((x + 2, y + 2), o['name'][:34], fill=(238, 236, 228))
    d.text((x + 2, y + 16), 'Linie ' + ','.join(o['lines']), fill=(240, 170, 0))
    im = Image.open(path).convert('RGB').resize((tw, th), Image.LANCZOS)
    sheet.paste(im, (x, y + lab))
sheet.save('artifacts/tiles-sheet.jpg', quality=90, optimize=True)
print('Kacheln im Blatt:', len(tiles), 'von', len(H), sheet.size)
