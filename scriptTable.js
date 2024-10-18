let weatherData = [];
let currentPage = 0;
const itemsPerPage = 5;

document.getElementById('getWeatherBtn').addEventListener('click', getWeather);
document.getElementById('chatForm').addEventListener('submit', sendChatMessage);

async function fetchWeather(city) {
    const weatherApiKey = 'b58d4385c5306488e79aef856afcb916'; 
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        weatherData = data.list || [];
        currentPage = 0; 
        document.getElementById('cityName').innerText = `Weather Forecast for ${city}`;
        displayWeatherData(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Could not fetch weather data. Please try again.');
    }
}

function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name');
    }
}

function displayWeatherData(data) {
    const tableBody = document.getElementById('weatherTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    if (data.length === 0) {
        alert('No weather data available.');
        return;
    }

    const start = currentPage * itemsPerPage;
    const end = Math.min(start + itemsPerPage, data.length);
    
    for (let i = start; i < end; i++) {
        const entry = data[i];
        const row = tableBody.insertRow();
        const dateCell = row.insertCell(0);
        const tempCell = row.insertCell(1);
        const conditionCell = row.insertCell(2);
        
        dateCell.innerText = new Date(entry.dt * 1000).toLocaleDateString();
        tempCell.innerText = `${entry.main.temp.toFixed(1)} °C`;
        conditionCell.innerText = entry.weather[0].description;
    }

    updatePaginationButtons(data.length);
}

function updatePaginationButtons(totalItems) {
    document.getElementById('prevButton').disabled = currentPage === 0;
    document.getElementById('nextButton').disabled = (currentPage + 1) * itemsPerPage >= totalItems;
}

document.getElementById('prevButton').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayWeatherData(weatherData);
    }
});

document.getElementById('nextButton').addEventListener('click', () => {
    if ((currentPage + 1) * itemsPerPage < weatherData.length) {
        currentPage++;
        displayWeatherData(weatherData);
    }
});

function showTemperaturesAscending(data) {
    if (data.length === 0) {
        alert("No weather data available.");
        return;
    }
    const sortedData = data.slice().sort((a, b) => a.main.temp - b.main.temp);
    currentPage = 0;
    displayWeatherData(sortedData);
}

function showRainyDays(data) {
    const rainyDays = data.filter(entry => entry.weather.some(condition => condition.main.toLowerCase() === 'rain'));
    if (rainyDays.length === 0) {
        alert("No rainy days found in the forecast.");
        return;
    }
    currentPage = 0;
    displayWeatherData(rainyDays);
}

function showHighestTemperature(data) {
    if (data.length === 0) {
        alert("No weather data available.");
        return;
    }
    const highestTempEntry = data.reduce((prev, current) => (prev.main.temp > current.main.temp) ? prev : current);
    currentPage = 0;
    displayWeatherData([highestTempEntry]);
}

function showTemperaturesDescending(data) {
    if (data.length === 0) {
        alert("No weather data available.");
        return;
    }
    const sortedData = data.slice().sort((a, b) => b.main.temp - a.main.temp);
    currentPage = 0;
    displayWeatherData(sortedData);
}

document.getElementById('showAscendingBtn').addEventListener('click', () => showTemperaturesAscending(weatherData));
document.getElementById('showRainyBtn').addEventListener('click', () => showRainyDays(weatherData));
document.getElementById('showHighestBtn').addEventListener('click', () => showHighestTemperature(weatherData));
document.getElementById('showDescendingBtn').addEventListener('click', () => showTemperaturesDescending(weatherData));

async function sendChatMessage(event) {
    event.preventDefault();
    const userInput = document.getElementById('userInput').value;
    if (!userInput) return;

    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
    document.getElementById('userInput').value = '';

    const apiKey = 'AIzaSyASLwfBaYNUj05qf3aRMMZdY19Kc85nos4'; // Replace with your actual Gemini API key
    const apiPrompt = userInput;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: apiPrompt
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        chatbox.innerHTML += `<p><strong>Bot:</strong> ${data.choices[0].text}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
    } catch (error) {
        chatbox.innerHTML += `<p><strong>Error:</strong> Unable to get response from the bot.</p>`;
        console.error('Error communicating with the Gemini API:', error);
    }
}
