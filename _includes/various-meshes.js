
lat = 35.681236;
lng = 139.767125;
const stagingToken = 'pk.REDACTED-raster-team-TOKEN&jobid=cmd4qctla000002lbb81k4bkw';

function transformSourceUrl(url, isProduction = false) {
    if (!url) return url;
    const MAPBOX_IDENT = 'mapbox://';
    if (url.startsWith(MAPBOX_IDENT)) {
        const [account, tileset] = url.slice(MAPBOX_IDENT.length).split("/");
        const baseURL = isProduction ? 'https://api.mapbox.com' : 'https://api-tilesets-staging.tilestream.net';
        url = `${baseURL}/v4/${account}.${tileset}.json?access_token=${stagingToken}&secure`;
    }
    return url;
}

const tilesets = {
    n1d_z4: {
        value: transformSourceUrl(`mapbox://raster-team/jp_nowc_250m_1km_02`),
        label: "nowcast 250m 1km",
        type: 'raster-array'
    },
}
