const API_KEY = 'ce493f8b0578ffc23cdcda77e611f8d4';

function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.init();
}

WeatherApp.prototype.init = function() {
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    this.cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }.bind(this));

    this.showWelcome();
};

WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message">
            <h3>🌤️ Welcome to SkyFetch</h3>
            <p>Enter a city name to see current weather and a 5-day forecast.</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = welcomeHTML;
};

WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError('Please enter a city name.');
        this.cityInput.focus();
        return;
    }

    if (city.length < 2) {
        this.showError('City name is too short. Please enter at least 2 characters.');
        this.cityInput.focus();
        return;
    }

    this.getWeather(city);
    this.cityInput.value = '';
};

WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

WeatherApp.prototype.processForecastData = function(data) {
    const noonForecasts = data.list.filter(function(item) {
        return item.dt_txt.includes('12:00:00');
    });

    if (noonForecasts.length >= 5) {
        return noonForecasts.slice(0, 5);
    }

    const fallbackByDay = [];
    const seenDates = {};

    data.list.forEach(function(item) {
        const dateKey = item.dt_txt.split(' ')[0];
        if (!seenDates[dateKey]) {
            seenDates[dateKey] = true;
            fallbackByDay.push(item);
        }
    });

    return fallbackByDay.slice(0, 5);
};

WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentWeatherUrl = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        console.log('Weather Data:', currentWeather.data);
        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);
    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
    }
};

WeatherApp.prototype.displayWeather = function(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = weatherHTML;
    this.cityInput.focus();
};

WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function(day) {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4 class="forecast-day">${dayName}</h4>
                <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');

    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    this.weatherDisplay.innerHTML += forecastSection;
};

WeatherApp.prototype.showLoading = function() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading">Fetching current weather and forecast...</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = loadingHTML;
};

WeatherApp.prototype.showError = function(message) {
    const errorHTML = `
        <div class="error-message">
            <div class="error-title">⚠️ Oops!</div>
            <p class="error-text">${message}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = errorHTML;
};

const app = new WeatherApp(API_KEY);
window.app = app;
