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

// Get city name
const city = document.getElementById("cityInput").value

if(!city){

alert("Please enter a city name")

return

}

// Show loader
document.getElementById("loader").style.display = "flex"

try{

// Get coordinates from Open-Meteo geocoding API
const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)

const geoData = await geo.json()

if(!geoData.results){

alert("City not found")

document.getElementById("loader").style.display = "none"

return

}

// Extract latitude & longitude
const lat = geoData.results[0].latitude
const lon = geoData.results[0].longitude

fetchWeather(lat,lon)

}

catch(error){

alert("Error fetching location")

document.getElementById("loader").style.display = "none"

}

}



/* ====================================
   FETCH WEATHER DATA
==================================== */

async function fetchWeather(lat,lon){

try{

const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`

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

// Wind
document.getElementById("wind").innerText =
data.current.wind_speed_10m + " km/h"

// Weather condition
document.getElementById("condition").innerText =
"Weather code: " + data.current.weather_code



/* ====================================
   SUNRISE / SUNSET
==================================== */

document.getElementById("sunrise").innerText =
data.daily.sunrise[0].split("T")[1]

document.getElementById("sunset").innerText =
data.daily.sunset[0].split("T")[1]



/* ====================================
   SET WEATHER ICON
==================================== */

setWeatherIcon(data.current.weather_code)



/* ====================================
   CHANGE BACKGROUND
==================================== */

setBackground(data.current.weather_code)



/* ====================================
   DRAW CHART
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
   WEATHER ICON LOGIC
==================================== */

function setWeatherIcon(code){

const icon = document.getElementById("weatherIcon")

if(code == 0){

// Sunny
icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png"

}

else if(code <= 3){

// Cloudy
icon.src="https://cdn-icons-png.flaticon.com/512/414/414825.png"

}

else if(code >= 51){

// Rain
icon.src="https://cdn-icons-png.flaticon.com/512/1163/1163624.png"

}

else{

icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png"

}

}



/* ====================================
   BACKGROUND THEMES
==================================== */

function setBackground(weatherCode){

const body = document.body

body.classList.remove("sunny","night","cloudy","rain")

const hour = new Date().getHours()

// Night mode
if(hour >= 19 || hour <= 5){

body.classList.add("night")

return

}

// Weather themes
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
   DRAW WEATHER CHART
==================================== */

function drawCharts(data){

const labels = data.hourly.time.slice(0,12).map(t => t.split("T")[1])

const temps = data.hourly.temperature_2m.slice(0,12)

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
   SERVICE WORKER
==================================== */

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js")

}
