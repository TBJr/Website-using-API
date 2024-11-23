document.addEventListener("DOMContentLoaded", () => {
    const cityDropdown = document.getElementById('city-dropdown');

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
});

document.getElementById('city-dropdown').addEventListener('change', (event) => {
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

            weatherDay.innerHTML = `
                <h3>${dayName}</h3>
                <p>Temperature: ${day.temp2m}°C</p>
                <p>Weather: ${day.temp2m > 20 ? "Sunny" : "Cloudy"}</p>
            `;
            forecastContainer.appendChild(weatherDay);
        }
    });
}
