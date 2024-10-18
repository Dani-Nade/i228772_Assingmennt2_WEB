const weatherApiKey = 'b58d4385c5306488e79aef856afcb916';
let currentCity = '';
let forecastData = {};

document.getElementById('getWeatherBtn').addEventListener('click', getWeather);

function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) return alert("Please enter a city name.");
    currentCity = city;
    fetchWeather(city);
}


async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
        const weatherData = await response.json();
        displayWeather(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}
function displayWeather(data) {
    if (data.cod !== 200) {
        alert(data.message);
        return;
    }
    document.getElementById('cityName').innerText = data.name;
    document.getElementById('weatherDescription').innerText = data.weather[0].description;
    document.getElementById('tempValue').innerText = data.main.temp;
    document.getElementById('humidityValue').innerText = data.main.humidity;
    document.getElementById('windSpeedValue').innerText = data.wind.speed;

    localStorage.setItem('currentCity', data.name);

    fetchForecast(currentCity);
}

async function fetchForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`);
        forecastData = await response.json();
        localStorage.setItem('forecastData', JSON.stringify(forecastData));


        if (document.getElementById('cityName')) {
            createCharts(forecastData);
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

function createCharts(forecastData) {
    const labels = forecastData.list.slice(0, 10).map(entry => new Date(entry.dt_txt).toLocaleDateString());
    const temps = forecastData.list.slice(0, 10).map(entry => entry.main.temp);
    const humidities = forecastData.list.slice(0, 10).map(entry => entry.main.humidity);
    const weatherConditions = forecastData.list.slice(0, 10).map(entry => entry.weather[0].description);

    const tempBarChartCtx = document.getElementById('tempBarChart').getContext('2d');
    new Chart(tempBarChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const weatherDoughnutChartCtx = document.getElementById('weatherDoughnutChart').getContext('2d');
    new Chart(weatherDoughnutChartCtx, {
        type: 'doughnut',
        data: {
            labels: weatherConditions,
            datasets: [{
                label: 'Weather Conditions',
                data: humidities,
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    const tempLineChartCtx = document.getElementById('tempLineChart').getContext('2d');
    new Chart(tempLineChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
