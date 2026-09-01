#!/usr/bin/env python3
"""
Download the photos referenced in column H ("Visual / Photo Direction") of
the "Digital Map Biography" production sheet's exported CSV, and save each
under a local filename that matches what demos/connecting-worlds.html
already expects.

This exists to avoid routing image downloads through an API/MCP tool that
base64-encodes the whole file into the response — for a few hundred KB
image that becomes a very large chunk of text to push through a model's
context. Downloading directly with `requests` writes bytes straight to
disk instead.

Input: the sheet exported as CSV (File > Download > Comma-separated values
in Google Sheets), with the standard MASTER_SCENARIO header:
    ID, Era/Date, Map Pin, Chapter Title, Subtitle, On-screen Text,
    Detail / Narration, Visual / Photo Direction, Alternative if no
    personal photo, Source / Evidence, Verification, Implementation Note

Column H's cells are free text with zero or more embedded
https://drive.google.com/file/d/<id>/... links mixed in (e.g.
"1970年代NYU :https://drive.google.com/file/d/XXXX/view、Washington
Square:https://drive.google.com/file/d/YYYY/view") — this script pulls
every link out of every row with a regex, no assumption about formatting.

Each sheet row ID maps to a fixed chapter slug (SHEET_ID_TO_CHAPTER_SLUG
below, kept in sync with the `sheetId`/`id` fields in
demos/connecting-worlds.html). A row with N links is saved as
<slug>.<ext>, <slug>-2.<ext>, <slug>-3.<ext>, ... in sheet order. The file
extension is only knowable after downloading (Drive links don't carry
one), so it's detected from the file's magic bytes.

Usage:
    pip install requests
    python3 scripts/download_sheet_images.py "sheet_export.csv" \
        --out-dir demos/assets/images \
        --manifest scripts/download_manifest.txt

Then hand the manifest path to Claude — it's a plain list of local paths,
cheap to read, instead of the images themselves.
"""
import argparse
import csv
import re
import sys
from pathlib import Path

import requests

# Keep this in sync with the sheetId/id fields in demos/connecting-worlds.html.
# Rows 00/40 (the opening/ending hero) map here too even though the hero
# layout has no image slot in the UI today — the sheet has started adding
# links for them anyway (e.g. row 40's Jurin AI logo), so download and save
# them for whenever hero images are supported, rather than silently skipping.
SHEET_ID_TO_CHAPTER_SLUG = {
    "00": "opening",
    "01": "genzo-kageyama",
    "02": "meiji-jingu-1947",
    "03": "kuroyon",
    "04": "corporate-japan",
    "05": "tomi",
    "06": "ginza-soroptimist",
    "07": "makoto-watanabe",
    "08": "the-diet",
    "09": "sadako",
    "10": "sampei-takayama",
    "11": "nyu-mba",
    "12": "chase-manhattan",
    "13": "born-in-new-york-1971",
    "14": "dusseldorf",
    "15": "tokyo-school",
    "16": "oxford",
    "17": "sothebys-london",
    "18": "tadanori-yokoo-office",
    "19": "bunkamura",
    "20": "goldman-sachs",
    "21": "roppongi-hills-mori",
    "22": "happiness-mori-2003",
    "23": "family-2002",
    "24": "hong-kong",
    "25": "second-daughter",
    "26": "opera-gallery",
    "27": "saint-germain-en-laye",
    "28": "paris",
    "29": "tokyo-2020",
    "30": "covid-19",
    "31": "digital-communications",
    "32": "president-branding",
    "33": "mapbox-japan-2022",
    "34": "tiff",
    "35": "ennova-art-biennale",
    "36": "odaiba-triennale",
    "37": "milano-cortina-2026",
    "38": "jurin-ai",
    "39": "forged-in-japan",
    "40": "ending",
}

DRIVE_LINK_RE = re.compile(r"https://drive\.google\.com/file/d/([a-zA-Z0-9_-]+)")

MAGIC_TO_EXT = [
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"\xff\xd8\xff", "jpg"),
    (b"GIF87a", "gif"),
    (b"GIF89a", "gif"),
    (b"RIFF", "webp"),  # crude; WEBP has "WEBP" at offset 8 too, good enough here
]


def detect_ext(path):
    with open(path, "rb") as f:
        head = f.read(16)
    for magic, ext in MAGIC_TO_EXT:
        if head.startswith(magic):
            return ext
    return None


def download_drive_file(file_id, dest_path, session):
    """Handles Google Drive's "can't scan this file for viruses" interstitial
    that appears for some files by extracting and resubmitting the confirm
    token, either from a cookie or from the HTML page itself."""
    base_url = "https://drive.google.com/uc?export=download"
    response = session.get(base_url, params={"id": file_id}, stream=True)

    token = None
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            token = value
            break

    content_type = response.headers.get("Content-Type", "")
    if token is None and content_type.startswith("text/html"):
        html = response.text
        m = re.search(r'confirm=([0-9A-Za-z_-]+)', html)
        if m:
            token = m.group(1)

    if token:
        response = session.get(
            base_url, params={"id": file_id, "confirm": token}, stream=True
        )

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(32768):
            if chunk:
                f.write(chunk)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_path", help="The sheet exported as CSV")
    parser.add_argument("--out-dir", default="demos/assets/images", help="Directory to save downloaded files into")
    parser.add_argument("--manifest", default="scripts/download_manifest.txt", help="Where to write the manifest of saved local paths")
    parser.add_argument("--only-missing", action="store_true", help="Skip rows whose expected output file(s) already exist")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    session = requests.Session()
    manifest_lines = []
    had_warning = False

    with open(args.csv_path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        if len(header) < 8 or header[0] != "ID":
            sys.exit("This doesn't look like the MASTER_SCENARIO export -- expected 'ID' as the first column.")

        for row in reader:
            if len(row) < 8:
                continue
            sheet_id = row[0].strip()
            chapter_title = row[3].strip() if len(row) > 3 else ""
            photo_cell = row[7]

            links = DRIVE_LINK_RE.findall(photo_cell)
            if not links:
                continue

            slug = SHEET_ID_TO_CHAPTER_SLUG.get(sheet_id)
            if slug is None:
                print(f"Row {sheet_id} ({chapter_title}): has {len(links)} link(s) but no known chapter slug -- skipping. Add it to SHEET_ID_TO_CHAPTER_SLUG if this is a real scene.")
                continue

            for i, file_id in enumerate(links):
                suffix = "" if i == 0 else f"-{i + 1}"
                # Extension is unknown until after download; write to a temp
                # name first, then rename once we know it.
                temp_dest = out_dir / f"connecting-worlds-{slug}{suffix}.tmp"

                existing = sorted(out_dir.glob(f"connecting-worlds-{slug}{suffix}.*"))
                existing = [p for p in existing if p.suffix != ".tmp"]
                if args.only_missing and existing:
                    print(f"Row {sheet_id} ({chapter_title}) link {i + 1}: {existing[0].name} already exists, skipping.")
                    manifest_lines.append(str(existing[0]))
                    continue

                print(f"Row {sheet_id} ({chapter_title}) link {i + 1}/{len(links)}: downloading (Drive id {file_id})...")
                try:
                    download_drive_file(file_id, temp_dest, session)
                except requests.RequestException as e:
                    print(f"  FAILED: {e}")
                    continue

                ext = detect_ext(temp_dest) or "png"
                dest = out_dir / f"connecting-worlds-{slug}{suffix}.{ext}"
                temp_dest.replace(dest)

                size = dest.stat().st_size
                if detect_ext(dest) is None:
                    had_warning = True
                    print(f"  -> saved {dest} ({size} bytes) -- WARNING: doesn't look like a real image (Drive confirm page? private file?). Check it manually.")
                else:
                    print(f"  -> saved {dest} ({size} bytes)")
                manifest_lines.append(str(dest))

    Path(args.manifest).parent.mkdir(parents=True, exist_ok=True)
    with open(args.manifest, "w", encoding="utf-8") as mf:
        mf.write("\n".join(manifest_lines) + ("\n" if manifest_lines else ""))

    print(f"\nDone. Wrote manifest with {len(manifest_lines)} entries to {args.manifest}")
    if had_warning:
        print("Some files didn't look like real images -- check those manually.")


if __name__ == "__main__":
    main()
