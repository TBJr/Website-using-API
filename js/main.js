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

    document.getElementById('unit-toggle').addEventListener('click', () => {
        isCelsius = !isCelsius;  // Toggle the unit
        document.getElementById('unit-toggle').textContent = isCelsius ? "Switch to °F" : "Switch to °C";
        updateWeatherDisplay();
    });

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
                weatherDay.classList.add('weather-day');

                const date = new Date(day.time * 1000); // Convert Unix timestamp to Date
                const dayName = date.toLocaleDateString("en-US", { weekday: 'long' });

                // Convert the temperature based on the selected unit
                const temp = isCelsius ? day.temp2m : (day.temp2m * 9/5) + 32;  // Celsius to Fahrenheit conversion
                const tempUnit = isCelsius ? "°C" : "°F";

                // Determine the weather icon based on temperature
                let weatherIcon = "☁️";  // Default to cloudy
                if (day.temp2m > 20) {
                    weatherIcon = "🌞";  // Sunny if temp > 20°C
                } else if (day.temp2m < 10) {
                    weatherIcon = "🌧️";  // Rainy if temp < 10°C
                }

                weatherDay.innerHTML = `
                    <h3>${dayName}</h3>
                    <p>${weatherIcon} Temperature: ${temp.toFixed(1)}${tempUnit}</p>
                    <p>Weather: ${day.temp2m > 20 ? "Sunny" : "Cloudy"}</p>
                `;
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
