const account = 'n2xNzqos7NirxGBJ'
const results_per_page = 5
const shop_details_url = `https://www.j-jti.com/appif/sight?appid=${account}&pagecount=${results_per_page}&responsetype=json`

const shop_categories = {
    eat: {
        label: "食べる",
        lgenre: "3",
        icon: "fas fa-utensils", // Icon for food/restaurants
        color:'bg-orange-400'
    },
    buy: {
        label: "買う",
        lgenre: "6",
        icon: "fas fa-shopping-bag", // Icon for shopping/stores
        color:'bg-green-400'
    },
    enjoy: {
        label: "遊ぶ",
        lgenre: "2",
        icon: "fas fa-ticket-alt", // Icon for attractions/entertainment
        color:'bg-blue-400'
    },
    see: {
        label: "見る",
        lgenre: "1",
        icon: "fas fa-landmark", // Icon for sightseeing/landmarks
        color:'bg-purple-400'
    },
}

function getIconAndColorForGenre(lgenre) {
    for (let key in shop_categories) {
        if (shop_categories[key].lgenre === lgenre) {
            return {
                icon: shop_categories[key].icon,
                color: shop_categories[key].color,
                categorylabel: shop_categories[key].label
            };
        }
    }
    return null;
}

async function fetchJisList() {
    try {
        const response = await fetch('https://kenji-shima.github.io/resource-files/jis.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching JIS code data:', error);
        return [];
    }
}

async function getJis(address) {
    const jisList = await fetchJisList();
    for (let elem of jisList) {
        if (elem.city === "") {
            continue
        }
        const prefCity = elem.prefecture + elem.city
        if (address.includes(prefCity)) {
            code = elem.code.substring(0, 5)
            if (code.endsWith("0")) {
                continue
            } else {
                return code
            }
        }
    }
    return code
}

const getAllGenrePOIs = async (address) => {
    const jis = await getJis(address);
    if (jis === "") {
        console.log("JIS code not found for address:", address);
        return { "type": "FeatureCollection", "features": [] };
    }
    
    // Create a promise for each category fetch
    const promises = Object.keys(shop_categories).map(categoryid => {
        return getShopPOIsFirstPage(categoryid, jis);
    });

    // Wait for all fetches to complete
    const results = await Promise.all(promises);

    // Combine the features from all the results into a single array
    const allFeatures = results.flatMap(featureCollection => featureCollection.features);

    return {
        "type": "FeatureCollection",
        "features": allFeatures
    };
}

/**
 * Fetches only the first page of POIs for a specific category and JIS code.
 * This is a non-recursive version for simpler, single-page fetches.
 * @param {string} categoryid - The category key (e.g., 'eat', 'buy').
 * @param {string} jis - The 5-digit JIS code.
 * @returns {Promise<object>} A promise that resolves to a GeoJSON FeatureCollection.
 */
async function getShopPOIsFirstPage(categoryid, jis) {
    const lgenre = shop_categories[categoryid].lgenre;
    const pageno = 1; // Always fetch the first page

    // Fetch the data from the API
    const json = await shopSearch(jis, lgenre, pageno);

    // Convert the API response into a GeoJSON FeatureCollection
    const featureCollection = convertShopResponseToFeatures(json);
    console.log(`Fetched ${featureCollection.features.length} features for category ${categoryid} and JIS ${jis}`);

    return featureCollection;
}

function setShopPOIs(categoryid, jis, featureCollection) {
    return new Promise((resolve) => {
        let pageno = 1;
        recursiveShopSearch(jis, shop_categories[categoryid].lgenre, pageno, featureCollection, resolve);
    });
}

function recursiveShopSearch(jis, lgenre, pageno, featureCollection, resolve) {
    shopSearch(jis, lgenre, pageno).then(json => {
        const newFeatures = convertShopResponseToFeatures(json).features;
        if (newFeatures) {
            // Correctly assign the new concatenated array
            featureCollection.features = featureCollection.features.concat(newFeatures);
        }

        if (json[0].PageNo < json[0].TotalPages) {
            // Pass all required arguments in the recursive call
            recursiveShopSearch(jis, lgenre, pageno + 1, featureCollection, resolve);
        } else {
            // When the last page for this category is processed, resolve the promise.
            resolve();
        }
    });
}

const shopImageUri = 'https://www.j-jti.com/Storage/Image/Product/SightImage/M/'
function convertShopResponseToFeatures(json) {
    let data = json[0].SightList
    let featureCollection = {
        "type": "FeatureCollection",
        "features": []
    }
    if (!data) return featureCollection
    featureCollection = {
        "type": "FeatureCollection",
        "features": data.filter((item) => item.PhotoList).map((item) => {

            const properties = {
                "item_id": item.SightID,
                "name": item.Title,
                "kana": item.Kana,
                "address": item.Address,
                "summary": item.Summary,
                "time": item.Time,
                "rank": item.Rank,
                "tel": item.Tel,
                "price": item.Price,
                "lgenre": item.GenreList[0].LGenre.Code,
                "photo": item.PhotoList ? shopImageUri + item.PhotoList[0].URL : null,
                "photos": null
            }

            if (item.PhotoList && item.PhotoList.length > 0) {
                properties.photos = item.PhotoList.map((photo, index) => ({
                    [`photo${index + 1}`]: `${shopImageUri}${photo.URL}`,
                }));
            }

            return {
                "type": "Feature",
                "properties": properties,
                "geometry": {
                    "type": "Point",
                    "coordinates": [Number(item.LongitudeW10), Number(item.LatitudeW10)]
                }
            }
        })
    }
    return featureCollection
}

let jis_list = ['13113', '13103', '13109']

async function shopSearch(jis, lgenre, pageno) {
    const query = await fetch(`${shop_details_url}&jis=${jis}&lgenre=${lgenre}&pageno=${pageno}`)
    return await query.json()
}