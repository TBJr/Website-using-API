// Populate city dropdown
export function populateCityDropdown(cityDropdown, cities) {
    cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = `${city.latitude},${city.longitude}`;
        option.textContent = city.city;
        cityDropdown.appendChild(option);
    });
}

export function filterAndPopulateDropdown(cityDropdown, cities, filter = "") {
    cityDropdown.innerHTML = ""; // Clear previous options
    cities
        .filter((city) =>
            city.city.toLowerCase().includes(filter.toLowerCase())
        )
        .forEach((city) => {
            const option = document.createElement("option");
            option.value = `${city.latitude},${city.longitude}`;
            option.textContent = city.city;
            cityDropdown.appendChild(option);
        });
}

// Display the weather forecast
export function displayWeather(data, forecastContainer, summary, isCelsius, lastUpdated) {
    const forecast = data.dataseries;

    // Generate weekly summary
    const temps = forecast.map((day) => day.temp2m);
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    summary.textContent = `This week's average temperature is ${
        isCelsius ? avgTemp.toFixed(1) + "°C" : ((avgTemp * 9) / 5 + 32).toFixed(1) + "°F"
    }.`;

    forecastContainer.innerHTML = ""; // Clear previous content

    forecast.slice(0, 7).forEach((day, index) => {
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
                    <p class="card-text text-uppercase">${description}</p>
                    <p class="card-text">${temp.toFixed(1)}${tempUnit}</p>
                </div>
            </div>
        `;
        forecastContainer.appendChild(weatherDay);
        setTimeout(() => weatherDay.classList.add("visible"), 100 * index);
    });

    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
}