/* =====================================
   WEATHER DASHBOARD MAIN SCRIPT
   Uses Open-Meteo API for weather data
===================================== */


/* =====================================
   SEARCH WEATHER BY CITY
===================================== */

async function getWeather(){

const city=document.getElementById("cityInput").value

const geo=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)

const geoData=await geo.json()

const lat=geoData.results[0].latitude
const lon=geoData.results[0].longitude

fetchWeather(lat,lon)

}


/* =====================================
   FETCH WEATHER DATA FROM API
===================================== */

async function fetchWeather(lat,lon){

const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,us_aqi&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`

const res=await fetch(url)
const data=await res.json()


/* =====================================
   UPDATE WEATHER UI
===================================== */

document.getElementById("temp").innerText=Math.round(data.current.temperature_2m)+"°C"

document.getElementById("humidity").innerText=data.current.relative_humidity_2m+"%"

document.getElementById("wind").innerText=data.current.wind_speed_10m+" km/h"

document.getElementById("aqi").innerText=data.current.us_aqi


/* =====================================
   SUNRISE / SUNSET DISPLAY
===================================== */

document.getElementById("sunrise").innerText=data.daily.sunrise[0].split("T")[1]

document.getElementById("sunset").innerText=data.daily.sunset[0].split("T")[1]


/* =====================================
   DRAW WEATHER ANALYTICS CHARTS
===================================== */

drawCharts(data)


/* =====================================
   HIDE LOADING SCREEN
===================================== */

document.getElementById("loader").style.display="none"

}


/* =====================================
   DRAW WEATHER CHARTS
===================================== */

function drawCharts(data){

const labels=data.hourly.time.slice(0,12).map(t=>t.split("T")[1])

new Chart(document.getElementById("tempChart"),{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Temperature °C",
data:data.hourly.temperature_2m.slice(0,12)
}]
}

})

}
