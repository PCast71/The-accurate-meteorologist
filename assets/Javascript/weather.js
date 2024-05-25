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

function fetchCities(query) {
    fetch(`https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(query)}&type=like&sort=population&cnt=5&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        if (data.cod === '200' && data.count > 0) {
            displayCities(data.list);
            addCityToHistory(query, data.list[0].id);
            } else {
               clearCityList();
               console.error('City not found');
        }
    })
        .catch(error => console.error('Error fetching city:', error));
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


function fetchForecast(cityId) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const dailyData = aggregateDailyForecasts(data.list);
      displayForecast(dailyData);
    })
    .catch(error => console.error('Error fetching forecast:', error));
}

function aggregateDailyForecasts(forecastList) {
    const dailyData = {};

    forecastList.forEach(entry => {
        const date = new Date(entry.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' });
        if(!dailyData[date]) {
            dailyData[date] = {
                date: date,
                tempMin: entry.main.temp,
                tempMax: entry.main.temp,
                weather: entry.weather[0].description,
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
        <p>Weather: ${day.weather}</p>
        <p>Temperature: ${day.tempMin.toFixed(1)}°C - ${day.tempMax.toFixed(1)}°C</p>
        `;
        forecast.appendChild(card);
    });
}




function addCityToHistory(cityName, cityId) {
    const cityList = document.getElementById('search-history');
    const cityItem = document.createElement('li');
    cityItem.textContent = cityName;
    cityItem.addEventListener('click', () => fetchForecast(cityId));
    cityList.appendChild(cityItem);
}