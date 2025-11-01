// const GEOJSON_API_URL = "https://opendata.stadt-muenster.de/sites/default/files/Tausch-und-Spende-Angebote-in-Muenster2024.geojson";
const GEOJSON_LOCAL_PATH = "./geojson.json";
const MUENSTER_COORDS = [51.9607, 7.6261];

function setMap() {
  // Initialize the map object
  const map = L.map('map').setView(MUENSTER_COORDS, 13); // Zoom level 13 is good for a city view.
  // Add the OpenStreetMap tile layer (the actual map background)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  window.map = map;
}

function setLocations(url, map) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Add the GeoJSON data to the map
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng);
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.Titel) {
            layer.bindPopup(
              `<b>${feature.properties.Titel}</b><br>` +
              `Kategorien: ${feature.properties.Kategorien || 'N/A'}<br>` +
              `Adresse: ${feature.properties.Adresse}`
            );
          }
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('There was a problem fetching the GeoJSON data:', error);
    });
}
function init() {
  setMap();
  setLocations(GEOJSON_LOCAL_PATH, window.map);
}

window.addEventListener("DOMContentLoaded", init);