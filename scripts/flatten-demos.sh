#!/bin/bash
# Builds a local preview of what the published site will look like once
# demos/ is the source of truth: flattens demos/*.html (and their companion
# data files) to the site root, alongside shared/ and assets/, so live URLs
# stay exactly what they are today (e.g. /store-locator.html, not
# /demos/store-locator.html). demos/ itself stays the working/source folder
# in git; this script's output (_build/) is a disposable preview, not
# committed.
#
# Usage: scripts/flatten-demos.sh
# Then:  cd _build && python3 -m http.server 8000

set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _build
mkdir -p _build

# Flatten every demo page to the root of _build/
find demos -maxdepth 1 -type f -exec cp {} _build/ \;

# Companion data files that live inside demos/ (geojson/json fetched by
# relative path) also need to land at the flattened root.
find demos -maxdepth 1 -type d -name data -exec cp -R {} _build/ \;

# Shared assets referenced by absolute path (/shared/..., relative
# assets/...) need to exist at the same root level.
cp -R shared _build/shared
cp -R assets _build/assets

echo "Built _build/ — $(find _build -maxdepth 1 -name '*.html' | wc -l | tr -d ' ') demo pages flattened to root."
echo "Test with: cd _build && python3 -m http.server 8000"
