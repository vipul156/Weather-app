const api_url = new URL("https://api.open-meteo.com/v1/forecast");
api_url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
api_url.searchParams.set("hourly", "temperature_2m,weather_code");
api_url.searchParams.set("current", "weather_code,temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m");
api_url.searchParams.set("timezone", "auto");

// Array 1: Long form of the days of the week
const weather = {
  0: "sunny",
  1: "sunny",

    // Clear/Cloudy Conditions
    2: "partly-cloudy",
    3: "overcast",

    // Fog
    45: "fog",
    48: "fog",
    
    // drizzle
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    56: "drizzle",
    57: "drizzle",

    // rain
    61: "rain",
    63: "rain",
    65: "rain",
    66: "rain",
    67: "rain",
    80: "rain",
    81: "rain",
    82: "rain",
    
    // snow
    71: "snow",
    73: "snow",
    75: "snow",
    77: "snow",
    85: "snow",
    86: "snow",
  
    // storm
    95: "storm",
    96: "storm",
    99: "storm"
}
const fullWeekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const shortWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const count = new Date().getDay()
let currlocation
async function getWeatherData() {
  try {
    console.log(currlocation)
    const response = await fetch(api_url);
    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    console.log(json)
    // Proceed with your data processing
    const current = json['current'];
    const units = json['current_units'];
    const curr_time = current.time
    handleMainCard(current);
    handleCards(current, units);
    handleHourlyForm()
    handleDaily(json);
    handleHourly(json, curr_time);

  } catch (error) {
    // This catch block handles both network errors and HTTP errors
    console.error('There was a problem with the fetch operation:', error);
    // Display a user-friendly error message
    document.querySelector(".container").innerHTML=`
    <div class="error">
    <i class="fa fa-ban" style="font-size:24px; opacity:0.5"></i>
      <h2 class="errorh2">Something went wrong</h2>
      <p class="errorp">We couldn't connect to the server (API error).Please try again in a few moments.</p>
      <button class="errorbutton"><img style="width:25px;" src="./assets/images/reload.png" alt="retry">Retry</button>
    </div>`
    document.querySelector(".errorbutton").addEventListener('click',getWeatherData)
  }
}


  function  getFormattedDate() {
    const now = new Date();
    
    const options = {
        weekday: 'long',  // Full weekday name (e.g., Tuesday)
        day: 'numeric',   // Day of the month (e.g., 5)
        month: 'short',   // Abbreviated month name (e.g., Aug)
        year: 'numeric'   // Full year (e.g., 2025)
    };
    // Use 'en-US' locale for a clear structure similar to the request
    const formattedDate = now.toLocaleDateString('en-US', options);
    return formattedDate;
}

function handleHourlyForm(){
  const options = document.querySelector(".hourly-header select")
  let innerHtml =""
  for (let i = 0; i < 7; i++){
    innerHtml += `<option value="${i}">${fullWeekdays[(count+i)%7]}</option>`
  }
  options.innerHTML = innerHtml
}
function handleTime(curr_time){
  // 1. Create a Date object from the ISO string.
  const date = new Date(curr_time);

  // 2. Get the hours (0-23) and minutes (0-59).
  const hours24 = date.getHours();

  // 3. Determine AM/PM and convert to 12-hour format.
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  
  let hours12 = hours24 % 12 || 12; // Converts 0 to 12 AM and handles 13-23
  const standardOutput = [hours24,`${hours12} ${ampm}`];
  return standardOutput;
}
function addHourly(start, weather_code, hourly_data){
  const hourly = document.querySelector('.hourly');
  let hourly_html = '';
  for (var i = 0; i < 10; i++) {
    let current_wet = weather[weather_code[start + i]]
    let curr = handleTime(hourly_data.time[start+i])
    hourly_html += `<div class="hour">
    <div class="each_h">
    <img src="/assets/images/icon-${current_wet}.webp" alt="${current_wet}">
    <span>${curr[1]}</span>
    </div>
    <span>${Math.round(hourly_data.temperature_2m[start+i])}&deg;</span>
    </div>`;
    if (curr[1] == "11 PM") break;
  }
  hourly.innerHTML = hourly_html;
}
function handleHourly(json, curr_time) {
  const hourly_data = json['hourly'];
  const weather_code = hourly_data.weather_code
  const curr = handleTime(curr_time)
  var start = curr[0]
  addHourly(start, weather_code, hourly_data)
  const hour = document.querySelector(".hourly-header select")
  addHourly(start, weather_code, hourly_data)
  hour.addEventListener('change', (e)=>{
    start = e.target.value * 24
    addHourly(start, weather_code, hourly_data)
  })
}

function handleDaily(json) {
  const daily = json['daily'];
  const max_temp = daily.temperature_2m_max;
  const min_temp = daily.temperature_2m_min;
  const weather_code = daily.weather_code
  const days = document.querySelectorAll('.day');
  days.forEach((day, i) => {
    let current_wet = weather[weather_code[i]]
    day.innerHTML = `<p>${shortWeekdays[(count+i)%7]}</p>
    <img src="/assets/images/icon-${current_wet}.webp" alt="${current_wet}"/>
    <div class="daily-temp">
    <div>${Math.round(max_temp[i])}&deg;</div>
    <div>${Math.round(min_temp[i])}&deg;</div>
    </div>`
  }
  );
}

function handleCards(current, units) {
  const cards = document.querySelectorAll('.card p');
  cards[0].innerHTML = `${Math.round(current.apparent_temperature)}&deg;`;
  cards[1].innerHTML = `${Math.round(current.relative_humidity_2m)} ${
    units.relative_humidity_2m
  }`;
  cards[2].innerHTML = `${Math.round(current.wind_speed_10m)} ${
    units.wind_speed_10m
  }`;
  cards[3].innerHTML = `${Math.round(current.precipitation)} ${
    units.precipitation
  }`;
}
async function handleMainCard(current) {
  const current_wet = weather[current.weather_code]
  const main_card = document.querySelector('.main-card');
  main_card.style.backgroundImage = `url("./assets/images/bg-today-large.svg")`;
  main_card.innerHTML = `<div>
  <div class="location">${currlocation.city},${currlocation.country}</div>
  <div class="date">${getFormattedDate()}</div>
  </div>
  <div class="temp-info">
    <img src="/assets/images/icon-${current_wet}.webp" alt="${current_wet}">
    <span class="temp">${Math.round(current.temperature_2m)}&deg;</span>
  </div>`
}

function changeUnit(id, val, option){
  const params = {
    tempt : [
      "temperature_unit",
      "fahrenheit"
    ],
    wind : [
      "wind_speed_unit",
      "mph"
    ],
    prep :[
      "precipitation_unit",
      "inch"
    ]
  }
  const curr = document.querySelector(`#${id}.selected`)
  if(val != curr.getAttribute('value')){
    option.classList.toggle("selected")
    curr.classList.toggle("selected")
    if (val == 1){
      api_url.searchParams.set(params[id][0],params[id][1]);
    }
    else{
      api_url.searchParams.delete(params[id][0]);
    }
  }
}

function showUnits(){
  document.querySelector(".dropdown-down").classList.toggle("show")
}
function handleUnits(){
  document.querySelector(".dropdown-header").addEventListener('click',showUnits)
  const box = document.querySelector(".dropdown-down")
  const options = box.querySelectorAll(".option")
  options.forEach((option) =>{
  option.addEventListener('click',(e)=>{
    const prevUrl = api_url.toString();
    var id = e.target.id;
    var val = e.target.getAttribute('value')
    if (id === "imperial"){
      const imperials = document.querySelectorAll(".option[value='1']")
      imperials.forEach((imperial)=> {
        changeUnit(imperial.getAttribute('id'),1,imperial)
      })
    }
    else{
    changeUnit(id,val,option)
    }
    box.classList.toggle("show")
    if (prevUrl !== api_url.toString()) {
      getWeatherData();
    }
  })
  })
  }

async function coordinatesToCityCountry(latitude, longitude) {
  // Construct the API URL
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract City and Country
    const city = data.city || data.locality || 'N/A';
    const country = data.countryName || 'N/A';
    return { city, country };
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => { 
        const prevUrl = api_url.toString(); // <-- make this async
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        api_url.searchParams.set("latitude",latitude.toFixed(2))
        api_url.searchParams.set("longitude",longitude.toFixed(2))
        currlocation = await coordinatesToCityCountry(latitude, longitude);
        if (prevUrl !== api_url.toString()) {
          getWeatherData();
        }
      }
    )
    }
  }

async function searchCity(e){
  e.preventDefault(); // prevent form reload if inside a <form>
  const city_list = document.querySelector(".city-list")
  city_list.classList.remove("hide")
  city_list.innerHTML=`<div class="loading">
  <img src="./assets/images/icon-loading.svg" alt="loading"><span>Search in progress</span>
  </div>`
  const prevUrl = api_url.toString();
  const city = document.querySelector("#search").value.trim();
  if (!city) {
    console.warn("Please enter a city name.");
    return;
  }

  currlocation = await getLocation(city);
  if (prevUrl !== api_url.toString()) {
    getWeatherData();
  }
  document.querySelector("#search").value = ''
}
async function getLocation(city) {
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", city);
  url.searchParams.set("type", "city");
  url.searchParams.set("format", "json");
  url.searchParams.set("apiKey", "234f9ce0ad2b44c8944989dd7a46b254");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const citiesContainer = document.querySelector(".city-list");
      citiesContainer.innerHTML = data.results
        .map((r, i) => `<div class="city" id="${i}">${r.city}, ${r.country}</div>`)
        .join("");

      // ✅ Return a Promise that resolves when a city is clicked
      return new Promise((resolve) => {
        citiesContainer.querySelectorAll(".city").forEach((el) => {
          el.addEventListener("click", (e) => {
            citiesContainer.classList.add("hide");
            const selected = data.results[e.target.id];
            api_url.searchParams.set("latitude",selected.lat.toFixed(2))
            api_url.searchParams.set("longitude",selected.lon.toFixed(2))
            resolve({
              city: selected.city || selected.name,
              country: selected.country || "Unknown",
            });
          });
        });
      });
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    document.querySelector(".weather-section").innerHTML = `
      <h2 style="margin:auto">No search result found!</h2>`;
  }
}

function main(){
  handleUnits()
  getCurrentLocation()
  document.querySelector(".search-bar button").addEventListener('click', searchCity)
}
main()