let radioStations = [];
let cities = [];
const markers = [];

fetch("/data/klove_stations.csv")
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

function initMap(){
    
const map = L.map("map").setView([39.8, -98.5], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
}).addTo(map);

const stationSelect = document.querySelector("#stationSearch");

const citySearch = document.querySelector("#citysearch");

const selected = {};

radioStations.forEach(function(station) {
    const color = stateColors[station.state] || '#95a5a6';
    const marker = L.marker([station.lat, station.lng], { icon: createColoredIcon(color) }).addTo(map);

    marker.bindPopup(
        `Station: ${station.name}<br>
         Frequency: ${station.frequency}<br>
         City: ${station.city}<br>
         State: ${station.state}`
    );

    marker.on("click", function() {
        if (selected[station.name]) {
            map.removeLayer(selected[station.name].circle);
            delete selected[station.name];

            const infoBox = document.querySelector(".info-box");
            const blocks = infoBox.querySelectorAll(".station-block");
            blocks.forEach(function(block) {
                if (block.dataset.name === station.name) {
                    block.remove();
                }
            });

            if (Object.keys(selected).length === 0) {
                document.querySelector(".info-box").innerHTML =
                    "Click a radio station marker to see details.";
            }

        } else {
            if (Object.keys(selected).length >= 2) return;

            const circle = L.circle([station.lat, station.lng], {
                color: "red",
                fillColor: "red",
                fillOpacity: 0.2,
                radius: 50000
            }).addTo(map);

            selected[station.name] = { circle: circle };

            const infoBox = document.querySelector(".info-box");
            if (infoBox.innerHTML === "Click a radio station marker to see details.") {
                infoBox.innerHTML = "";
            }

            const block = document.createElement("div");
            block.classList.add("station-block");
            block.dataset.name = station.name;
            block.innerHTML = `
                <h3>${station.name}</h3>
                <p><strong>Frequency:</strong> ${station.frequency}</p>
                <p><strong>City:</strong> ${station.city}</p>
                <p><strong>State:</strong> ${station.state}</p>
            `;
            infoBox.appendChild(block);
        }
    });

    markers.push({
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


function filterMarkers() {
    const selectedStation = stationSelect.value;

    const selectedCity = citySearch.value;
    
    //const selectedMarket = marketInput.value.toLowerCase().trim();

    markers.forEach(function(item) {
        map.removeLayer(item.marker);

        const matchStation =
           selectedStation === "" ||
           item.station.toLowerCase().includes(selectedStation.toLowerCase());

        const matchCity =
            selectedCity === "" ||
            item.city.toLowerCase().includes(selectedCity.toLowerCase());
            
        // const matchMarket =
        //     selectedMarket === "" ||
        //     item.type.toLowerCase().includes(selectedMarket);

        if (matchStation && matchCity) {
            item.marker.addTo(map);
        }
    });
}


document.querySelector("#reset").addEventListener("click", function() {
    stationSelect.value = "All Stations";
    cityList.value = "All Cities";

    filterMarkers();

    document.querySelector(".info-box").innerHTML =
        "Click a radio station marker to see details.";

    Object.values(selected).forEach(function(item) {
        map.removeLayer(item.circle);
    });

    for (const key in selected) {
        delete selected[key];
    }
});

        
const stationInput = document.querySelector("#stationSearch");

stationInput.addEventListener("input", filterMarkers);
stationSelect.addEventListener("input", filterMarkers);
citySearch.addEventListener("input", filterMarkers);


//const suggestions = document.querySelector("#suggestions");


//we will add markets later
//const marketInput = document.getElementById("marketSearch");
//marketInput.addEventListener("input", filterMarkers);

}