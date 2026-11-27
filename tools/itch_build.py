"""Baut das itch.io-Paket: HTML5-Zip mit index.html im Wurzelverzeichnis.

    python3 tools/itch_build.py
"""
import glob
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "dist", "itch")
ZIP = os.path.join(ROOT, "release", "linie-1-itch.zip")

LINES = ("1", "2", "3", "4", "6", "7", "8", "9", "10", "11", "12", "13")
FILES = [
    ("game.html", "index.html"),
    ("css/game.css", "css/game.css"),
    ("js/game.js", "js/game.js"),
    ("assets/world/lines.json", "assets/world/lines.json"),
] + [(f"assets/game/map_{i}.json", f"assets/game/map_{i}.json") for i in LINES]


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    for src, dst in FILES:
        s = os.path.join(ROOT, src)
        d = os.path.join(OUT, dst)
        if not os.path.exists(s):
            sys.exit(f"fehlt: {src}")
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(s, d)

    os.makedirs(os.path.dirname(ZIP), exist_ok=True)
    if os.path.exists(ZIP):
        os.remove(ZIP)
    subprocess.run(["zip", "-qr", ZIP, "."], cwd=OUT, check=True)

    total = sum(os.path.getsize(os.path.join(dp, f))
                for dp, _, fs in os.walk(OUT) for f in fs)
    print(f"{len(FILES)} Dateien, {total/1e6:.2f} MB entpackt, "
          f"{os.path.getsize(ZIP)/1e6:.2f} MB als Zip -> {os.path.relpath(ZIP, ROOT)}")


if __name__ == "__main__":
    main()
