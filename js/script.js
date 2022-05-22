const input = document.querySelector('input')
const button = document.querySelector('button')
const city = document.querySelector('.city-name')
const warning = document.querySelector('.warning')
const photo = document.querySelector('.photo')
const weather = document.querySelector('.weather')
const temperature = document.querySelector('.temperature')
const humidity = document.querySelector('.humidity')

const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct?q='
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?'
API_TOKEN = '&appid=9b8e273d9d1f44fac5fc9ea06dc377db&units=metric'


async function getCity() {
    const defaultCity = 'Warszawa'
    const cityName = input.value || defaultCity
    const URL = GEOCODING_URL + cityName + API_TOKEN
    let response = await fetch(URL)
    let data = await response.json()

    if (data[0] !== undefined) {
        input.value = ''
        warning.textContent = ''
        return data;
    } else {
        warning.textContent = 'Wpisz poprawną nazwę miasta'
    }
}


async function getWeather() {

    cityData = await getCity()

    if (cityData !== undefined) {

        let lat = cityData[0].lat
        let lon = cityData[0].lon

        city.textContent = cityData[0].local_names.pl ? cityData[0].local_names.pl : cityData[0].name

        const FORECAST_URL = `${WEATHER_URL}lat=${lat}&lon=${lon}${API_TOKEN}`

        axios.get(FORECAST_URL).then(res => {
            const temp = Math.round(res.data.main.temp)
            const hum = res.data.main.humidity
            const status = Object.assign({}, ...res.data.weather)

            temperature.textContent = temp + '℃'
            humidity.textContent = hum + '%'
            weather.textContent = status.main

            switch (true) {
                case status.id >= 200 && status.id < 300:
                    return photo.textContent = '🌩'
                    break;
                case status.id >= 300 && status.id < 400:
                    return photo.textContent = '🌧'
                    break;
                case status.id >= 500 && status.id < 600:
                    return photo.textContent = '🌧'
                    break;
                case status.id >= 600 && status.id < 700:
                    return photo.textContent = '🌨'
                    break;
                case status.id >= 700 && status.id < 800:
                    return photo.textContent = '🌫'
                    break;
                case status.id === 800:
                    return photo.textContent = '☀️'
                    break;
                case status.id >= 800 && status.id < 900:
                    return photo.textContent = '☁️'
                    break;
                default:
                    // return photo.setAttribute('src', './img/unknown.png')
                    break;
            }
        })
    }
}

const searchByEnter = e => {
    e.key === 'Enter' && getWeather()
}


getWeather()
button.addEventListener('click', getWeather)
input.addEventListener('keyup', searchByEnter)