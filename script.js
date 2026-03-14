/* ==========================
   WEATHER DASHBOARD SCRIPT
========================== */

let tempChart;

/* ==========================
   HIDE LOADER WHEN PAGE LOADS
========================== */

window.onload = () => {

    document.getElementById("loader").style.display = "none";

    /* show today's day and date */
    showTodayDate();

};

/* ==========================
   WEATHER DESCRIPTION
========================== */

function getWeatherDescription(code){

if(code===0) return "Clear Sky";
if(code===1) return "Mainly Clear";
if(code===2) return "Partly Cloudy";
if(code===3) return "Overcast";
if(code>=45 && code<=48) return "Fog";
if(code>=51 && code<=57) return "Drizzle";
if(code>=61 && code<=67) return "Rain";
if(code>=71 && code<=77) return "Snow";
if(code>=80 && code<=82) return "Rain Showers";
if(code>=95) return "Thunderstorm";

return "Unknown";

}

/* ==========================
   WEATHER ICON
========================== */

function setWeatherIcon(code){

const icon=document.getElementById("weatherIcon");

if(code===0)
icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png";

else if(code<=3)
icon.src="https://cdn-icons-png.flaticon.com/512/414/414825.png";

else
icon.src="https://cdn-icons-png.flaticon.com/512/1163/1163624.png";

}

/* ==========================
   BACKGROUND CHANGE
========================== */

function setBackground(code){

document.body.className="";

if(code===0) document.body.classList.add("sunny");
else if(code<=3) document.body.classList.add("cloudy");
else document.body.classList.add("rain");

}

/* ==========================
   WEATHER ANIMATION
========================== */

function animateWeather(code){

const container=document.getElementById("weatherAnimation");
container.innerHTML="";

if(code===0){

const sun=document.createElement("div");
sun.classList.add("sun");
container.appendChild(sun);

}

else if(code<=3){

for(let i=0;i<3;i++){

const cloud=document.createElement("div");
cloud.classList.add("cloud");
cloud.style.top=(20*i+20)+"px";
container.appendChild(cloud);

}

}

else{

for(let i=0;i<10;i++){

const drop=document.createElement("div");
drop.classList.add("raindrop");
drop.style.left=(20*i)+"px";
container.appendChild(drop);

}

}

}

/* ==========================
   FORECAST (UPDATED)
========================== */

function drawForecast(data){

const container = document.getElementById("forecastContainer");
container.innerHTML = "";

const today = new Date().toDateString();
let count = 0;

for(let i = 0; i < data.daily.time.length; i++){

const forecastDate = new Date(data.daily.time[i]);

/* skip today's date */

if(forecastDate.toDateString() === today){
continue;
}

const max = Math.round(data.daily.temperature_2m_max[i]);
const min = Math.round(data.daily.temperature_2m_min[i]);
const code = data.daily.weathercode[i];

const dayName = forecastDate.toLocaleDateString('en-US',{weekday:'short'});

const card = document.createElement("div");
card.classList.add("forecast-card");

card.innerHTML = `
<p>${dayName}</p>
<p>${getWeatherDescription(code)}</p>
<p>${max}°/${min}°</p>
`;

container.appendChild(card);

count++;

if(count === 5) break;

}

}
/* ==========================
   TODAY DATE
========================== */

function showTodayDate(){

const today = new Date();

const formatted = today.toLocaleDateString(
'en-US',
{
weekday:'long',
day:'numeric',
month:'long',
year:'numeric'
});

document.getElementById("todayDate").innerText = formatted;

}

/* ==========================
   TEMPERATURE CHART
========================== */

function drawCharts(data){

if(tempChart){
tempChart.destroy();
}

const labels=data.hourly.time.slice(0,12).map(t=>t.split("T")[1]);
const tempData=data.hourly.temperature_2m.slice(0,12);

tempChart=new Chart(
document.getElementById("tempChart"),
{
type:"line",

data:{
labels:labels,
datasets:[{
data:tempData,
borderColor:"yellow",
backgroundColor:"rgba(255,255,0,0.3)",
tension:0.4
}]
},

options:{
plugins:{legend:{display:false}}
}

});

}

/* ==========================
   FETCH WEATHER
========================== */

async function fetchWeather(lat,lon){

document.getElementById("loader").style.display="flex";

try{

const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode&timezone=auto`;

const res=await fetch(url);
const data=await res.json();

document.getElementById("temp").innerText=Math.round(data.current.temperature_2m)+"°C";
document.getElementById("humidity").innerText=data.current.relative_humidity_2m+"%";
document.getElementById("wind").innerText=data.current.wind_speed_10m+" km/h";
document.getElementById("condition").innerText=getWeatherDescription(data.current.weather_code);

document.getElementById("sunrise").innerText=new Date(data.daily.sunrise[0]).toLocaleTimeString();
document.getElementById("sunset").innerText=new Date(data.daily.sunset[0]).toLocaleTimeString();

setWeatherIcon(data.current.weather_code);
setBackground(data.current.weather_code);
animateWeather(data.current.weather_code);

drawForecast(data);
drawCharts(data);

}
catch(error){

alert("Weather fetch failed");

}

document.getElementById("loader").style.display="none";

}

/* ==========================
   SEARCH CITY
========================== */

async function getWeather(){

const city=document.getElementById("cityInput").value;

if(!city) return alert("Enter a city");

const geo=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
const data=await geo.json();

if(!data.results) return alert("City not found");

fetchWeather(
data.results[0].latitude,
data.results[0].longitude
);

}

/* ==========================
   CURRENT LOCATION
========================== */

function getCurrentLocation(){

navigator.geolocation.getCurrentPosition(

pos=>{
fetchWeather(
pos.coords.latitude,
pos.coords.longitude
)
},

()=>alert("Location permission denied")

);

}
