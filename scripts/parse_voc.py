import re
import json
import os

source_path = os.path.expanduser("~/tmp/coupang-eats/JP_Mapbox_VOC_form_4.29.html")
dest_path = "data/voc_4.29.geojson"

def parse_html():
    if not os.path.exists(source_path):
        print(f"Source file not found: {source_path}")
        return

    with open(source_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the Detailed VOC Entries table
    # It's the second table in the document
    tables = re.findall(r'<table.*?>(.*?)</table>', html, re.DOTALL)
    if len(tables) < 2:
        print("VOC table not found")
        return

    table_content = tables[1]
    
    # Find all rows in tbody
    tbody_match = re.search(r'<tbody>(.*?)</tbody>', table_content, re.DOTALL)
    if not tbody_match:
        print("Tbody not found")
        return
    
    tbody_content = tbody_match.group(1)
    rows = re.findall(r'<tr>(.*?)</tr>', tbody_content, re.DOTALL)

    features = []

    for row in rows:
        # Extract columns
        cols = re.findall(r'<td.*?>(.*?)</td>', row, re.DOTALL)
        if len(cols) < 11:
            continue

        def clean(s):
            # Remove HTML tags and strip whitespace
            s = re.sub(r'<.*?>', '', s)
            # Unescape some common HTML entities
            s = s.replace('&nbsp;', ' ').replace('&mdash;', '—').replace('&middot;', '·').replace('&#x27A1;', '➡')
            return s.strip()

        row_id = clean(cols[0])
        date = clean(cols[1])
        ticket = clean(cols[2])
        order = clean(cols[3])
        rdp = clean(cols[4])
        voc_kr = clean(cols[5])
        voc_en = clean(cols[6])
        divedeep = clean(cols[7])
        coords_raw = cols[8].strip() # Keep raw for <br> splitting
        improve = clean(cols[9])
        checked_by = clean(cols[10])

        # Color logic
        if improve == 'O':
            color = "#276749"
        elif improve == 'X':
            color = "#c53030"
        else:
            color = "#718096"

        properties = {
            "id": row_id,
            "date": date,
            "ticket": ticket,
            "order": order,
            "rdp": rdp,
            "voc_kr": voc_kr,
            "voc_en": voc_en,
            "description": divedeep,
            "improve": improve,
            "checked_by": checked_by,
            "marker-color": color,
            "stroke": color,
            "stroke-width": 4
        }

        # Split multiple coordinates in Row 11 or similar
        # Split by <br>, <br/>, or \n
        coord_entries = re.split(r'<br\s*/?>|\n', coords_raw)
        
        for entry in coord_entries:
            # Clean and handle prefixes like "1) "
            text_entry = clean(entry)
            # Remove "1) ", "2) " etc
            text_entry = re.sub(r'^\d+\)\s*', '', text_entry)
            if not text_entry:
                continue

            # Check if it's a line or point
            if '~' in text_entry:
                # LineString
                parts = text_entry.split('~')
                coordinates = []
                for p in parts:
                    # Find all numbers (including decimals and signs)
                    lat_lon = re.findall(r'[-+]?\d*\.\d+|\d+', p)
                    if len(lat_lon) >= 2:
                        # [lon, lat]
                        coordinates.append([float(lat_lon[1]), float(lat_lon[0])])
                
                if len(coordinates) >= 2:
                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": coordinates
                        },
                        "properties": properties
                    })
            else:
                # Point
                lat_lon = re.findall(r'[-+]?\d*\.\d+|\d+', text_entry)
                if len(lat_lon) >= 2:
                    # [lon, lat]
                    features.append({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [float(lat_lon[1]), float(lat_lon[0])]
                        },
                        "properties": properties
                    })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    
    print(f"Generated {len(features)} features to {dest_path}")

if __name__ == "__main__":
    parse_html()
