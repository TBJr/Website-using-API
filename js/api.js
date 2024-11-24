const weatherCache = new Map();

// Fetch city data from the CSV file
export async function fetchCityData(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        return new Promise((resolve, reject) => {
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: reject,
            });
        });
    } catch (error) {
        console.error("Error loading the CSV file:", error);
        throw error;
    }
}

// Fetch weather data for a given latitude and longitude
export async function fetchWeatherData(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    if (weatherCache.has(cacheKey)) {
        return weatherCache.get(cacheKey);
    }

    try {
        const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch weather data");
        const data = await response.json();
        weatherCache.set(cacheKey, data); // Store in cache
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }
}