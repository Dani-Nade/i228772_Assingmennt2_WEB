// Define global variables
const weatherApiKey = 'b58d4385c5306488e79aef856afcb916';
let currentCity = '';
let forecastData = {};

// Event Listener for Weather Button
document.getElementById('getWeatherBtn')?.addEventListener('click', getWeather);

// Fetch weather data when user enters a city
function getWeather() {
    const city = document.getElementById('cityInput').value;
    currentCity = city;
    fetchWeather(city);
}

// Fetch weather data from OpenWeather API
async function fetchWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    const weatherData = await response.json();
    displayWeather(weatherData);
}

// Display weather data on the page (only for index.html)
function displayWeather(data) {
    if (document.getElementById('cityName')) {
        document.getElementById('cityName').innerText = data.name;
        document.getElementById('weatherDescription').innerText = data.weather[0].description;
        document.getElementById('tempValue').innerText = data.main.temp;
        document.getElementById('humidityValue').innerText = data.main.humidity;
        document.getElementById('windSpeedValue').innerText = data.wind.speed;
    }

    // Save the city name for table use
    localStorage.setItem('currentCity', data.name);

    // Fetch 5-day forecast for charts and table
    fetchForecast(currentCity);
}

// Fetch forecast data from OpenWeather API
async function fetchForecast(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`);
    forecastData = await response.json();

    // Store forecast data in localStorage for the table page
    localStorage.setItem('forecastData', JSON.stringify(forecastData));

    // Display data if we are on the main dashboard (index.html)
    if (document.getElementById('cityName')) {
        createCharts(forecastData);
    }
}

// Display forecast in the table (only for tables.html)
function displayForecastTable() {
    const storedCity = localStorage.getItem('currentCity');
    const storedForecastData = localStorage.getItem('forecastData');
    
    if (storedCity && storedForecastData) {
        document.getElementById('cityName').innerText = storedCity;
        const forecastData = JSON.parse(storedForecastData);

        const tableBody = document.querySelector('#weatherTable tbody');
        tableBody.innerHTML = '';

        forecastData.list.slice(0, 10).forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${new Date(entry.dt_txt).toLocaleDateString()}</td>
                             <td>${entry.main.temp}</td>
                             <td>${entry.weather[0].description}</td>`;
            tableBody.appendChild(row);
        });
    }
}

// Check which page we are on and display forecast accordingly
if (window.location.href.includes('tables.html')) {
    displayForecastTable();
}

// Create charts using Chart.js (only for index.html)
function createCharts(data) {
    const dates = data.list.map(entry => new Date(entry.dt_txt).toLocaleDateString());
    const temps = data.list.map(entry => entry.main.temp);

    // Vertical Bar Chart
    new Chart(document.getElementById('tempBarChart'), {
        type: 'bar',
        data: {
            labels: dates.slice(0, 5),
            datasets: [{
                label: 'Temperature (°C)',
                data: temps.slice(0, 5),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
    });

    // Doughnut Chart for weather conditions
    const weatherConditions = data.list.slice(0, 5).map(entry => entry.weather[0].main);
    new Chart(document.getElementById('weatherDoughnutChart'), {
        type: 'doughnut',
        data: {
            labels: ['Sunny', 'Cloudy', 'Rainy'],
            datasets: [{
                data: [
                    weatherConditions.filter(c => c === 'Clear').length,
                    weatherConditions.filter(c => c === 'Clouds').length,
                    weatherConditions.filter(c => c === 'Rain').length
                ],
                backgroundColor: ['yellow', 'gray', 'blue']
            }]
        }
    });

    // Line Chart
    new Chart(document.getElementById('tempLineChart'), {
        type: 'line',
        data: {
            labels: dates.slice(0, 5),
            datasets: [{
                label: 'Temperature (°C)',
                data: temps.slice(0, 5),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        }
    });
}
