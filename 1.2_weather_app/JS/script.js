const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");

searchForm.addEventListener("submit", (event) => {

    event.preventDefault();
    console.log("Form submitted");

    const city = cityInput.value.trim();
    console.log(city);

    if (!city) {
        return;
    }

    getWeather();
});