// const GEOJSON_API_URL = "https://opendata.stadt-muenster.de/sites/default/files/Tausch-und-Spende-Angebote-in-Muenster2024.geojson";
const GEOJSON_LOCAL_PATH = "./geojson.json";
const MUENSTER_COORDS = [51.9607, 7.6261];

async function setMap() {
  const map = L.map('map', { zoomControl: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state === 'granted') {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      const coords = [pos.coords.latitude, pos.coords.longitude];
      map.setView(coords, 15);
      const locationIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="location-circle"><div class="location-dot"></div></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker(coords, { icon: locationIcon }).addTo(map).bindPopup('Your location');
      window.userLocationMarker = marker;
    } else {
      map.setView(MUENSTER_COORDS, 13);
    }
  } catch (e) {
    map.setView(MUENSTER_COORDS, 13);
  }

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
async function init() {
  await setMap();
  setLocations(GEOJSON_LOCAL_PATH, window.map);
}

window.addEventListener("DOMContentLoaded", init);