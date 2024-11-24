document.addEventListener("DOMContentLoaded", () => {
    const cityDropdown = document.getElementById("city-dropdown");
    const forecastContainer = document.getElementById("weather-forecast");
    const unitToggle = document.getElementById("unit-toggle");
    const spinner = document.getElementById("loading-spinner");
    const summary = document.getElementById("weekly-summary");
    const lastUpdated = document.getElementById("last-updated");
    let isCelsius = true; // Default to Celsius

    // Fetch and populate city data from the CSV file
    fetch("city_coordinates.csv")
        .then((response) => response.text())
        .then((data) => {
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const cities = results.data;
                    cities.forEach((city) => {
                        const option = document.createElement("option");
                        option.value = `${city.latitude},${city.longitude}`;
                        option.textContent = city.city;
                        cityDropdown.appendChild(option);
                    });
                },
            });
        })
        .catch((error) => {
            console.error("Error loading the CSV file:", error);
        });

    // Handle unit toggle between Celsius and Fahrenheit
    unitToggle.addEventListener("click", () => {
        isCelsius = !isCelsius;
        unitToggle.textContent = isCelsius ? "Switch to °F" : "Switch to °C";
        if (cityDropdown.value) updateWeather();
    });

    // Fetch weather when a city is selected
    cityDropdown.addEventListener("change", () => {
        if (cityDropdown.value) updateWeather();
    });

    function updateWeather() {
        const [lat, lon] = cityDropdown.value.split(",");
        const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;

        // Show loading spinner
        spinner.style.display = "block";
        forecastContainer.innerHTML = "";
        summary.textContent = "";

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                displayWeather(data);
            })
            .catch((error) => {
                console.error("Error fetching weather data:", error);
                forecastContainer.innerHTML =
                    "<p>Failed to retrieve weather data. Please try again later.</p>";
            })
            .finally(() => {
                spinner.style.display = "none";
            });
    }

    function displayWeather(data) {
        const forecast = data.dataseries;

        // Generate weekly summary
        const temps = forecast.map((day) => day.temp2m);
        const avgTemp =
            temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
        summary.textContent = `This week's average temperature is ${
            isCelsius ? avgTemp.toFixed(1) + "°C" : (avgTemp * 9) / 5 + 32 + "°F"
        }.`;

        forecast.forEach((day, index) => {
            if (index >= 7) return; // Limit to 7 days

            const weatherDay = document.createElement("div");
            weatherDay.classList.add("weather-day", "col-md-4", "mb-4");

            const date = new Date();
            date.setDate(date.getDate() + index);
            const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });

            const temp = isCelsius ? day.temp2m : (day.temp2m * 9) / 5 + 32;
            const tempUnit = isCelsius ? "°C" : "°F";

            const weatherMap = {
                clearday: ["☀️", "Clear"],
                clearnight: ["🌙", "Clear Night"],
                pcloudyday: ["⛅", "Partly Cloudy"],
                pcloudynight: ["🌤️", "Partly Cloudy Night"],
                mcloudyday: ["☁️", "Mostly Cloudy"],
                mcloudynight: ["🌥️", "Mostly Cloudy Night"],
                cloudyday: ["🌥️", "Cloudy"],
                cloudynight: ["🌥️", "Cloudy"],
                humidday: ["🌫️", "Humid"],
                humidnight: ["🌫️", "Humid"],
                lightrainday: ["🌦️", "Light Rain"],
                lightrainnight: ["🌧️", "Light Rain Night"],
                oshowerday: ["🌧️", "Occasional Showers"],
                oshowernight: ["🌧️", "Occasional Showers"],
                ishowerday: ["🌦️", "Isolated Showers"],
                ishowernight: ["🌦️", "Isolated Showers"],
                lightsnowday: ["❄️", "Light Snow"],
                lightsnownight: ["❄️", "Light Snow"],
                rainday: ["🌧️", "Rain"],
                rainnight: ["🌧️", "Rain"],
                snowday: ["❄️", "Snow"],
                snownight: ["❄️", "Snow"],
                rainsnowday: ["🌨️", "Rain and Snow"],
                rainsnownight: ["🌨️", "Rain and Snow"],
                tsday: ["⛈️", "Thunderstorm"],
                tsnight: ["⛈️", "Thunderstorm"],
                tsrainday: ["⛈️", "Thunderstorm with Rain"],
                tsrainnight: ["⛈️", "Thunderstorm with Rain"],
            };

            const [icon, description] = weatherMap[day.weather] || ["❓", "Unknown"];

            weatherDay.innerHTML = `
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">${dayName}</h5>
                        <p class="card-text" style="font-size: 2.5rem;">${icon}</p>
                        <p class="card-text text-uppercase" style="text-transform: uppercase; font-weight: bold;">${description}</p>
                        <p class="card-text">${temp.toFixed(1)}${tempUnit}</p>
                    </div>
                </div>
            `;
            forecastContainer.appendChild(weatherDay);
        });

        lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
});