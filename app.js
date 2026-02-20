// Your OpenWeatherMap API Key
const API_KEY = 'ce493f8b0578ffc23cdcda77e611f8d4';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const weatherDisplay = document.getElementById('weather-display');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

// Function to fetch weather data
async function getWeather(city) {
    showLoading();
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        console.log('Weather Data:', response.data);
        displayWeather(response.data);
    } catch (error) {
        console.error('Error fetching weather:', error);

        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = '🔍 Search';
    }
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Put it on the page
    weatherDisplay.innerHTML = weatherHTML;
    cityInput.focus();
}

function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <div class="error-title">⚠️ Oops!</div>
            <p class="error-text">${message}</p>
        </div>
    `;

    weatherDisplay.innerHTML = errorHTML;
}

function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading">Fetching weather data...</p>
        </div>
    `;

    weatherDisplay.innerHTML = loadingHTML;
}

function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        cityInput.focus();
        return;
    }

    if (city.length < 2) {
        showError('City name is too short. Please enter at least 2 characters.');
        cityInput.focus();
        return;
    }

    getWeather(city);
    cityInput.value = '';
}

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

weatherDisplay.innerHTML = `
    <div class="welcome-message">
        Enter a city name to get started!
    </div>
`;
