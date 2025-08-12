        const API_KEY = '50486d6f11f64c573136dc849cc91026'; 
        
        let currentUnit = 'celsius';
        let currentWeatherData = null;
        
        const elements = {
            cityInput: document.getElementById('city-input'),
            searchBtn: document.getElementById('search-btn'),
            locationBtn: document.getElementById('location-btn'),
            weatherContainer: document.getElementById('weather-container'),
            weatherContent: document.getElementById('weather-content'),
            loading: document.getElementById('loading'),
            errorMsg: document.getElementById('error-msg'),
            weatherIcon: document.getElementById('weather-icon'),
            temperature: document.getElementById('temperature'),
            weatherDescription: document.getElementById('weather-description'),
            cityName: document.getElementById('city-name'),
            windSpeed: document.getElementById('wind-speed'),
            humidity: document.getElementById('humidity'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            celsiusBtn: document.getElementById('celsius-btn'),
            fahrenheitBtn: document.getElementById('fahrenheit-btn')
        };

        async function getWeatherData(city) {
            try {
                
                elements.loading.style.display = 'block';
                elements.weatherContent.style.display = 'none';
                elements.errorMsg.style.display = 'none';
                
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=ru`
                );
                
                const data = await response.json();
                
                if (data.cod !== 200) {
                    throw new Error(data.message || 'Неизвестная ошибка');
                }

                currentWeatherData = data;

                updateWeatherUI(data);
                
                elements.loading.style.display = 'none';
                elements.weatherContent.style.display = 'block';
                
            } catch (error) {
                console.error('Ошибка:', error);
                elements.loading.style.display = 'none';
                elements.errorMsg.style.display = 'block';
                elements.errorMsg.textContent = `Ошибка: ${error.message}`;
            }
        }

        function updateWeatherUI(data) {
            elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
            elements.weatherDescription.textContent = data.weather[0].description;
           
            const temp = currentUnit === 'celsius' ? data.main.temp : (data.main.temp * 9/5) + 32;
            const unit = currentUnit === 'celsius' ? '°C' : '°F';
            elements.temperature.textContent = `${Math.round(temp)}${unit}`;

            elements.windSpeed.textContent = `${data.wind.speed} м/с`;
            elements.humidity.textContent = `${data.main.humidity}%`;
            elements.pressure.textContent = `${data.main.pressure} гПа`;
            elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} км`;
            
            const iconCode = data.weather[0].icon;
            elements.weatherIcon.className = `fas ${getWeatherIcon(iconCode)} weather-icon`;

            updateBackground(iconCode);
        }

        function getWeatherIcon(iconCode) {
            const iconMap = {
                '01d': 'fa-sun', '01n': 'fa-moon',
                '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
                '03d': 'fa-cloud', '03n': 'fa-cloud',
                '04d': 'fa-cloud', '04n': 'fa-cloud',
                '09d': 'fa-cloud-rain', '09n': 'fa-cloud-rain',
                '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain',
                '11d': 'fa-bolt', '11n': 'fa-bolt',
                '13d': 'fa-snowflake', '13n': 'fa-snowflake',
                '50d': 'fa-smog', '50n': 'fa-smog'
            };
            return iconMap[iconCode] || 'fa-cloud';
        }

        function updateBackground(iconCode) {
            const body = document.body;
            const weatherType = iconCode.substring(0, 2);
            
            const backgrounds = {
                '01': 'linear-gradient(135deg, #ff7e5f, #feb47b)', // Ясно
                '02': 'linear-gradient(135deg, #74b9ff, #0984e3)', // Облачно
                '03': 'linear-gradient(135deg, #636e72, #2d3436)', // Пасмурно
                '04': 'linear-gradient(135deg, #636e72, #2d3436)', // Пасмурно
                '09': 'linear-gradient(135deg, #74b9ff, #0984e3)', // Дождь
                '10': 'linear-gradient(135deg, #74b9ff, #0984e3)', // Дождь
                '11': 'linear-gradient(135deg, #fdcb6e, #e17055)', // Гроза
                '13': 'linear-gradient(135deg, #dfe6e9, #b2bec3)', // Снег
                '50': 'linear-gradient(135deg, #636e72, #2d3436)'  // Туман
            };
            
            body.style.background = backgrounds[weatherType] || backgrounds['01'];
        }

        elements.searchBtn.addEventListener('click', () => {
            const city = elements.cityInput.value.trim();
            if (city) getWeatherData(city);
        });

        elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && elements.cityInput.value.trim()) {
                getWeatherData(elements.cityInput.value.trim());
            }
        });

        elements.locationBtn.addEventListener('click', getWeatherByLocation);

        elements.celsiusBtn.addEventListener('click', () => {
            if (currentUnit !== 'celsius') {
                currentUnit = 'celsius';
                elements.celsiusBtn.classList.add('active');
                elements.fahrenheitBtn.classList.remove('active');
                if (currentWeatherData) {
                    updateWeatherUI(currentWeatherData);
                }
            }
        });

        elements.fahrenheitBtn.addEventListener('click', () => {
            if (currentUnit !== 'fahrenheit') {
                currentUnit = 'fahrenheit';
                elements.fahrenheitBtn.classList.add('active');
                elements.celsiusBtn.classList.remove('active');
                if (currentWeatherData) {
                    updateWeatherUI(currentWeatherData);
                }
            }
        });

        function getWeatherByLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                    },
                    error => {
                        console.error('Геолокация недоступна:', error);
                        getWeatherData('Moscow');
                    }
                );
            } else {
                getWeatherData('Moscow');
            }
        }

        async function getWeatherByCoords(lat, lon) {
            try {
                elements.loading.style.display = 'block';
                elements.weatherContent.style.display = 'none';
                elements.errorMsg.style.display = 'none';
                
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=ru`
                );
                const data = await response.json();
                
                if (data.cod !== 200) {
                    throw new Error(data.message || 'Неизвестная ошибка');
                }
                
                currentWeatherData = data;
                updateWeatherUI(data);
                elements.loading.style.display = 'none';
                elements.weatherContent.style.display = 'block';
            } catch (error) {
                console.error('Ошибка геолокации:', error);
                getWeatherData('Moscow');
            }
        }

        window.addEventListener('load', getWeatherByLocation);