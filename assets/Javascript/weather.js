const apiKey = 'a50066172c7b6be104287c3098be0967';

document.getElementById('city-search').addEventListener('input', function () {
    const query =this.value;
    if (query.length > 2) {
        fetchCities(query);
    }
});

function fetchCities(query) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data =>{
        if (data.cod === 200) {
            addCityToList(data.name, data.id);
            fetchForecast(data.id);
            } else {
                alert('City Not found');
        }
    })
        .catch(error => console.error('Error fetching city:', error));
}

function addCityToList(cityName, cityId) {
    const cityList = document.getElementById('city-list');
    const cityItem = document.createElement('li');
    cityItem.textContent = cityName;
    cityItem.addEventListener('click', () => fetchForecast(cityId));
    cityList.appendChild(cityItem);
}

function fetchForecast(cityId) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
        const forecastData = data.list.slice(0, 5).map(entry => ({
            date: new Date(entry.dt * 1000).toLocaleDateString(),
            weather: entry.weather[0].description,
            temp: entry.main.temp
        }));
        displayForecast(forecastData);
    })
    .catch(error => console.error('Error fetching forecast:', error));
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
        <p>Temperature: ${day.temp}°F</p>
        `;
        forecast.appendChild(card);
    });
}

