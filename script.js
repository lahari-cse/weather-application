/* ====================================
   WEATHER DASHBOARD MAIN SCRIPT
==================================== */


/* Hide loader when page loads */
window.onload = function(){

document.getElementById("loader").style.display = "none"

}



/* ====================================
   SEARCH WEATHER BY CITY
==================================== */

async function getWeather(){

// Get city name from input field
const city = document.getElementById("cityInput").value

// Check if city is empty
if(!city){

alert("Please enter a city name")

return

}

// Show loading screen
document.getElementById("loader").style.display = "flex"

try{

// Get latitude and longitude from Open-Meteo Geocoding API
const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)

const geoData = await geo.json()

// If city not found
if(!geoData.results){

alert("City not found")

document.getElementById("loader").style.display = "none"

return

}

// Extract latitude and longitude
const lat = geoData.results[0].latitude
const lon = geoData.results[0].longitude

// Fetch weather data
fetchWeather(lat, lon)

}
catch(error){

alert("Error fetching location")

document.getElementById("loader").style.display = "none"

}

}



/* ====================================
   FETCH WEATHER DATA
==================================== */

async function fetchWeather(lat, lon){

try{

// Weather API URL
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`

// Fetch weather data
const res = await fetch(url)

const data = await res.json()



/* ====================================
   UPDATE WEATHER UI
==================================== */

// Temperature
document.getElementById("temp").innerText =
Math.round(data.current.temperature_2m) + "°C"

// Humidity
document.getElementById("humidity").innerText =
data.current.relative_humidity_2m + "%"

// Wind Speed
document.getElementById("wind").innerText =
data.current.wind_speed_10m + " km/h"

// Weather Condition Code
document.getElementById("condition").innerText =
"Weather code: " + data.current.weather_code



/* ====================================
   SUNRISE AND SUNSET
==================================== */

// Sunrise time
document.getElementById("sunrise").innerText =
data.daily.sunrise[0].split("T")[1]

// Sunset time
document.getElementById("sunset").innerText =
data.daily.sunset[0].split("T")[1]



/* ====================================
   CHANGE BACKGROUND BASED ON WEATHER
==================================== */

setBackground(data.current.weather_code)



/* ====================================
   DRAW WEATHER CHART
==================================== */

drawCharts(data)

}
catch(error){

alert("Weather fetch failed")

}

// Hide loader
document.getElementById("loader").style.display = "none"

}



/* ====================================
   WEATHER BACKGROUND THEMES
==================================== */

function setBackground(weatherCode){

const body = document.body

// Remove previous classes
body.classList.remove("sunny","night","cloudy","rain")

// Get current hour
const hour = new Date().getHours()

/* Night Theme */

if(hour >= 19 || hour <= 5){

body.classList.add("night")

return

}

/* Weather Based Themes */

if(weatherCode == 0){

body.classList.add("sunny")

}

else if(weatherCode <= 3){

body.classList.add("cloudy")

}

else if(weatherCode >= 51){

body.classList.add("rain")

}

else{

body.classList.add("sunny")

}

}



/* ====================================
   DRAW TEMPERATURE CHART
==================================== */

function drawCharts(data){

// First 12 hours time labels
const labels = data.hourly.time.slice(0,12).map(t => t.split("T")[1])

// Temperature data
const temps = data.hourly.temperature_2m.slice(0,12)


// Create chart
new Chart(document.getElementById("tempChart"),{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Temperature °C",

data:temps,

borderColor:"white",

backgroundColor:"rgba(255,255,255,0.3)",

tension:0.4

}]

},

options:{

plugins:{
legend:{labels:{color:"white"}}
},

scales:{
x:{ticks:{color:"white"}},
y:{ticks:{color:"white"}}
}

}

})

}



/* ====================================
   REGISTER SERVICE WORKER
==================================== */

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js")

}
