const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        return;
    }

    console.log(`Searching for: ${city}`);
});