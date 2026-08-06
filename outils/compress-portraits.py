#!/usr/bin/env python3
"""
Compresse un dossier de portraits (format carte ~63x88mm) pour le Codex.

- Redimensionne (hauteur max, ratio conservé) pour rester net en petite
  vignette dans l'appli sans peser lourd.
- Réencode en WebP avec une qualité adaptative pour viser une taille cible
  par fichier (quelques Ko), sans dégrader excessivement les portraits qui
  compressent mal.
- Ne touche PAS aux couleurs : le noir et blanc se fait en CSS
  (filter: grayscale(1)) côté appli, pas ici. Les fichiers gardent leurs
  couleurs d'origine, ce qui laisse la porte ouverte à un mode couleur plus
  tard sans re-traiter les images.
- Attend une convention de nom : genre_race_numero.ext
  (ex: homme_gobelin_01.png, femme_elfe_07.jpg). Les fichiers qui ne suivent
  pas la convention sont quand même compressés, mais signalés en fin de
  script pour renommage manuel.
- Génère portraits/manifest.json : la liste des portraits avec leurs
  attributs, que l'appli charge côté client (GitHub Pages ne liste pas un
  dossier automatiquement).

Usage :
    python3 compress-portraits.py <dossier_source> <dossier_dest> [--max-height 440] [--target-kb 15]

Dépendance : Pillow (pip install pillow --break-system-packages)
"""
import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

NAME_RE = re.compile(r"^(?P<genre>[a-z]+)_(?P<race>[a-z\-]+)_(?P<numero>\d+)$", re.IGNORECASE)
VALID_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".gif"}


def parse_name(stem: str):
    m = NAME_RE.match(stem)
    if not m:
        return None
    return {
        "genre": m.group("genre").lower(),
        "race": m.group("race").lower(),
        "numero": m.group("numero"),
    }


def compress_one(src: Path, dst: Path, max_height: int, target_kb: int):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)  # respecte l'orientation, puis on jette l'EXIF
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")

    if im.height > max_height:
        ratio = max_height / im.height
        new_size = (max(1, round(im.width * ratio)), max_height)
        im = im.resize(new_size, Image.LANCZOS)

    target_bytes = target_kb * 1024
    quality = 82
    data = None
    while quality >= 35:
        from io import BytesIO
        buf = BytesIO()
        im.save(buf, "WEBP", quality=quality, method=6)
        data = buf.getvalue()
        if len(data) <= target_bytes:
            break
        quality -= 7

    dst.write_bytes(data)
    return len(data), quality


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=Path, help="Dossier des images brutes")
    ap.add_argument("dst", type=Path, help="Dossier de sortie (ex: SHADOWDARK CODEX/portraits)")
    ap.add_argument("--max-height", type=int, default=440, help="Hauteur max en px (def: 440)")
    ap.add_argument("--target-kb", type=int, default=15, help="Taille cible par fichier en Ko (def: 15)")
    args = ap.parse_args()

    if not args.src.is_dir():
        sys.exit(f"Dossier source introuvable : {args.src}")
    args.dst.mkdir(parents=True, exist_ok=True)

    files = sorted(p for p in args.src.iterdir() if p.suffix.lower() in VALID_EXT)
    if not files:
        sys.exit("Aucune image trouvée dans le dossier source.")

    manifest = []
    unmatched = []
    total_before = 0
    total_after = 0

    for f in files:
        stem = f.stem
        attrs = parse_name(stem)
        out_name = f"{stem}.webp"
        out_path = args.dst / out_name

        before = f.stat().st_size
        try:
            after, quality = compress_one(f, out_path, args.max_height, args.target_kb)
        except Exception as e:
            print(f"  ERREUR sur {f.name} : {e}")
            continue

        total_before += before
        total_after += after

        entry = {"file": out_name}
        if attrs:
            entry.update(attrs)
        else:
            unmatched.append(f.name)
        manifest.append(entry)

        print(f"  {f.name} -> {out_name} : {before/1024:.0f} Ko -> {after/1024:.1f} Ko (q={quality})")

    manifest_path = args.dst / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{len(manifest)} portraits traités.")
    print(f"Taille totale : {total_before/1024:.0f} Ko -> {total_after/1024:.0f} Ko")
    print(f"Manifest écrit : {manifest_path}")
    if unmatched:
        print(f"\n⚠️  {len(unmatched)} fichier(s) ne suivent pas la convention genre_race_numero :")
        for n in unmatched:
            print(f"  - {n}")
        print("Ils sont quand même compressés, mais sans genre/race dans le manifest")
        print("(l'appli les traitera comme portraits génériques, filtrables nulle part).")


if __name__ == "__main__":
    main()
