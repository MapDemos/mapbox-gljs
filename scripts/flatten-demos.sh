#!/bin/bash
# Builds a local preview of what the published site will look like once
# demos/ is the source of truth: flattens demos/*.html (and their companion
# data/assets/shared subfolders) to the site root, so live URLs stay
# exactly what they are today (e.g. /store-locator.html, not
# /demos/store-locator.html). demos/ itself stays the working/source folder
# in git — including demos/data/, demos/assets/, and demos/shared/, all
# referenced by relative path from the demo pages, so everything also
# resolves correctly when testing straight out of demos/ directly, without
# running this script. This script's output (_build/) is a disposable
# preview, not committed.
#
# Usage: scripts/flatten-demos.sh
# Then:  cd _build && python3 -m http.server 8000

set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _build
mkdir -p _build

# Flatten every demo page to the root of _build/
find demos -maxdepth 1 -type f -exec cp {} _build/ \;

# Companion subfolders inside demos/ (data/, assets/, shared/ — all
# referenced by relative path from the demo pages) also need to land at
# the flattened root, alongside the pages themselves.
find demos -maxdepth 1 -type d \( -name data -o -name assets -o -name shared \) -exec cp -R {} _build/ \;

echo "Built _build/ — $(find _build -maxdepth 1 -name '*.html' | wc -l | tr -d ' ') demo pages flattened to root."
echo "Test with: cd _build && python3 -m http.server 8000"
