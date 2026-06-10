//https://leafletjs.com/examples/quick-start/

//link the leafletjs using the js code in documentation
const map = L.map("map").setView([39.8, -98.5], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
}).addTo(map);




const radioStations = [
  {
    name: "KLSW FM",
    state: "Washington",
    city: "Seattle",
    frequency: "104.5 FM",
    lat: 47.54,
    lng: -122.11,
    type: "music"
  },
  {
    name: "WPLJ FM",
    state: "New York",
    city: "New York",
    frequency: "95.5 FM",
    lat: 40.75,
    lng: -73.99,
    type: "news"
  },
  {
    name: "KKLQ FM",
    state: "California",
    city: "Los Angeles",
    frequency: "100.3 FM",
    lat: 34.23,
    lng: -118.07,
    type: "sports"
  },
  {
    name: "KLVH FM",
    state: "Texas",
    city: "Houston",
    frequency: "97.1 FM",
    lat: 30.54,
    lng: -95.02,
    type: "religious"
  },
  {
    name: "KNBQ FM",
    state: "Washington",
    city: "Olympia",
    frequency: "98.5 FM",
    lat: 46.98,
    lng: -123.14,
    type: "music"
  },
  {
    name: "KBLV FM",
    state: "California",
    city: "Bakersfield",
    frequency: "88.7 FM",
    lat: 35.45,
    lng: -118.59,
    type: "music"
  },
  {
    name: "KBLV FM",
    state: "California",
    city: "Bakersfield",
    frequency: "88.7 FM",
    lat: 35.45,
    lng: -118.59,
    type: "music"
  },
  {
    name: "KLVS FM",
    state: "California",
    city: "San Francisco",
    frequency: "107.3 FM",
    lat: 37.82,
    lng: -122.06,
    type: "news"
  },
  {
    name: "KYKV FM",
    state: "Washington",
    city: "Yakima",
    frequency: "103.1 FM",
    lat: 46.64,
    lng: -120.40,
    type: "sports"
  },
  {
    name: "WKVU FM",
    state: "New York",
    city: "Utica",
    frequency: "107.3 FM",
    lat: 43.14,
    lng: -75.17,
    type: "news"
  },
  {
    name: "WKVR FM",
    state: "Ohio",
    city: "Columbus",
    frequency: "102.5 FM",
    lat: 39.77,
    lng: -82.74,
    type: "sports"
  },
  {
    name: "WKLV FM",
    state: "Ohio",
    city: "Cleveland",
    frequency: "95.5 FM",
    lat: 41.44,
    lng: -81.49,
    type: "news"
  },
  {
    name: "KFMK FM",
    state: "Texas",
    city: "Austin",
    frequency: "105.9 FM",
    lat: 30.32,
    lng: -97.80,
    type: "music"
  }
];



const stationSelect = document.querySelector("#station");
const stateSelect = document.querySelector("#state");
const citySelect = document.querySelector("#location");

const markers = [];

// Create markers
radioStations.forEach(function(station) {
    const marker = L.marker([station.lat, station.lng]).addTo(map);

    marker.bindPopup(
        `Station: ${station.name}<br>
         Frequency: ${station.frequency}<br>
         City: ${station.city}<br>
         State: ${station.state}`
    );

    marker.on("click", function() {
    document.querySelector(".info-box").innerHTML = `
        <h3>${station.name}</h3>
        <p><strong>Frequency:</strong> ${station.frequency}</p>
        <p><strong>City:</strong> ${station.city}</p>
        <p><strong>State:</strong> ${station.state}</p>
    `;
});

    markers.push({
        station: station.name,
        state: station.state,
        city: station.city,
        type: station.type,
        marker: marker
    });
});


// State Dropdown
const states = [...new Set(radioStations.map(station => station.state))];
states.forEach(function(state) {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
});

// City Dropdown
const cities = [...new Set(radioStations.map(station => station.city))];
cities.forEach(function(city) {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
});

// Station dropdown
radioStations.forEach(function(station) {
    const option = document.createElement("option");
    option.value = station.name;
    option.textContent = station.name;
    stationSelect.appendChild(option);
});


// markers
function filterMarkers() {
    const selectedStation = stationSelect.value;
    const selectedState = stateSelect.value;
    const selectedCity = citySelect.value;

    markers.forEach(function(item) {
        map.removeLayer(item.marker);

        const matchStation =
            selectedStation === "All Stations" ||
            item.station === selectedStation;

        const matchState =
            selectedState === "All States" ||
            item.state === selectedState;

        const matchCity =
            selectedCity === "All Cities" ||
            item.city === selectedCity;

        if (matchStation && matchState && matchCity) {
            item.marker.addTo(map);
        }
    });
}


function updateDropdowns() {
    const selectedState = stateSelect.value;

    // Reset dropdowns
    stationSelect.innerHTML = '<option>All Stations</option>';
    citySelect.innerHTML = '<option>All Cities</option>';

    // Filter stations based on selected state
    let filteredStations = radioStations;

    if (selectedState !== "All States") {
        filteredStations = radioStations.filter(function(station) {
            return station.state === selectedState;
        });
    }

    // Add matching stations
    filteredStations.forEach(function(station) {
        const stationOption = document.createElement("option");
        stationOption.value = station.name;
        stationOption.textContent = station.name;
        stationSelect.appendChild(stationOption);
    });

    // Get matching cities
    const filteredCities = [
        ...new Set(filteredStations.map(station => station.city))
    ];

    // Add matching cities
    filteredCities.forEach(function(city) {
        const cityOption = document.createElement("option");
        cityOption.value = city;
        cityOption.textContent = city;
        citySelect.appendChild(cityOption);
    });
}





stateSelect.addEventListener("change", function() {
    updateDropdowns();
    filterMarkers();
});

stationSelect.addEventListener("change", filterMarkers);
citySelect.addEventListener("change", filterMarkers);



// Reset button
document.querySelector("#reset").addEventListener("click", function() {
    // Reset all dropdowns
    stationSelect.value = "All Stations";
    stateSelect.value = "All States";
    citySelect.value = "All Cities";

    // reset station and city menus
    updateDropdowns();

    // Show all markers again
    filterMarkers();

    // clear radio info box
    document.querySelector(".info-box").innerHTML =
        "Click a radio station marker to see details.";
});

//start info box with message
document.querySelector(".info-box").innerHTML =
        "Click a radio station marker to see details.";
        
// MARKET SEARCH (David's part)
const marketInput = document.getElementById("marketSearch");

marketInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  markers.forEach(function (item) {
    const match =
      item.type.toLowerCase().includes(searchValue);

    if (match) {
      item.marker.addTo(map);
    } else {
      map.removeLayer(item.marker);
    }
  });
});

