let radioStations = [];
let cities = [];
const markers = [];

fetch("/data/klove_Air_Bott_stations_nationwide.csv")
    .then(res => res.text())
    .then(csvText => {
        const parsed = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: h =>
            h.trim().toLowerCase()
});

        radioStations = parsed.data;

        initMap();
        console.log(parsed.meta);
        console.log(parsed.data[0]);

    });

console.log(radioStations);

const stateColors = {
    'AL':'#e74c3c','AK':'#e67e22','AZ':'#f1c40f','AR':'#2ecc71','CA':'#1abc9c',
    'CO':'#3498db','CT':'#9b59b6','DE':'#e91e63','FL':'#ff5722','GA':'#795548',
    'HI':'#607d8b','ID':'#f44336','IL':'#ff9800','IN':'#ffeb3b','IA':'#8bc34a',
    'KS':'#4caf50','KY':'#009688','LA':'#00bcd4','ME':'#2196f3','MD':'#3f51b5',
    'MA':'#673ab7','MI':'#9c27b0','MN':'#e040fb','MS':'#f06292','MO':'#ff8a65',
    'MT':'#a1887f','NE':'#90a4ae','NV':'#26c6da','NH':'#66bb6a','NJ':'#d4e157',
    'NM':'#ffa726','NY':'#ef5350','NC':'#42a5f5','ND':'#ab47bc','OH':'#26a69a',
    'OK':'#ec407a','OR':'#7e57c2','PA':'#29b6f6','RI':'#9ccc65','SC':'#ffca28',
    'SD':'#8d6e63','TN':'#78909c','TX':'#ff7043','UT':'#26c6da','VT':'#aed581',
    'VA':'#4db6ac','WA':'#64b5f6','WV':'#ce93d8','WI':'#f48fb1','WY':'#bcaaa4',
    'PR':'#80cbc4','DC':'#ffe082'
};

function createColoredIcon(color) {
    return L.divIcon({
        className: '',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
            <path fill="${color}" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.596 19.404 0 12.5 0z"/>
            <circle fill="white" cx="12.5" cy="12.5" r="5"/>
        </svg>`,
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
        popupAnchor: [0, -41]
    });
}

function getFCCRadius(callsign) {
    const fccUrl = `https://transition.fcc.gov/fcc-bin/fmq?call=${callsign}&arn=&city=&state=0&freq=0&fre2=0&type=0&facid=&class=0&docket=&ser=0&json=1`;
    const proxy = `https://corsproxy.io/?` + encodeURIComponent(fccUrl);

    return fetch(proxy)
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            const station = data && data.results && data.results[0];

            if (station) {
                const erpKw = parseFloat(station.erp);

                if (!isNaN(erpKw) && erpKw > 0) {
                    const erpWatts = erpKw * 1000;
                    const radiusKm = 10 * Math.cbrt(erpWatts);
                    return radiusKm * 1000;
                }
            }

            return 50000;
        })
        .catch(function() {
            return 50000;
        });
}

function getMarkerShape(station) {
  const network = (station.network || "klove").toLowerCase();

  if (network.includes("klove") || network.includes("k-love")) {
    return "pin";
  } else if (network.includes("airone")) {
    return "circle";
  } else if (network.includes("bott")) {
    return "square";
  } else {
    return "diamond";
  }
}

function createShapeIcon(color, shape) {
  let svgShape = "";

  if (shape === "circle") {
    svgShape = `<circle cx="12.5" cy="12.5" r="10" fill="${color}" />`;
  } else if (shape === "square") {
    svgShape = `<rect x="4" y="4" width="17" height="17" fill="${color}" />`;
  } else if (shape === "diamond") {
    svgShape = `<polygon points="12.5,2 23,12.5 12.5,23 2,12.5" fill="${color}" />`;
  } else {
    svgShape = `<path fill="${color}" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.596 19.404 0 12.5 0z"/>`;
  }

  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      ${svgShape}
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41]
  });
}

function initMap(){

const map = L.map("map").setView([39.8, -98.5], 4);

setTimeout(function() {
    map.invalidateSize();
}, 100);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
}).addTo(map);

const stationSelect = document.querySelector("#stationSearch");
const citySearch = document.querySelector("#citysearch");
const networkFilter = document.querySelector("#networkFilter");
const cityList = document.querySelector("#cityList");
const networkTagsContainer = document.querySelector("#networkTags");
const selected = {};

const activeNetworks = new Set();

function addNetworkTag(networkName) {
    if (activeNetworks.has(networkName)) {
        return;
    }

    activeNetworks.add(networkName);

    const tag = document.createElement("div");
    tag.classList.add("network-tag");
    tag.setAttribute("data-network", networkName);

    const label = document.createElement("span");
    label.textContent = networkName;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", function() {
        removeNetworkTag(networkName);
    });

    tag.appendChild(label);
    tag.appendChild(removeBtn);
    networkTagsContainer.appendChild(tag);
}

function removeNetworkTag(networkName) {
    activeNetworks.delete(networkName);

    const tag = networkTagsContainer.querySelector("[data-network='" + networkName + "']");
    if (tag) {
        networkTagsContainer.removeChild(tag);
    }

    networkFilter.value = "";

    filterMarkers();
}

function clearAllNetworkTags() {
    activeNetworks.clear();
    networkTagsContainer.innerHTML = "";
}

radioStations.forEach(function(station) {
    const color = stateColors[station.state] || '#95a5a6';
    const shape = getMarkerShape(station);
    const marker = L.marker([station.lat, station.lng], { icon: createShapeIcon(color, shape) });

    marker.bindPopup(
        `<strong>${station.network}</strong><br>
        <strong>${station.name}</strong><br>
         Frequency: ${station.frequency}<br>
         City: ${station.city}<br>
         State: ${station.state}`
    );

    marker.on("click", function() {
        if (selected[station.name]) {
            map.removeLayer(selected[station.name].circle);
            delete selected[station.name];

        } else {
            map.flyTo([station.lat, station.lng], 7, { animate: true, duration: 1.5 });

            getFCCRadius(station.name).then(function(radiusMeters) {

                const circle = L.circle([station.lat, station.lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.2,
                    radius: radiusMeters
                }).addTo(map);

                selected[station.name] = { circle: circle };
            });
        }
    });

    markers.push({
        network: station.network,
        station: station.name,
        state: station.state,
        city: station.city,
        type: station.type,
        marker: marker
    });
});

const cities = [...new Set(radioStations.map(station => station.city))];
cities.forEach(function(city) {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityList.appendChild(option);
});

radioStations.forEach(function(station) {
    const option = document.createElement("option");
    option.value = station.name;
    option.textContent = station.name;
    stationSelect.appendChild(option);
});

const networks = [...new Set(radioStations.map(station => station.network))];
networks.forEach(function(network) {
    const option = document.createElement("option");
    option.value = network;
    option.textContent = network;
    networkFilter.appendChild(option);
});

function filterMarkers() {
    const selectedStation = stationSelect.value;
    const selectedCity = citySearch.value;

    markers.forEach(function(item) {
        map.removeLayer(item.marker);

        const hasFilter =
            selectedStation !== "" ||
            selectedCity !== "" ||
            activeNetworks.size > 0;

        if (!hasFilter) {
            return;
        }

        const matchStation =
           selectedStation === "" ||
           item.station.toLowerCase().includes(selectedStation.toLowerCase());

        const matchCity =
            selectedCity === "" ||
            item.city.toLowerCase().includes(selectedCity.toLowerCase());

        const matchNetwork =
            activeNetworks.size === 0 ||
            activeNetworks.has(item.network);

        if (matchStation && matchCity && matchNetwork) {
            item.marker.addTo(map);
        }
    });
}

document.querySelector("#reset").addEventListener("click", function() {
    stationSelect.value = "";
    citySearch.value = "";
    networkFilter.value = "";

    clearAllNetworkTags();
    filterMarkers();

    stationSuggestions.classList.remove("open");
    citySuggestions.classList.remove("open");

    Object.values(selected).forEach(function(item) {
        map.removeLayer(item.circle);
    });

    for (const key in selected) {
        delete selected[key];
    }

    map.flyTo([39.8, -98.5], 4, { animate: true, duration: 1.5 });
});

const stationInput = document.querySelector("#stationSearch");
const stationSuggestions = document.querySelector("#stationSuggestions");
const citySuggestions = document.querySelector("#citySuggestions");

const allStationNames = [...new Set(radioStations.map(s => s.name))];
const allCityNames = [...new Set(radioStations.map(s => s.city))];

function showSuggestions(inputEl, suggestionsEl, allItems) {
    const typed = inputEl.value.toLowerCase().trim();

    suggestionsEl.innerHTML = "";

    if (typed === "") {
        suggestionsEl.classList.remove("open");
        return;
    }

    const matches = allItems.filter(function(item) {
        return item.toLowerCase().includes(typed);
    }).slice(0, 5);

    if (matches.length === 0) {
        suggestionsEl.classList.remove("open");
        return;
    }

    matches.forEach(function(match) {
        const item = document.createElement("div");
        item.textContent = match;
        item.addEventListener("mousedown", function() {
            inputEl.value = match;
            suggestionsEl.classList.remove("open");
            filterMarkers();
        });
        suggestionsEl.appendChild(item);
    });

    suggestionsEl.classList.add("open");
}

stationInput.addEventListener("input", function() {
    showSuggestions(stationInput, stationSuggestions, allStationNames);
    filterMarkers();
});

stationInput.addEventListener("blur", function() {
    stationSuggestions.classList.remove("open");
});

citySearch.addEventListener("input", function() {
    showSuggestions(citySearch, citySuggestions, allCityNames);
    filterMarkers();
});

citySearch.addEventListener("blur", function() {
    citySuggestions.classList.remove("open");
});

stationSelect.addEventListener("input", filterMarkers);

networkFilter.addEventListener("change", function() {
    const chosen = networkFilter.value;

    if (chosen === "") {
        return;
    }

    if (chosen === "All") {
        networks.forEach(function(network) {
            addNetworkTag(network);
        });
        networkFilter.value = "";
        filterMarkers();
        return;
    }

    addNetworkTag(chosen);
    networkFilter.value = "";
    filterMarkers();
});

}