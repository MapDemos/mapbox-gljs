# Naurt NZ (rckn) vs Mapbox Geocoding — Evaluation

## Overview

This evaluation compares Naurt's address data for New Zealand against Mapbox Geocoding V6 using reverse geocoding.

For each Naurt address, the coordinate (longitude/latitude) was submitted to the Mapbox reverse geocoding API. The returned address was then compared component-by-component against the Naurt source data.

**Dataset:** `dv0.6.1_fv2_naurt_rckn.csv`  
**Records tested:** 4,000 addresses, 4,000 door points  
**API:** Mapbox Geocoding V6 — reverse geocode (`/search/geocode/v6/reverse`), language `en`, type `address`

---

## Column Reference

| Column | Description |
|--------|-------------|
| `longitude` / `latitude` | Coordinates from the Naurt GeoJSON used for reverse geocoding |
| `geojson_address` | Human-readable address from Naurt fields: `{number} {street}, {locality}, {city}, {country}` |
| `geojson_normalized` | Naurt address after normalization (see below) |
| `mapbox_address` | Raw `full_address` returned by Mapbox for that coordinate |
| `mapbox_normalized` | Mapbox address after the same normalization |
| `mapbox_feature_type` | Feature type returned by Mapbox — typically `address`; may be `street` or `place` if no address-level result was found |
| `num_match` | `1` if the street number matches — handles Mapbox ranges (e.g. `77-81` contains `81`) and lettered units |
| `street_match` | `1` if normalized street names match (e.g. `Mokoia Rd` = `Mokoia Road` after abbreviation expansion) |
| `locality_match` | `1` if the suburb/locality names match |
| `city_match` | `1` if the city names match |
| `match` | `1` if **street + locality + city all match** — the overall verdict |

### Normalization

Both Naurt and Mapbox addresses are normalized before comparison:

- Lowercase
- Commas and periods removed
- 4-digit postal codes removed
- Road type abbreviations expanded to full form (`Rd` → `road`, `St` → `street`, `Ave` → `avenue`, etc.)
- Excess whitespace collapsed

Street number (`num_match`) is excluded from the overall `match` verdict because Mapbox commonly returns a building range (e.g. `77-81`) rather than the individual unit number that Naurt records.

---

## Results

### Addresses (`naurt_addresses-nz.geojson`)

4,000 address-centroid coordinates (Point geometry).

| Metric | Count | Rate |
|--------|------:|-----:|
| No Mapbox result | 15 | 0.4% |
| Street number match (`num_match`) | 3,423 | 85.6% |
| Street name match (`street_match`) | 3,555 | 88.9% |
| Locality match (`locality_match`) | 2,918 | 73.0% |
| City match (`city_match`) | 3,661 | 91.5% |
| Street number + Street name + City match | 2,907 | **72.7%** |
| **Overall match** (`match`) | **2,533** | **63.3%** |

### Doors (`naurt_doors-nz.geojson`)

4,000 door-level coordinates (MultiPoint geometry — entrance points).

| Metric | Count | Rate |
|--------|------:|-----:|
| No Mapbox result | 21 | 0.5% |
| Street number match (`num_match`) | 3,115 | 77.9% |
| Street name match (`street_match`) | 3,458 | 86.5% |
| Locality match (`locality_match`) | 2,915 | 72.9% |
| City match (`city_match`) | 3,655 | 91.4% |
| Street number + Street name + City match | 2,636 | **65.9%** |
| **Overall match** (`match`) | **2,470** | **61.8%** |

---

## Key Observations

- **Street name agreement is high** (~87–89%) across both datasets, indicating that Naurt and Mapbox agree on the road in the vast majority of cases.
- **City agreement is also high** (~91%), reflecting consistent top-level geography.
- **Locality is the primary failure point** (~73%), pulling the overall match rate down to ~62–63%. This is expected: suburb/locality boundaries differ between data providers, and Mapbox may return a different neighbourhood name for the same coordinate. Excluding locality and comparing only street number + street name + city raises the match rate to **72.7% (addresses)** and **65.9% (doors)**.
- **Locality mismatches are often structural, not factual** — in rural and small-town NZ, the locality and city are frequently the same place (e.g. Taupaki/Taupaki). Mapbox does not return a separate locality for these coordinates, causing a mismatch even though the address is correct.
- **Door points perform slightly worse** than address centroids across all metrics. Entrance coordinates can fall on or near a boundary between localities or streets, making reverse geocoding slightly less stable.
- **No-result rate is negligible** (<0.5%), confirming Mapbox has strong address coverage across the NZ dataset.
