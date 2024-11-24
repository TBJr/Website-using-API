document.addEventListener("DOMContentLoaded", () => {
    const cityDropdown = document.getElementById('city-dropdown');
    let isCelsius = true;  // Default to Celsius

    // Load the CSV file
    fetch('city_coordinates.csv')
        .then(response => response.text())
        .then(data => {
            // Parse the CSV data
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const cities = results.data;
                    cities.forEach(city => {
                        // Create a new option for each city
                        const option = document.createElement('option');
                        option.value = `${city.latitude},${city.longitude}`;
                        option.textContent = city.city;  // Assuming 'city' is the name of the city in CSV
                        cityDropdown.appendChild(option);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error loading the CSV file:", error);
        });

    // Toggle between Celsius and Fahrenheit
    document.getElementById('unit-toggle').addEventListener('click', () => {
        isCelsius = !isCelsius;  // Toggle the unit
        document.getElementById('unit-toggle').textContent = isCelsius ? "Switch to °F" : "Switch to °C";
        updateWeatherDisplay();
    });

    // When a city is selected, fetch weather data
    cityDropdown.addEventListener('change', (event) => {
        const coordinates = event.target.value.split(',');
        const lat = coordinates[0];
        const lon = coordinates[1];

        // Call the 7Timer API
        const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                console.error("Error fetching the weather data:", error);
                document.getElementById('weather-forecast').innerHTML = "<p>Failed to retrieve weather data. Please try again later.</p>";
            });
    });

    function displayWeather(data) {
        const forecast = data.dataseries;
        const forecastContainer = document.getElementById('weather-forecast');

        // Clear previous weather data
        forecastContainer.innerHTML = "";

        forecast.forEach((day, index) => {
            if (index < 7) {  // Show only the next 7 days
                const weatherDay = document.createElement('div');
                weatherDay.classList.add('weather-day', 'col-md-4', 'mb-4');

                // Calculate the date from the timepoint
                const currentDate = new Date();
                const forecastDate = new Date(currentDate.getTime() + day.timepoint * 60 * 60 * 1000);
                const dayName = forecastDate.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

                // Use temp2m as the temperature value
                const temp = isCelsius ? day.temp2m : (day.temp2m * 9 / 5) + 32;
                const tempUnit = isCelsius ? "°C" : "°F";

                // Debug weather data
                console.log(day.weather);

                // Assign weather icons based on the API's weather field
                let weatherIcon;
                let weatherDescription = "";
                switch (day.weather) {
                    case "clearday":
                    case "clearnight":
                        weatherIcon = "☀️"; // Clear
                        weatherDescription = "Clear";
                        break;
                    case "pcloudyday":
                    case "pcloudynight":
                        weatherIcon = "⛅"; // Partly Cloudy
                        weatherDescription = "Partly Cloudy";
                        break;
                    case "mcloudyday":
                    case "mcloudynight":
                        weatherIcon = "☁️"; // Mostly Cloudy
                        weatherDescription = "Mostly Cloudy";
                        break;
                    case "cloudyday":
                    case "cloudynight":
                        weatherIcon = "🌥️"; // Cloudy
                        weatherDescription = "Cloudy";
                        break;
                    case "humidday":
                    case "humidnight":
                        weatherIcon = "🌫️"; // Humid
                        weatherDescription = "Humid";
                        break;
                    case "lightrainday":
                    case "lightrainnight":
                        weatherIcon = "🌦️"; // Light Rain
                        weatherDescription = "Light Rain";
                        break;
                    case "oshowerday":
                    case "oshowernight":
                        weatherIcon = "🌧️"; // Occasional Showers
                        weatherDescription = "Occasional Showers";
                        break;
                    case "ishowerday":
                    case "ishowernight":
                        weatherIcon = "🌦️"; // Isolated Showers
                        weatherDescription = "Isolated Showers";
                        break;
                    case "lightsnowday":
                    case "lightsnownight":
                        weatherIcon = "❄️"; // Light Snow
                        weatherDescription = "Light Snow";
                        break;
                    case "rainday":
                    case "rainnight":
                        weatherIcon = "🌧️"; // Rain
                        weatherDescription = "Rain";
                        break;
                    case "snowday":
                    case "snownight":
                        weatherIcon = "❄️"; // Snow
                        weatherDescription = "Snow";
                        break;
                    case "rainsnowday":
                    case "rainsnownight":
                        weatherIcon = "🌨️"; // Rain and Snow
                        weatherDescription = "Rain and Snow";
                        break;
                    case "tsday":
                    case "tsnight":
                        weatherIcon = "⛈️"; // Thunderstorm
                        weatherDescription = "Thunderstorm";
                        break;
                    case "tsrainday":
                    case "tsrainnight":
                        weatherIcon = "⛈️"; // Thunderstorm with Rain
                        weatherDescription = "Thunderstorm with Rain";
                        break;
                    default:
                        weatherIcon = "🌞"; // Default
                        weatherDescription = "Unknown";
                        break;
                }

                // Build the weather card
                weatherDay.innerHTML = `
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title">${dayName}</h5>
                            <p class="card-text">${weatherIcon}</p>
                            <p class="card-text" style="font-size: small">${weatherDescription}</p>
                            <p class="card-text">${temp.toFixed(1)}${tempUnit}</p>
                        </div>
                    </div>
                `;

                // Append the weather card to the container
                forecastContainer.appendChild(weatherDay);
            }
        });

        forecastContainer.classList.add('visible');
    }

    function updateWeatherDisplay() {
        const cityDropdown = document.getElementById('city-dropdown');
        const coordinates = cityDropdown.value.split(',');
        const lat = coordinates[0];
        const lon = coordinates[1];

        // Call the 7Timer API again to get updated weather data in the selected unit
        const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                console.error("Error fetching the weather data:", error);
                document.getElementById('weather-forecast').innerHTML = "<p>Failed to retrieve weather data. Please try again later.</p>";
            });
    }
});
