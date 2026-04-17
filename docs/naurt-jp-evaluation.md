# Naurt Japan (xn75) vs Mapbox Geocoding — Evaluation

## Overview

This evaluation compares Naurt's address data for Japan against Mapbox Geocoding V6 using reverse geocoding.

For each Naurt address, the coordinate (longitude/latitude) was submitted to the Mapbox reverse geocoding API. The returned address was then normalized and compared as a full string against the Naurt source address.

**Dataset:** `dv0.6.2_fv2_naurt_xn75.csv`  
**Records tested:** 4,000 addresses, 4,000 door points  
**API:** Mapbox Geocoding V6 — reverse geocode (`/search/geocode/v6/reverse`), language `ja`, type `address`

---

## Column Reference

| Column | Description |
|--------|-------------|
| `longitude` / `latitude` | Coordinates from the Naurt GeoJSON used for reverse geocoding |
| `geojson_address` | Original Naurt address string, including `大字` prefix if present (e.g. `埼玉県川越市大字中福114-9`) |
| `geojson_address_formatted` | Naurt address with `大字`/`字` prefixes removed (e.g. `埼玉県川越市中福114-9`) |
| `mapbox_address` | Raw `full_address` returned by Mapbox for that coordinate (e.g. `日本, 〒350-1156 埼玉県川越市中福１１８番地３`) |
| `mapbox_address_formatted` | Mapbox address reformatted to match Naurt style — country/postal code prefix stripped, full-width numbers converted to half-width, `番地` replaced with `-` (e.g. `埼玉県川越市中福118-3`) |
| `mapbox_feature_type` | Feature type returned by Mapbox — typically `address`; occasionally `block` |
| `geojson_normalized` | Naurt formatted address after normalization (see below) |
| `mapbox_normalized` | Mapbox formatted address after the same normalization |
| `match` | `1` if `geojson_normalized` and `mapbox_normalized` are identical strings, otherwise `0` |

### Normalization

Both addresses are normalized before comparison:

- Full-width characters converted to half-width (NFKC normalization)
- `大字` / `字` prefixes removed from street names
- Spaces (full-width and half-width) removed
- Lowercased

Mapbox addresses additionally have:
- Country prefix (`日本`) and postal code (`〒xxx-xxxx`) stripped
- Prefecture extracted as the starting point
- `番地` replaced with `-`

---

## Results

### Addresses (`naurt_addresses_optimized.geojson`)

4,000 address-centroid coordinates (Point geometry).

| Metric | Count | Rate |
|--------|------:|-----:|
| No Mapbox result | 877 | 21.9% |
| Mapbox result returned | 3,123 | 78.1% |
| — of which `address` type | 3,118 | 99.8% |
| — of which `block` type | 5 | 0.2% |
| **Overall match** (`match`) | **11** | **0.3%** |
| Match rate (among records with a result) | 11 / 3,123 | **0.4%** |

### Doors (`naurt_doors_optimized.geojson`)

4,000 door-level coordinates (MultiPoint geometry — entrance points).

| Metric | Count | Rate |
|--------|------:|-----:|
| No Mapbox result | 882 | 22.1% |
| Mapbox result returned | 3,118 | 78.0% |
| — of which `address` type | 3,113 | 99.8% |
| — of which `block` type | 5 | 0.2% |
| **Overall match** (`match`) | **10** | **0.2%** |
| Match rate (among records with a result) | 10 / 3,118 | **0.3%** |

---

## Key Observations

- **High no-result rate (~22%):** Mapbox does not return an address for roughly 1 in 5 coordinates. This reflects gaps in Mapbox's address-level coverage for suburban and rural Japan, particularly for individual delivery points.
- **Very low match rate (~0.3%):** Even when Mapbox returns a result, the address number almost never matches Naurt's. This is structurally expected in Japan: Mapbox reverse geocodes to the nearest known address in its database, which is typically a different unit within the same block — not the specific delivery point that Naurt records.
- **Japan's addressing system compounds the problem:** Japanese addresses are block-based (chome-ban-go), not street-based. A single block may contain many individual delivery points with different numbers. Mapbox tends to return the representative address for the block rather than the precise delivery-point address.
- **Door points perform marginally worse** than address centroids, consistent with entrance coordinates being offset from the address point and therefore sometimes resolving to a different block in Mapbox's database.
- **Normalization alone is insufficient:** The low match rate is not a normalization artifact — the formatted addresses show clearly different lot numbers (e.g. Naurt `中福114-9` vs Mapbox `中福118-3`), indicating a genuine data difference rather than a formatting mismatch.
