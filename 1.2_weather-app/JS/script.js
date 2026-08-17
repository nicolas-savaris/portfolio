const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        return;
    }

    getWeather(city);
});

async function getWeather(city) {
    // 1. Trova le coordinate della città
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();   
    console.log(weatherData);
    // 2. Usa le coordinate per chiedere il meteo

    // 3. Riceve i dati

    // 4. Aggiorna la pagina
    console.log(weatherData.current.temperature_2m);
    console.log(weatherData.current.relative_humidity_2m);
    console.log(weatherData.current.wind_speed_10m);
    /*console.log(data);
    console.log(data.results[0].name);
    console.log(data.results[0].latitude);
    console.log(data.results[0].longitude);
    */

}