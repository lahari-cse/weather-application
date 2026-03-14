/* ==========================
   WEATHER DASHBOARD SCRIPT
========================== */

/* =================================
   MAP WEATHER CODE TO DESCRIPTION
================================= */
function getWeatherDescription(code){
  if(code===0) return "Clear Sky";
  else if(code===1) return "Mainly Clear";
  else if(code===2) return "Partly Cloudy";
  else if(code===3) return "Overcast";
  else if(code>=45 && code<=48) return "Fog / Rime Fog";
  else if(code>=51 && code<=57) return "Drizzle";
  else if(code>=61 && code<=67) return "Rain";
  else if(code>=71 && code<=77) return "Snow";
  else if(code>=80 && code<=82) return "Rain Showers";
  else if(code>=95 && code<=99) return "Thunderstorm";
  else return "Unknown";
}

/* =================================
   SET WEATHER ICON
================================= */
function setWeatherIcon(code){
    const icon = document.getElementById("weatherIcon");
    if(code===0) icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png"; // sunny
    else if(code<=3) icon.src="https://cdn-icons-png.flaticon.com/512/414/414825.png"; // cloudy
    else if(code>=51) icon.src="https://cdn-icons-png.flaticon.com/512/1163/1163624.png"; // rain
    else icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png"; // default
}

/* =================================
   SET BACKGROUND
================================= */
function setBackground(code){
    document.body.className=""; // reset
    if(code===0) document.body.classList.add("sunny");
    else if(code<=3) document.body.classList.add("cloudy");
    else if(code>=51) document.body.classList.add("rain");
    else document.body.classList.add("night");
}

/* =================================
   WEATHER ANIMATION
================================= */
function animateWeather(code){
    const container = document.getElementById("weatherAnimation");
    container.innerHTML="";

    if(code===0){ // sunny
        const sun = document.createElement("div");
        sun.classList.add("sun");
        container.appendChild(sun);
    } else if(code<=3){ // cloudy
        for(let i=0;i<3;i++){
            const cloud = document.createElement("div");
            cloud.classList.add("cloud");
            cloud.style.top=(20*i+20)+"px";
            cloud.style.left=(-100*i)+"px";
            container.appendChild(cloud);
        }
    } else if(code>=51){ // rain
        for(let i=0;i<10;i++){
            const drop = document.createElement("div");
            drop.classList.add("raindrop");
            drop.style.left=(10*i+10)+"px";
            drop.style.animationDelay=(i*0.2)+"s";
            container.appendChild(drop);
        }
    } else { // night stars
        for(let i=0;i<15;i++){
            const star = document.createElement("div");
            star.classList.add("star");
            star.style.top=Math.random()*100+"px";
            star.style.left=Math.random()*300+"px";
            container.appendChild(star);
        }
    }
}

/* =================================
   DRAW 5-DAY FORECAST
================================= */
function drawForecast(data){
    const container = document.getElementById("forecastContainer");
    container.innerHTML="";

    for(let i=0;i<5;i++){
        const day = data.daily.time[i];
        const max = Math.round(data.daily.temperature_2m_max[i]);
        const min = Math.round(data.daily.temperature_2m_min[i]);
        const code = data.daily.weathercode[i];

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        // Small icon
        const icon = document.createElement("img");
        if(code===0) icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png";
        else if(code<=3) icon.src="https://cdn-icons-png.flaticon.com/512/414/414825.png";
        else if(code>=51) icon.src="https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
        else icon.src="https://cdn-icons-png.flaticon.com/512/869/869869.png";
        icon.width=30;
        card.appendChild(icon);

        // Day name
        const date = new Date(day);
        card.innerHTML+=`<p>${date.toLocaleDateString('en-US',{weekday:'short'})}</p>`;

        // Weather description
        card.innerHTML+=`<p>${getWeatherDescription(code)}</p>`;

        // Max/Min
        card.innerHTML+=`<p>${max}°/${min}°</p>`;

        container.appendChild(card);
    }
}

/* =================================
   DRAW HOURLY CHART
================================= */
function drawCharts(data){
    const labels = data.hourly.time.slice(0,12).map(t=>t.split("T")[1]);
    const tempData = data.hourly.temperature_2m.slice(0,12);

    new Chart(document.getElementById("tempChart"),{
        type:"line",
        data:{
            labels:labels,
            datasets:[{
                label:"Temperature °C",
                data:tempData,
                borderColor:"yellow",
                backgroundColor:"rgba(255,255,0,0.2)",
                tension:0.3
            }]
        },
        options:{
            responsive:true,
            plugins:{legend:{display:false}}
        }
    });
}

/* =================================
   FETCH WEATHER
================================= */
async function fetchWeather(lat, lon){
    try{
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        // Current weather
        document.getElementById("temp").innerText=Math.round(data.current.temperature_2m)+"°C";
        document.getElementById("humidity").innerText=data.current.relative_humidity_2m+"%";
        document.getElementById("wind").innerText=data.current.wind_speed_10m+" km/h";
        document.getElementById("condition").innerText=getWeatherDescription(data.current.weather_code);
        document.getElementById("sunrise").innerText=data.daily.sunrise[0].split("T")[1];
        document.getElementById("sunset").innerText=data.daily.sunset[0].split("T")[1];

        // Icons, background & animation
        setWeatherIcon(data.current.weather_code);
        setBackground(data.current.weather_code);
        animateWeather(data.current.weather_code);

        // Forecast & charts
        drawForecast(data);
        drawCharts(data);

    } catch(error){
        console.error(error);
        alert("Weather fetch failed");
    }

    document.getElementById("loader").style.display="none";
}

/* =================================
   SEARCH CITY
================================= */
async function getWeather(){
    const city = document.getElementById("cityInput").value;
    if(!city) return alert("Enter a city name");

    try{
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        const geoData = await geoRes.json();
        if(!geoData.results) return alert("City not found");

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;

        fetchWeather(lat, lon);
    } catch(err){
        console.error(err);
        alert("City fetch failed");
    }
}

/* =================================
   CURRENT LOCATION
================================= */
function getCurrentLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
            fetchWeather(pos.coords.latitude,pos.coords.longitude);
        },err=>alert("Location access denied"));
    } else alert("Geolocation not supported");
}
