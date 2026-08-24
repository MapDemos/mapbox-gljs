# Demo cleanup review

Run `bundle exec jekyll serve` (or `jekyll serve`) first so the `localhost:4000` links below actually load. Check off each as you confirm keep/cut; note a decision next to anything you want to flag.

## Flagged for review first

Confirm/decide on these before going through everything else — they're either broken, possibly duplicate, or possibly stale.

**Broken right now (placeholder token, cross-linked pair):**
- [ ] [Submit Feedback - Mapbox Feedback API](http://localhost:4000/feedback-submit.html) — `feedback-submit.html`
- [ ] [Mapbox Feedback API - Data Table View](http://localhost:4000/feedback-table.html) — `feedback-table.html`

**Depends on a token variable defined elsewhere — confirm it actually renders:**
- [ ] [Logistics Checkout Demo](http://localhost:4000/logistics-checkout.html) — `logistics-checkout.html`
- [ ] [API Compare Tool](http://localhost:4000/search-comparison.html) — `search-comparison.html`
- [ ] [Storytelling](http://localhost:4000/storytelling.html) — `storytelling.html`

**Possibly the same demo, listed twice:**
- [ ] [Optimization](https://demos.mapbox.com/japan-optimization-v2/) (external) vs. [Optimization V2](http://localhost:4000/optimization-v2.html) (local) — external URL literally says "v2"
- [ ] [CDG](http://localhost:4000/cdg.html) vs. [CDG MTS](http://localhost:4000/cdg-mts.html)
- [ ] [Ports](http://localhost:4000/ports.html) vs. [Ports Geojson](http://localhost:4000/ports-geojson.html)
- [ ] [Nowcast](https://codepen.io/kenji-shima/full/yLWpPRW) — listed **twice** in `external.yml`, identical URL both times
- [ ] [MPL](https://demos.mapbox.com/mpl/) (external) vs. [MPL 3D](http://localhost:4000/mpl-3d.html) (local) — probably distinct 2D/3D variants, confirm

**No title set in front matter (may be an abandoned duplicate):**
- [ ] [Wind (no title, check content)](http://localhost:4000/wind-demo.html) — `wind-demo.html`, vs. [Wind](http://localhost:4000/wind.html) — `wind.html`

## Everything else (local demos, alphabetical)

- [ ] [Airport Explorer Demo](http://localhost:4000/airport-demo.html)
- [ ] [Airport Layer Filter Demo](http://localhost:4000/airport-layer-filter-demo.html)
- [ ] [Japan Airports OSM Demo](http://localhost:4000/airport-osm-demo.html)
- [ ] [AMAP](http://localhost:4000/amap.html)
- [ ] [Autopilot Map - Lane-Level Navigation Data](http://localhost:4000/autopilot-map.html)
- [ ] [Building Heatmap](http://localhost:4000/building-heatmap.html)
- [ ] [SearchBox POI検索](http://localhost:4000/category-search-nested.html)
- [ ] [Cell Coverage Map](http://localhost:4000/cell-coverage.html)
- [ ] [Deliveries](http://localhost:4000/deliveries.html)
- [ ] [TV POI Details Search](http://localhost:4000/details-search.html)
- [ ] [DHL Capabilities Demo - Mapbox GL JS](http://localhost:4000/dhl-demo.html)
- [ ] [Directions Comparison - Mapbox vs Google](http://localhost:4000/directions-comparison.html)
- [ ] [Dynamic Style — Label Language](http://localhost:4000/dynamic-style.html)
- [ ] [Flight Map - SF to London (scrubber + chase camera)](http://localhost:4000/flight-map-demo.html)
- [ ] [3D Flight Route Demo - SF to London](http://localhost:4000/flight-route-demo.html)
- [ ] [Fuzzy Geocoding](http://localhost:4000/fuzzy-geocoding.html)
- [ ] [Gojek](http://localhost:4000/gojek.html)
- [ ] [Gojek MTS](http://localhost:4000/gojek-mts.html)
- [ ] [Google VS Mapbox](http://localhost:4000/google-mapbox.html)
- [ ] [GRIB2 Meshes](http://localhost:4000/grib2-meshes.html)
- [ ] [India Boundaries Coverage](http://localhost:4000/india-boundaries.html)
- [ ] [Indoor Airports - Brazil](http://localhost:4000/indoor-airport-brazil.html)
- [ ] [Indoor Airport Navigation](http://localhost:4000/indoor-airport-gps.html)
- [ ] [Indoor Airports - Search](http://localhost:4000/indoor-airports.html)
- [ ] [Indoor Map](http://localhost:4000/indoor.html)
- [ ] [Isochrone](http://localhost:4000/isochrone.html)
- [ ] [JWL Nowcast](http://localhost:4000/jwl-nowcast.html)
- [ ] [Language Selector — Map Labels](http://localhost:4000/language-selector.html)
- [ ] [抽選 (Lottery)](http://localhost:4000/lottery.html)
- [ ] [マップマッチングデモ (Map Matching Demo)](http://localhost:4000/map-matching-demo.html)
- [ ] [Mapbox AMAP](http://localhost:4000/mapbox-amap.html)
- [ ] [MCP Client](http://localhost:4000/mcp-client.html)
- [ ] [Merchants Tileset Overlay Demo](http://localhost:4000/merchants-overlay-demo.html)
- [ ] [Naurt Data Visualization](http://localhost:4000/naurt-data.html)
- [ ] [Navigation Trace Visualization](http://localhost:4000/navigation-trace-demo.html)
- [ ] [NEA](http://localhost:4000/nea.html)
- [ ] [NIED](http://localhost:4000/nied.html)
- [ ] [NOTAM Proximity Demo](http://localhost:4000/notam-demo.html)
- [ ] [Osaka Indoor](http://localhost:4000/osaka-indoor.html)
- [ ] [POI Map Builder - Mapbox GL JS](http://localhost:4000/poi-map-builder.html)
- [ ] [Precipitation Search](http://localhost:4000/precipitation-search.html)
- [ ] [Radar](http://localhost:4000/radar.html)
- [ ] [Random](http://localhost:4000/random-points.html)
- [ ] [Raster Compare](http://localhost:4000/raster-compare.html)
- [ ] [Return to Route Demo](http://localhost:4000/return-to-route.html)
- [ ] [Rivers](http://localhost:4000/rivers.html)
- [ ] [Sapporo Medical Facilities & Airport - Mapbox GL JS](http://localhost:4000/sapporo-pois.html)
- [ ] [Singapore Disaster Response](http://localhost:4000/singapore-disaster.html)
- [ ] [Static Tiles Demo](http://localhost:4000/static-tiles.html)
- [ ] [新店舗一覧 (Store List)](http://localhost:4000/store-list.html)
- [ ] [Store Location Comparison - Mapbox vs Google](http://localhost:4000/store-location-comparison.html)
- [ ] [Store Locator](http://localhost:4000/store-locator.html)
- [ ] [Streets Extruded](http://localhost:4000/streets-extruded.html)
- [ ] [Style Check Demo](http://localhost:4000/style-check-demo.html)
- [ ] [Tap Payment](http://localhost:4000/tap-payment.html)
- [ ] [Travel Highlights 2024](http://localhost:4000/travel-highlights-demo.html)
- [ ] [Turn-by-Turn Navigation Demo](http://localhost:4000/turn-by-turn-demo.html)
- [ ] [Various Meshes](http://localhost:4000/various-meshes.html)
- [ ] [Weather 3D](http://localhost:4000/weather3d.html)
- [ ] [Weather Walay](http://localhost:4000/weatherwalay.html)
- [ ] [Directions Comparison - OSM vs Zenrin](http://localhost:4000/zenrin-osm-comparison.html)

## External demos (hosted elsewhere — real URLs, not localhost)

- [ ] [Real Estate (JP)](https://demos.mapbox.com/japan-real-estate/)
- [ ] [Real Estate (EN)](https://demos.mapbox.com/japan-real-estate/?lng=en)
- [ ] [Tokyo Movement](https://demos.mapbox.com/tokyo-movement/)
- [ ] [Tokyo Weather](https://demos.mapbox.com/tokyo-weather/)
- [ ] [Tokyo News](https://demos.mapbox.com/tokyo-news/)
- [ ] [Calculate Area](https://demos.mapbox.com/japan-calculate-area/)
- [ ] [Search Japan](https://demos.mapbox.com/search-japan/)
- [ ] [Auto Search](https://demos.mapbox.com/auto-search/)
- [ ] [Japan Weather](https://codepen.io/kenji-shima/full/abedGJy)
- [ ] [Fleet](https://codepen.io/kenji-shima/full/MWxexpK)
- [ ] [Global Weather](https://codepen.io/kenji-shima/full/NWVwRQb)
- [ ] [Typhoon](https://codepen.io/kenji-shima/full/gOJOeNW)
- [ ] [Tokushima Movement](https://codepen.io/kenji-shima/full/LYvPedE)
- [ ] [Nearest vs Bilinear](https://codepen.io/kenji-shima/full/PoLLBzJ)
- [ ] [Dosha](https://codepen.io/kenji-shima/full/abMwVOj)
- [ ] [3D Route](https://codepen.io/kenji-shima/full/jOdRyMM)
- [ ] [Precipitation](https://codepen.io/kenji-shima/full/NWoWyGJ)
- [ ] [Static Images Boundaries](https://codepen.io/kenji-shima/full/KKbBQjQ)
- [ ] [Exclude from Directions](https://codepen.io/kenji-shima/full/dyggRXM)
- [ ] [Mapbox POIs to Google Codes](https://codepen.io/kenji-shima/full/eYPzLep)

**Not included above (meta links, not real demos):** "Demo List for Marketing" (points back at this same catalog) and "Codepen" (points at your public CodePen profile, not a specific demo).
