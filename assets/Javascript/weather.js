const apiKey = 'a50066172c7b6be104287c3098be0967';

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('city-search').value;
    if (query.length > 2) {
        fetchCities(query);
    } else {
        clearCityList();
    }
});


async function fetchCities(query) {
    const errorMsg = document.getElementById('error-message');
    const loading = document.getElementById('loading-message');

    errorMsg.style.display = 'none';
    loading.style.display = 'block';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(query)}&type=like&sort=population&cnt=1&appid=${apiKey}`);
        const data = await response.json();

        if (data.cod === '200' && data.count > 0) {
            const city = data.list[0];
            addCityToHistory(city.name, city.id);
            fetchForecast(city.id);
        } else {
            clearCityList();
            errorMsg.style.display = 'block';
            console.error('City not located');
        }
    } catch (error) {
        console.error('Error fetching city:', error);
        errorMsg.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}



function displayCities(cities) {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = '';
    cities.forEach(city => {
        const cityItem = document.createElement('li');
        cityItem.textContent = `${city.name}, ${city.sys.country}`;
        cityItem.addEventListener('click', () => fetchForecast(city.id));
        cityList.appendChild(cityItem);
    });
}

function clearCityList() {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = '';
}

async function fetchForecast(cityId) {
    const loading = document.getElementById('loading-message');
    const errorMsg = document.getElementById('forecast-error');
    loading.style.display = 'block';
    errorMsg.style.display = 'none'; 

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (!data.list || data.list.length === 0) {
            throw new Error('No forecast data returned');
        }

        const dailyData = aggregateDailyForecasts(data.list);
        displayForecast(dailyData);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        errorMsg.style.display = 'block';
        document.getElementById('forecast').innerHTML = '';
    } finally {
        loading.style.display = 'none';
    }
}




function aggregateDailyForecasts(forecastList) {
    const dailyData = {};

    forecastList.forEach(entry => {
        const date = new Date(entry.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' });
        if (!dailyData[date]) {
            dailyData[date] = {
                date: date,
                tempMin: entry.main.temp,
                tempMax: entry.main.temp,
                weather: entry.weather[0].description,
                icon: entry.weather[0].icon,
                windSpeed: entry.wind.speed,
                humidity: entry.main.humidity,
                count: 1
            };
        } else {
            dailyData[date].tempMin = Math.min(dailyData[date].tempMin, entry.main.temp);
            dailyData[date].tempMax = Math.max(dailyData[date].tempMax, entry.main.temp);
            dailyData[date].count += 1;
        }
    });

    return Object.values(dailyData).slice(0, 5);
}

function displayForecast(forecastData) {
    const forecast = document.getElementById('forecast');
    forecast.innerHTML = '';
    forecastData.forEach(day => {
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <h3>${day.date}</h3>
            <p><img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather}"></p>
            <p>Weather: ${day.weather}</p>
            <p>Temperature: ${day.tempMin.toFixed(1)}°C - ${day.tempMax.toFixed(1)}°C</p>
            <p>Wind Speed: ${day.windSpeed} m/s</p>
            <p>Humidity: ${day.humidity}%</p>
        `;
        forecast.appendChild(card);
    });
}

function addCityToHistory(cityName, cityId) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];

    // Avoid duplicates
    if (!history.find(entry => entry.id === cityId)) {
        history.push({ name: cityName, id: cityId });
        localStorage.setItem('weatherHistory', JSON.stringify(history));
        renderSearchHistory(history);
    }
}


function renderSearchHistory(history) {
    const searchHistory = document.getElementById('search-history');
    searchHistory.innerHTML = '';
    history.forEach(entry => {
        const cityItem = document.createElement('li');
        cityItem.textContent = entry.name;
        cityItem.addEventListener('click', () => fetchForecast(entry.id));
        searchHistory.appendChild(cityItem);
    });
}

document.getElementById('clear-history').addEventListener('click', () => {
    const searchHistory = document.getElementById('search-history');
    searchHistory.innerHTML = '';
    localStorage.removeItem('weatherHistory'); 
});


// Example data for initial load
addCityToHistory('Salt Lake City', 5780993);
fetchForecast(5780993);


const savedHistory = JSON.parse(localStorage.getItem('weatherHistory'));
if (savedHistory && savedHistory.length > 0) {
    renderSearchHistory(savedHistory);
}

