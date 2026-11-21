"""Render the seven landmark tiles and a labelled contact sheet.

    python3 tools/geo/landmark_tile.py            # alle
    python3 tools/geo/landmark_tile.py zwinger    # eine Kachel
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tilegen import Tile            # noqa: E402
import landmarks                    # noqa: E402

TILES = [
    ("frauenkirche", 51.05200, 13.74148, 160, 110, "Frauenkirche / Neumarkt", "1·2·9"),
    ("zwinger", 51.05330, 13.73430, 300, 240, "Zwinger / Theaterplatz", "3·7"),
    ("hauptbahnhof_lm", 51.03960, 13.73332, 360, 340, "Hauptbahnhof / Wiener Platz", "3·4·7·8·10·11·12"),
    ("albertplatz_lm", 51.063242, 13.747143, 150, 100, "Albertplatz", "3·6·7·8·11·13"),
    ("blaues_wunder", 51.05295, 13.80920, 330, 170, "Blaues Wunder", "6·9"),
    ("elbbruecken", 51.06060, 13.73140, 340, 200, "Elbbrücken (Marienbrücke)", "4·6·9·11"),
    ("grosser_garten", 51.03780, 13.76400, 360, 260, "Großer Garten", "1·2·9·10·12"),
]

OUT = "artifacts/landmarks"


def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main(pick=None):
    made = []
    for name, lat, lon, w, h, label, lines in TILES:
        if pick and pick not in (name, label):
            continue
        print(f"[{name}] {w}x{h} m")
        t = Tile(lat, lon, name, w, h)
        if name in landmarks.PRE:
            t.pre_hooks.append(landmarks.PRE[name])
        t.hooks.append(landmarks.ACCENTS[name])
        img, path = t.save(OUT)
        made.append((name, label, lines, img))
        print("  ->", path, img.size)

    if not made:
        return
    pad, lab_h, col_w, cols = 14, 34, 680, 2
    rows = (len(made) + cols - 1) // cols
    heights = [int(col_w * im.height / im.width) for _, _, _, im in made]
    row_h = []
    for r in range(rows):
        hs = heights[r * cols:(r + 1) * cols]
        row_h.append(max(hs) if hs else 0)
    W = cols * (col_w + pad) + pad
    H = sum(row_h) + rows * (lab_h + pad) + pad + 46
    sheet = Image.new("RGB", (W, H), (14, 18, 22))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 12), "Wiedererkennungsobjekte - Pixelkacheln 1 m = 3,2 px", fill=(240, 170, 0), font=font(22))
    y = 46 + pad
    for r in range(rows):
        x = pad
        for c in range(cols):
            i = r * cols + c
            if i >= len(made):
                break
            name, label, lines, im = made[i]
            d.text((x, y), label, fill=(232, 236, 238), font=font(18))
            d.text((x + col_w - 210, y), "Linien " + lines, fill=(150, 170, 180), font=font(16))
            thumb = im.resize((col_w, heights[i]), Image.LANCZOS)
            sheet.paste(thumb, (x, y + lab_h - 8))
            d.rectangle([x, y + lab_h - 8, x + col_w, y + lab_h - 8 + heights[i]], outline=(60, 70, 78))
            x += col_w + pad
        y += row_h[r] + lab_h + pad
    os.makedirs("artifacts", exist_ok=True)
    sheet.save("artifacts/landmarks-all.jpg", quality=92, optimize=True)
    print("sheet artifacts/landmarks-all.jpg", sheet.size)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
