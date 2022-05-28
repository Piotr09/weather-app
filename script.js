const input = document.querySelector('input')
const button = document.querySelector('button')
const city = document.querySelector('.full-forecast__current h3')
const warning = document.querySelector('.warning')
const photo = document.querySelector('.full-forecast__current img')
const mainWeather = document.querySelector('.full-forecast__current--weather')
const country = document.querySelector('.full-forecast__current--country')
const mainTemperature = document.querySelector('.full-forecast__current--temperature')
const humidity = document.querySelector('.full-forecast__current--humidity')
const nextDays = document.querySelector('.full-forecast__next-days')
const nextDaysDate = document.querySelectorAll('.full-forecast__next-days--date')
const nextDaysIcon = document.querySelectorAll('.full-forecast__next-days li img')
const nextDaysTemparature = document.querySelectorAll('.full-forecast__next-days--temperature')

const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct?q='
const WEATHER_URL = 'https://api.weatherapi.com/v1/forecast.json?key='
const API_TOKEN = 'e9f9eb83f1c04a2a85f174418222605'
OPEN_WEATHER_API_TOKEN = '&appid=9b8e273d9d1f44fac5fc9ea06dc377db&units=metric'

async function getCity() {
    const defaultCity = 'Warszawa'
    const cityName = input.value || defaultCity
    const URL = GEOCODING_URL + cityName + OPEN_WEATHER_API_TOKEN
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
        country.textContent = cityData[0].country

        const FORECAST_URL = `${WEATHER_URL}${API_TOKEN}&q=${lat},${lon}&days=7&lang=pl`
        
        axios.get(FORECAST_URL).then(res => {
            const temp = Math.round(res.data.current.temp_c)
            const hum = res.data.current.humidity
            const status = res.data.current.condition
            const wind = res.data.current.wind_kph
            const nextDaysForecast = res.data.forecast.forecastday

            mainTemperature.textContent = `${temp}℃`
            humidity.innerHTML = `💦 ${hum}% / 💨 ${Math.floor(wind)}<span class='smaller-unit'>km/h</span>`
            mainWeather.textContent =  status.text
            photo.setAttribute('src', `https:${status.icon}`) 
            photo.setAttribute('alt', `https:${status.text}`) 
  
            const getDayName = (date) => {
                const newDate = new Date(date);
                return newDate.toLocaleDateString('pl-PL', { weekday: 'long' })
            }

            const nextDaysWeather = () => {
                for(i=0; i<nextDaysForecast.length; i++) {
                nextDaysDate[i].textContent =  getDayName(nextDaysForecast[i].date) 
                nextDaysIcon[i].setAttribute('src', `https:${nextDaysForecast[i].day.condition.icon}`)
                nextDaysIcon[i].setAttribute('alt', nextDaysForecast[i].day.condition.text)
                nextDaysTemparature[i].innerHTML = `${Math.floor(nextDaysForecast[i].day.maxtemp_c)}℃ / ${Math.floor(nextDaysForecast[i].day.maxwind_kph)}<span class='smaller-unit'>km/h</span>`
            }
            }

            nextDaysWeather()
        })
    }
}

const searchByEnter = e => {
    e.key === 'Enter' && getWeather()
}

getWeather()
button.addEventListener('click', getWeather)
input.addEventListener('keyup', searchByEnter)