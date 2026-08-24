# Demo cleanup review

Run `bundle exec jekyll serve` (or `jekyll serve`) first so the `localhost:4000` links below actually load. Check off each as you confirm keep/cut; note a decision next to anything you want to flag.

## Flagged for review first

Confirm/decide on these before going through everything else — they're either broken, possibly duplicate, or possibly stale.

**Broken right now (placeholder token, cross-linked pair):**
- [x] [Submit Feedback - Mapbox Feedback API](http://localhost:4000/feedback-submit.html) — `feedback-submit.html` — **KEEP + FIXED** (map token was placeholder, now set to the standard kenji-shima token)
- [x] [Mapbox Feedback API - Data Table View](http://localhost:4000/feedback-table.html) — `feedback-table.html` — **KEEP + FIXED** (same fix)

**Depends on a token variable defined elsewhere — confirm it actually renders:**
- [x] [Logistics Checkout Demo](http://localhost:4000/logistics-checkout.html) — `logistics-checkout.html` — **CONFIRMED WORKING**: token comes from a shared `utils.js` loaded on the page
- [x] ~~API Compare Tool~~ — `search-comparison.html` — **REMOVED** (was gitignored, not git-revertible)
- [x] [Storytelling](http://localhost:4000/storytelling.html) — `storytelling.html` — **CONFIRMED WORKING**: token is hardcoded in `_includes/storytelling.js`

**Possibly the same demo, listed twice:**
- [x] ~~Optimization (external) vs. Optimization V2 (local)~~ — **RESOLVED**: local renamed to [Fixed Optimization](http://localhost:4000/fixed-optimization.html) (`fixed-optimization.html`)
- [x] ~~CDG vs. CDG MTS~~ — **BOTH REMOVED**
- [x] ~~Ports vs. Ports Geojson~~ — **RESOLVED**: renamed to [Cluster (MTS)](http://localhost:4000/cluster-mts.html) (`cluster-mts.html`) and [Cluster (GeoJSON)](http://localhost:4000/cluster-geojson.html) (`cluster-geojson.html`)
- [x] ~~Nowcast listed twice~~ — **RESOLVED** (duplicate entry removed, one kept)
- [x] ~~MPL (external) vs. MPL 3D (local)~~ — **RESOLVED: external MPL removed, MPL 3D kept**

**No title set in front matter (may be an abandoned duplicate):**
- [x] ~~Wind (no title) vs. Wind~~ — **RESOLVED: not a duplicate**, gave the untitled one a title. Both renamed for clarity: [Wind (JWL)](http://localhost:4000/wind-jwl.html) (`wind-jwl.html`) and [Wind Speed and Particles Demo](http://localhost:4000/wind-bom.html) (`wind-bom.html`)

## Everything else (local demos, alphabetical)

- [x] [Airport Explorer Demo](http://localhost:4000/airport-demo.html)
- [x] [Airport Layer Filter Demo](http://localhost:4000/airport-layer-filter-demo.html)
- [x] [Japan Airports OSM Demo](http://localhost:4000/airport-osm-demo.html)
- [x] [AMAP](http://localhost:4000/amap.html)
- [x] [Autopilot Map - Lane-Level Navigation Data](http://localhost:4000/autopilot-map.html)
- [x] [Building Heatmap](http://localhost:4000/building-heatmap.html)
- [x] [SearchBox POI検索](http://localhost:4000/category-search-nested.html)
- [x] [Cell Coverage Map](http://localhost:4000/cell-coverage.html)
- [x] [Deliveries](http://localhost:4000/deliveries.html)
- [x] [TV POI Details Search](http://localhost:4000/details-search.html)
- [x] [DHL Capabilities Demo - Mapbox GL JS](http://localhost:4000/dhl-demo.html)
- [x] [Directions Comparison - Mapbox vs Google](http://localhost:4000/directions-comparison.html)
- [x] [Dynamic Style — Label Language](http://localhost:4000/dynamic-style.html)
- [x] [Flight Map - SF to London (scrubber + chase camera)](http://localhost:4000/flight-map-demo.html)
- [x] ~~3D Flight Route Demo - SF to London~~ — **REMOVED**
- [x] [Fuzzy Geocoding](http://localhost:4000/fuzzy-geocoding.html)
- [x] ~~Gojek~~ — **REMOVED**
- [x] ~~Gojek MTS~~ — **REMOVED**
- [x] ~~Google VS Mapbox~~ — **REMOVED** (was gitignored, not git-revertible)
- [x] ~~GRIB2 Meshes~~ — **REMOVED**
- [x] [India Boundaries Coverage](http://localhost:4000/india-boundaries.html)
- [x] [Indoor Airports - Brazil](http://localhost:4000/indoor-airport-brazil.html)
- [x] [Indoor Airport Navigation](http://localhost:4000/indoor-airport-gps.html)
- [x] [Indoor Airports - Search](http://localhost:4000/indoor-airports.html)
- [x] [Indoor Map](http://localhost:4000/indoor.html)
- [x] ~~Isochrone~~ — **REMOVED**
- [x] [JWL Nowcast](http://localhost:4000/jwl-nowcast.html)
- [x] [Language Selector — Map Labels](http://localhost:4000/language-selector.html)
- [x] [抽選 (Lottery)](http://localhost:4000/lottery.html)
- [x] [マップマッチングデモ (Map Matching Demo)](http://localhost:4000/map-matching-demo.html)
- [x] [Mapbox AMAP](http://localhost:4000/mapbox-amap.html)
- [x] ~~MCP Client~~ — **REMOVED**
- [x] [Merchants Tileset Overlay Demo](http://localhost:4000/merchants-overlay-demo.html)
- [x] [Naurt Data Visualization](http://localhost:4000/naurt-data.html)
- [x] [Navigation Trace Visualization](http://localhost:4000/navigation-trace-demo.html)
- [x] [NEA](http://localhost:4000/nea.html)
- [x] ~~NIED~~ — **REMOVED**
- [x] [NOTAM Proximity Demo](http://localhost:4000/notam-demo.html)
- [x] [Osaka Indoor](http://localhost:4000/osaka-indoor.html)
- [x] [POI Map Builder - Mapbox GL JS](http://localhost:4000/poi-map-builder.html)
- [x] [Precipitation Search](http://localhost:4000/precipitation-search.html)
- [x] ~~Radar~~ — **REMOVED**
- [x] [Random](http://localhost:4000/random-points.html)
- [x] ~~Raster Compare~~ — **REMOVED**
- [x] [Return to Route Demo](http://localhost:4000/return-to-route.html)
- [x] [Rivers](http://localhost:4000/rivers.html)
- [x] [Sapporo Medical Facilities & Airport - Mapbox GL JS](http://localhost:4000/sapporo-pois.html)
- [x] [Singapore Disaster Response](http://localhost:4000/singapore-disaster.html)
- [x] [Static Tiles Demo](http://localhost:4000/static-tiles.html)
- [x] [新店舗一覧 (Store List)](http://localhost:4000/store-list.html)
- [x] [Store Location Comparison - Mapbox vs Google](http://localhost:4000/store-location-comparison.html)
- [x] [Store Locator](http://localhost:4000/store-locator.html)
- [x] [Streets Extruded](http://localhost:4000/streets-extruded.html)
- [x] [Style Check Demo](http://localhost:4000/style-check-demo.html)
- [x] [Tap Payment](http://localhost:4000/tap-payment.html)
- [x] [Travel Highlights 2024](http://localhost:4000/travel-highlights-demo.html)
- [x] [Turn-by-Turn Navigation Demo](http://localhost:4000/turn-by-turn-demo.html)
- [x] ~~Various Meshes~~ — **REMOVED**
- [x] [Weather 3D](http://localhost:4000/weather3d.html)
- [x] ~~Weather Walay~~ — **REMOVED**
- [x] [Directions Comparison - OSM vs Zenrin](http://localhost:4000/zenrin-osm-comparison.html)

## External demos (hosted elsewhere — real URLs, not localhost)

- [x] [Real Estate (JP)](https://demos.mapbox.com/japan-real-estate/)
- [x] [Real Estate (EN)](https://demos.mapbox.com/japan-real-estate/?lng=en)
- [x] [Tokyo Movement](https://demos.mapbox.com/tokyo-movement/)
- [x] [Tokyo Weather](https://demos.mapbox.com/tokyo-weather/)
- [x] [Tokyo News](https://demos.mapbox.com/tokyo-news/)
- [x] [Calculate Area](https://demos.mapbox.com/japan-calculate-area/)
- [x] [Search Japan](https://demos.mapbox.com/search-japan/)
- [x] [Auto Search](https://demos.mapbox.com/auto-search/)
- [x] ~~Japan Weather~~ — **REMOVED** from external.yml
- [x] [Fleet](https://codepen.io/kenji-shima/full/MWxexpK)
- [x] [Global Weather](https://codepen.io/kenji-shima/full/NWVwRQb)
- [x] [Typhoon](https://codepen.io/kenji-shima/full/gOJOeNW)
- [x] [Tokushima Movement](https://codepen.io/kenji-shima/full/LYvPedE)
- [x] [Nearest vs Bilinear](https://codepen.io/kenji-shima/full/PoLLBzJ)
- [x] [Dosha](https://codepen.io/kenji-shima/full/abMwVOj)
- [x] [3D Route](https://codepen.io/kenji-shima/full/jOdRyMM)
- [x] [Precipitation](https://codepen.io/kenji-shima/full/NWoWyGJ)
- [x] [Static Images Boundaries](https://codepen.io/kenji-shima/full/KKbBQjQ)
- [x] [Exclude from Directions](https://codepen.io/kenji-shima/full/dyggRXM)
- [x] [Mapbox POIs to Google Codes](https://codepen.io/kenji-shima/full/eYPzLep)

**Not included above (meta links, not real demos):** "Demo List for Marketing" (points back at this same catalog) and "Codepen" (points at your public CodePen profile, not a specific demo).
