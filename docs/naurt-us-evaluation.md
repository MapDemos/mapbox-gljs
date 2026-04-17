# Naurt US (drt6) vs Mapbox Geocoding — Evaluation

## Overview

This evaluation compares Naurt's address data for the United States (northeastern Massachusetts) against Mapbox Geocoding V6 using reverse geocoding.

For each Naurt address, the coordinate (longitude/latitude) was submitted to the Mapbox reverse geocoding API. The returned address was then compared component-by-component against the Naurt source data.

**Dataset:** `dv0.6.1_fv2_naurt_drt6.csv`  
**Records tested:** 4,000 addresses, 4,000 door points  
**API:** Mapbox Geocoding V6 — reverse geocode (`/search/geocode/v6/reverse`), language `en`, type `address`

---

## Column Reference

| Column | Description |
|--------|-------------|
| `longitude` / `latitude` | Coordinates from the Naurt GeoJSON used for reverse geocoding |
| `geojson_address` | Human-readable address from Naurt fields: `{number} {street}, {city}, {state}, {country}` |
| `geojson_normalized` | Naurt address after normalization (see below) |
| `mapbox_address` | Raw `full_address` returned by Mapbox for that coordinate |
| `mapbox_normalized` | Mapbox address after the same normalization |
| `mapbox_feature_type` | Feature type returned by Mapbox — typically `address`; may be `street` or `place` if no address-level result was found |
| `num_match` | `1` if the street number matches — handles Mapbox ranges (e.g. `77-81` contains `81`) and lettered units |
| `street_match` | `1` if normalized street names match (e.g. `Wells Dr` = `Wells Drive` after abbreviation expansion) |
| `locality_match` | `1` if the suburb/locality names match |
| `city_match` | `1` if the city names match |
| `match` | `1` if **street + locality + city all match** — the overall verdict |

### Normalization

Both Naurt and Mapbox addresses are normalized before comparison:

- Lowercase
- "Town of / City of / Township of" administrative suffixes removed (e.g. `Tewksbury, Town Of` → `Tewksbury`)
- Commas and periods removed
- 5-digit and ZIP+4 postal codes removed
- Road type abbreviations expanded to full form (`Dr` → `drive`, `St` → `street`, `Ave` → `avenue`, `Blvd` → `boulevard`, `Pkwy` → `parkway`, etc.)
- Excess whitespace collapsed

Street number (`num_match`) is excluded from the overall `match` verdict because Mapbox commonly returns a building range rather than the individual unit number that Naurt records.

---

## Results

### Addresses (`naurt_addresses-us.geojson`)

4,000 address-centroid coordinates (Point geometry).

| Metric | Count | Rate |
|--------|------:|-----:|
| No Mapbox result | 2 | 0.1% |
| Street number match (`num_match`) | 3,132 | 78.3% |
| Street name match (`street_match`) | 3,657 | 91.4% |
| Locality match (`locality_match`) | 3,995 | 99.9% |
| City match (`city_match`) | 3,919 | 98.0% |
| Street number + Street name + City match | 2,897 | **72.4%** |
| **Overall match** (`match`) | **3,584** | **89.6%** |

### Doors (`naurt_doors-us.geojson`)

4,000 door-level coordinates (MultiPoint geometry — entrance points).

| Metric | Count | Rate |
|--------|------:|-----:|
| No Mapbox result | 5 | 0.1% |
| Street number match (`num_match`) | 2,999 | 75.0% |
| Street name match (`street_match`) | 3,627 | 90.7% |
| Locality match (`locality_match`) | 3,992 | 99.8% |
| City match (`city_match`) | 3,912 | 97.8% |
| Street number + Street name + City match | 2,771 | **69.3%** |
| **Overall match** (`match`) | **3,551** | **88.8%** |

---

## Key Observations

- **Overall match rate is high** (~89-90%), significantly better than the NZ dataset (~62-63%). The US data and Mapbox share consistent street naming conventions, leading to strong agreement.
- **Locality is not a differentiator here.** The US dataset carries no locality (suburb) field — all Naurt locality values are empty. Mapbox also rarely returns a separate locality for US addresses, so both sides compare as empty strings, yielding a near-perfect match rate (99.9%). The 3–5 mismatches occur where Mapbox unexpectedly returns a locality value for the coordinate.
- **City agreement is very high** (~98%). The primary failure cases are sub-locality splits — for example, Mapbox returns "North Billerica" for coordinates that Naurt labels as "Billerica, Town Of". These are valid addresses in the same municipality using finer-grained place names. One could check whether one city name is a suffix of the other to normalise these, but this risks false positives and would obscure a genuine coverage difference.
- **Street name agreement is strong** (~91%), with failures driven by:
  - **Abbreviation gaps** — `Mt` is not expanded to `Mount` in the normalizer, causing mismatches like `Mt Vernon St` vs `Mount Vernon Street`. Adding `mt → mount` to the abbreviation dictionary would recover these.
  - **Street type disagreement** — Naurt and Mapbox occasionally classify the same road differently (e.g. Naurt `Keneson Street`, Mapbox `Keneson Road`). This is a genuine data difference, not a formatting issue, and cannot be resolved by normalization without masking real mismatches.
  - **Complete mismatches** — a small number of coordinates snap to a different street entirely in Mapbox.
- **Street number match is the lowest metric** (~78% addresses, ~75% doors). Mapbox commonly returns an interpolated range rather than the exact parcel number Naurt records. Excluding street number raises the match rate to ~90%. Of the 3,132 records where the street number does match, 235 still fail the combined `Num + Street + City` metric — almost entirely due to the `Mt`/`Mount` abbreviation gap and `St`/`Road` type disagreements described above.
- **Door points perform slightly worse** than address centroids across all metrics. Entrance coordinates can fall nearer to a street boundary, making reverse geocoding slightly less stable.
- **No-result rate is negligible** (<0.2%), confirming Mapbox has excellent address coverage across this northeastern Massachusetts dataset.
