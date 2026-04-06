// FPS Meter implementation
window.requestAnimationFrame ||
  (window.requestAnimationFrame = (() =>
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (e) {
      window.setTimeout(e, 1e3 / 60);
    })());

const getTime = () =>
  window.performance && window.performance.now
    ? window.performance.now()
    : +new Date();

class FPSMeter {
  constructor(e) {
    (this.ui = e.ui || !1),
      (this.fps = 0),
      (this.isRunning = !1),
      (this.defaultStyles =
        'z-index:999;position:fixed;bottom:30px;left:5px;padding:10px;font-weight:600;font-style:normal;font-size:12px;font-family:Consolas,Menlo,Monaco,"Lucida Console","Liberation Mono","DejaVu Sans Mono","Bitstream Vera Sans Mono","Courier New",Courier,monospace,sans-serif');
  }
  measure() {
    const e = getTime();
    window.requestAnimationFrame(() => {
      const t = Math.round((1 / (getTime() - e)) * 1e3);
      if (((this.fps = t), this.ui && this.element)) {
        let e = 4 - `${t}`.length,
          i = "";
        for (; e > 0; ) (i += " "), e--;
        switch (((this.text.nodeValue = `${t}${i}fps`), !1)) {
          case !(t < 7):
            (this.element.style.color = "#FFF"),
              (this.element.style.backgroundColor = "#FF4500");
            break;
          case !(t < 25):
            (this.element.style.color = "#FF4500"),
              (this.element.style.backgroundColor = "#000");
            break;
          case !(t < 40):
            (this.element.style.color = "orange"),
              (this.element.style.backgroundColor = "#000");
            break;
          case !(t > 70):
            (this.element.style.color = "#0f0"),
              (this.element.style.backgroundColor = "#000");
            break;
          default:
            (this.element.style.color = "#018801"),
              (this.element.style.backgroundColor = "#000");
        }
      }
      this.isRunning && this.measure();
    });
  }
  start() {
    this.isRunning ||
      ((this.isRunning = !0),
      !0 === this.ui &&
        ((this.text = document.createTextNode("")),
        (this.element = document.createElement("div")),
        (this.element.style = this.defaultStyles),
        this.element.appendChild(this.text),
        document.body.appendChild(this.element)),
      this.measure());
  }
  pause() {
    this.isRunning = !1;
  }
  resume() {
    this.isRunning || ((this.isRunning = !0), this.measure());
  }
  toggle() {
    this.isRunning ? this.pause() : this.resume();
  }
  stop() {
    this.isRunning &&
      ((this.isRunning = !1),
      !0 === this.ui && this.element && this.element.remove());
  }
}

// Configuration
const tileset = "mbxsolutions.ntt-hex";
let state = "IDLENOT";
const loader = document.getElementsByClassName("loading")[0];

// Initialize geocoder
// const geocoder = new MapboxGeocoder({
//   accessToken: mapboxgl.accessToken,
//   mapboxgl: mapboxgl,
//   countries: "JP",
//   marker: {
//     color: "#ebebeb",
//   },
//   flyTo: false,
// });

// Initialize map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mbxsolutions/cmnmsy5kw001v01rhaeol71pc",
  center: [134.366235, 35.010239],
  zoom: 4.28,
  minZoom: 4,
  maxZoom: 18,
});

// Compute time to load map
let mapboxstarttime = performance.now();
map.once("idle", function () {
  let mapboxendtime = performance.now();
  var mapboxtime = mapboxendtime - mapboxstarttime;
  info.style.display = "block";
  info.innerHTML = "描画時間： " + Math.floor(mapboxtime) + " ms";
});

// FPS counter
setTimeout(() => {
  const fps = new FPSMeter({ ui: true });
  fps.start();
  fps.element.addEventListener("click", fps.toggle.bind(fps), {
    passive: true,
    capture: false,
  });
}, 1000);

const marker = new mapboxgl.Marker({
  color: "#ebebeb",
});

function startLoading() {
  loader.style.display = "block";
}

function stopLoading() {
  loader.style.display = "none";
}

function openMarker(marker, d, place_name, markerCoords, jump) {
  if (d.features.length > 0) {
    const count = d.features[0].properties.count;
    let coverage = "";

    if (count < 10) {
      coverage = "標準的";
    } else if (count >= 10 && count < 100) {
      coverage = "良好";
    } else if (count >= 100) {
      coverage = "上品質";
    }

    marker.setPopup(
      new mapboxgl.Popup()
        .setHTML(
          `
          <span class="location">${place_name}</span>
          <span class="coverage">${coverage}</span>
          `
        )
        .addTo(map)
    );
  } else {
    marker.setPopup(
      new mapboxgl.Popup()
        .setHTML(
          `
          <span class="location">${place_name}</span>
          <span class="coverage">カバレッジなし</span>
          `
        )
        .addTo(map)
    );
  }

  if (jump) {
    map.jumpTo({
      center: markerCoords,
      zoom: 9,
    });
  }

  stopLoading();
}

// geocoder.on("result", async function (e) {
//   if (marker) marker.remove();

//   startLoading();

//   const lat = e.result.center[1];
//   const lon = e.result.center[0];

//   await fetch(
//     `https://api.mapbox.com/v4/${tileset}/tilequery/${lon},${lat}.json?access_token=${mapboxgl.accessToken}`
//   )
//     .then((d) => d.json())
//     .then((d) => {
//       openMarker(
//         geocoder.mapMarker,
//         d,
//         e.result.place_name,
//         e.result.center,
//         true
//       );
//     });
// });

// function updateLabelsToJapanese() {
//   const styleLayers = map.getStyle().layers;

//   // Iterate through style layers
//   styleLayers.forEach((layer) => {
//     if (layer.layout && layer.layout["text-field"]) {
//       map.setLayoutProperty(layer.id, "text-field", ["get", "name_ja"]);
//     }
//   });
// }

// map.on("load", function () {
//   // map.addControl(geocoder);
//   updateLabelsToJapanese();
// });

// Show legend at all zoom levels - moved to after createLegend

// map.on("zoom", function (e) {
//   const zoom = map.getZoom();

//   if (zoom >= 8 && state === "IDLENOT") {
//     document.getElementById("colorbar-container").style.display = "block";
//     setTimeout(() => {
//       document.getElementById("colorbar-container").style.opacity = 1;
//       state = "IDLESHOWING";
//     }, 0);
//     state = "TRANSITIONING";
//   } else if (zoom < 8 && state === "IDLESHOWING") {
//     document.getElementById("colorbar-container").style.opacity = 0;
//     setTimeout(() => {
//       document.getElementById("colorbar-container").style.display =
//         "none";
//       state = "IDLENOT";
//     }, 500);
//     state = "TRANSITIONING";
//   }
// });

// map.getCanvas().style.cursor = "pointer";

// map.on("click", async (e) => {
//   if (geocoder.mapMarker) geocoder.mapMarker.remove();

//   startLoading();

//   const lat = e.lngLat.lat;
//   const lon = e.lngLat.lng;

//   let placeName;
//   let tileQueryResponse;

//   const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxgl.accessToken}&language=ja`;

//   const geocode = fetch(url)
//     .then((d) => d.json())
//     .then((d) => {
//       placeName = d.features[0].place_name;
//     });

//   const tileQuery = fetch(
//     `https://api.mapbox.com/v4/${tileset}/tilequery/${lon},${lat}.json?access_token=${mapboxgl.accessToken}`
//   )
//     .then((d) => d.json())
//     .then((d) => {
//       tileQueryResponse = d;
//     });

//   await Promise.all([geocode, tileQuery]);

//   //set marker coordinates
//   if (marker) marker.remove();

//   marker.setLngLat([lon, lat]).addTo(map);

//   openMarker(marker, tileQueryResponse, placeName, [lon, lat], false);
// });

//create legend
function createLegend(id, values, colors, label) {
  const ratio = window.devicePixelRatio || 1;
  const canvas = document.getElementById(id);

  const ctx = canvas.getContext("2d");

  const width = 350;
  const margin = 25;

  const height = 55;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.scale(ratio, ratio);

  const cmin = values[0];
  const cmax = values[values.length - 1];
  const domain = cmax - cmin;

  const grad = ctx.createLinearGradient(margin, 0, width - 2 * margin, 0);

  for (let i = 0; i < values.length; i++) {
    grad.addColorStop((values[i] - cmin) / domain, colors[i]);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(margin, 0, width - 2 * margin, 30);
  ctx.textAlign = "center";

  ctx.strokeStyle = "black";
  ctx.lineJoin = "round";

  ctx.font = "14px Sans-serif";
  ctx.lineWidth = 2.0;
  ctx.strokeText("弱い", 42, 45);
  ctx.strokeText("強い", 310, 45);
  ctx.fillStyle = "white";
  ctx.fillText("弱い", 42, 45);
  ctx.fillText("強い", 310, 45);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.0;
  ctx.strokeRect(margin, 1, width - 2 * margin, 29);
}

const legendColors = ["#1a1a1a", "#ff007f"];

createLegend("colorbar", [1, 2], legendColors, "Coverage");

// Show legend at all zoom levels
document.getElementById("colorbar-container").style.display = "block";
document.getElementById("colorbar-container").style.opacity = 1;
