const input = document.querySelector('input')
const background = document.querySelector('.background')
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
const uv = document.querySelector('.uv__number')
const uvIndexPoint = document.querySelector('.uv__point')
const uvIndexLevel = document.querySelector('.uv__level')
const sunrisePoint = document.querySelector('.sunrise__bar')
const sunriseHour = document.querySelector('.sunrise__hour')
const sunsetHour = document.querySelector('.sunset__hour')
const rain = document.querySelector('.rain__hour')
const windArrow = document.querySelector('.wind__arrow hr')
const humidityPercent = document.querySelector('.hum__number')
const saveLocationButton = document.querySelector('.save-location')

const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct?q='
const GEOCODING_REVERSE_URL = 'http://api.openweathermap.org/geo/1.0/reverse?'
const WEATHER_URL = 'https://api.weatherapi.com/v1/forecast.json?key='
const API_TOKEN = 'e9f9eb83f1c04a2a85f174418222605'
OPEN_WEATHER_API_TOKEN = '&appid=9b8e273d9d1f44fac5fc9ea06dc377db&units=metric'

async function getCity() {
    const latValue = JSON.parse(localStorage.getItem('lat'));
    const lonValue = JSON.parse(localStorage.getItem('lon'));
    let savedCity
    if (latValue !== null && lonValue !== null) {
        const URL = GEOCODING_REVERSE_URL + 'lat=' + latValue + '&lon=' + lonValue + '&limit=1' + OPEN_WEATHER_API_TOKEN
        let response = await fetch(URL)
        let data = await response.json()
        savedCity = data[0].local_names.pl;
    }
    const defaultCity = 'Warszawa'
    const cityName = input.value || savedCity || defaultCity
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

let lat
let lon

async function getWeather() {
    cityData = await getCity()
    if (cityData !== undefined) {
        let lat = cityData[0].lat
        let lon = cityData[0].lon

        city.textContent = cityData[0].local_names.pl ? cityData[0].local_names.pl : cityData[0].name
        country.textContent = cityData[0].country

        const FORECAST_URL = `${WEATHER_URL}${API_TOKEN}&q=${lat},${lon}&days=7&lang=pl`

        axios.get(FORECAST_URL).then(res => {
            const hum = res.data.current.humidity
            const wind = res.data.current.wind_kph
            const status = res.data.current.condition
            const uvIndex = res.data.current.uv
            const windDegree = res.data.current.wind_degree;
            windArrow.style.transform = `rotate(${windDegree}deg)`
            const sunrise = Number(res.data.forecast.forecastday[0].astro.sunrise.slice(0, 2)) + ":" + Number(res.data.forecast.forecastday[0].astro.sunrise.slice(3, 5))
            const sunset = (Number(res.data.forecast.forecastday[0].astro.sunset.slice(0, 2)) + 13) + ":" + Number(res.data.forecast.forecastday[0].astro.sunset.slice(3, 5));
            const sunriseTime = Number(res.data.forecast.forecastday[0].astro.sunrise.slice(0, 2)) * 60 + Number(res.data.forecast.forecastday[0].astro.sunrise.slice(3, 5));
            const sunsetTime = (Number(res.data.forecast.forecastday[0].astro.sunset.slice(0, 2)) + 13) * 60; + Number(res.data.forecast.forecastday[0].astro.sunset.slice(3, 5));
            let time = Number(res.data.current.last_updated.slice(11, 13)) * 60 + Number(res.data.current.last_updated.slice(14, 15));
            const temp = `${Math.round(res.data.current.temp_c)}°`
            const hunAndWind = `💦 ${hum}% / 💨 ${Math.floor(wind)}<span class='smaller-unit'>km/h</span>`
            const dayProgress = Math.round(((time - sunriseTime) * 100) / (sunsetTime - sunriseTime))
            sunrisePoint.style.transform = "rotate(" + (45 + (dayProgress * 1.8)) + "deg)"
            const styleElem = document.createElement("style");
            styleElem.id = 'style-tag'
            const styleTag = document.getElementById('style-tag');

            if (dayProgress < 0 || dayProgress > 100) {
                styleElem.innerHTML = ".sunrise__bar:before {background: #3d4d82; box-shadow: 0 0 0.3rem 0.3rem #5f71b0;}";
                document.getElementsByTagName('head')[0].appendChild(styleElem);
            } else {
                styleTag && document.getElementsByTagName('head')[0].removeChild(styleTag);
            }

            const hourByHours = res.data.forecast.forecastday[0].hour.filter(item => item.time.slice(11, 13) * 60 >= time);
            if (hourByHours.length < 24) {
                const filteredElements = res.data.forecast.forecastday[1].hour.slice(hourByHours.length, 23)
                hourByHours.push(...filteredElements)
            }

            const HTML = [...hourByHours].map(item => `<li><span>${item.time?.slice(11, 16)}</span><img src="https://${item?.condition?.icon}"><span><b>${Math.round(item.temp_c)}°</b></span></li>`).join('');
            document.getElementById("item-list").innerHTML = '<ul>' + HTML + '</ul>'

            const currentWeatherMain = () => {
                mainTemperature.textContent = temp
                humidity.innerHTML = hunAndWind
                mainWeather.textContent = status.text
                uv.textContent = uvIndex
                sunriseHour.textContent = sunrise
                sunsetHour.innerHTML = `zachód ${sunset}`
                humidityPercent.textContent = hum + "%"
                uvIndexPoint.style.left = uvIndex / 12 * 100 + "%";
                if (uvIndex <= 2) {
                    uvIndexLevel.textContent = "Niski"
                } else if (uvIndex >= 3 && uvIndex <= 5) {
                    uvIndexLevel.textContent = "Średni"
                } else if (uvIndex >= 6 && uvIndex <= 7) {
                    uvIndexLevel.textContent = "Wysoki"
                } else if (uvIndex >= 8 && uvIndex <= 10) {
                    uvIndexLevel.textContent = "Bardzo wysoki"
                } else {
                    uvIndexLevel.textContent = "Ekstremalny"
                }

                switch (status.code) {
                    case 1000:
                        if (time > sunsetTime - 60 && time <= sunsetTime + 60) {
                            background.style.backgroundImage = "url('img/1000-sunset.jpg')";
                        } else if (time > sunriseTime - 60 && time <= sunriseTime + 60) {
                            background.style.backgroundImage = "url('img/1000-sunrise.jpg')";
                        } else if (time > sunriseTime + 60 && time <= sunsetTime - 60) {
                            background.style.backgroundImage = "url('img/1000.jpg')";
                        } else {
                            background.style.backgroundImage = "url('img/1000-night.jpg')";
                        }
                        break;
                    case 1003:
                        if (time > sunsetTime - 60 && time <= sunsetTime + 60) {
                            background.style.backgroundImage = "url('img/1003-sunset.jpg')";
                        } else if (time > sunriseTime - 60 && time <= sunriseTime + 60) {
                            background.style.backgroundImage = "url('img/1003-sunrise.jpg')";
                        } else if (time > sunriseTime + 60 && time <= sunsetTime - 60) {
                            background.style.backgroundImage = "url('img/1003.jpg')";
                        } else {
                            background.style.backgroundImage = "url('img/1003-night.jpg')";
                        }
                        break;
                    case 1009:
                        if (time > sunsetTime - 60 && time <= sunsetTime + 60) {
                            background.style.backgroundImage = "url('img/1009-sunset.jpg')";
                        } else if (time > sunriseTime - 60 && time <= sunriseTime + 60) {
                            background.style.backgroundImage = "url('img/1009-sunrise.jpg')";
                        } else if (time > sunriseTime + 60 && time <= sunsetTime - 60) {
                            background.style.backgroundImage = "url('img/1009.jpg')";
                        } else {
                            background.style.backgroundImage = "url('img/1009-night.jpg')";
                        }
                        break;
                    case 1183:
                        if (time > sunsetTime - 60 && time <= sunsetTime + 60) {
                            background.style.backgroundImage = "url('img/1183.jpg')";
                        } else if (time > sunriseTime - 60 && time <= sunriseTime + 60) {
                            background.style.backgroundImage = "url('img/1183.jpg')";
                        } else if (time > sunriseTime + 60 && time <= sunsetTime - 60) {
                            background.style.backgroundImage = "url('img/1183.jpg')";
                        } else {
                            background.style.backgroundImage = "url('img/1183-night.jpg')";
                        }
                        break;
                    case 1189:
                        if (time > sunsetTime - 60 && time <= sunsetTime + 60) {
                            background.style.backgroundImage = "url('img/1189.jpg')";
                        } else if (time > sunriseTime - 60 && time <= sunriseTime + 60) {
                            background.style.backgroundImage = "url('img/1189.jpg')";
                        } else if (time > sunriseTime + 60 && time <= sunsetTime - 60) {
                            background.style.backgroundImage = "url('img/1189.jpg')";
                        } else {
                            background.style.backgroundImage = "url('img/1189-night.jpg')";
                        }
                        break;
                    default:
                    // to be continued
                }

            }

            currentWeatherMain()
            const getDayName = (date) => {
                const newDate = new Date(date);
                return newDate.toLocaleDateString('pl-PL', { weekday: 'long' })
            }
            const nextDaysForecast = res.data.forecast.forecastday
            const nextDaysWeather = e => {
                nextDaysDate[0].textContent = getDayName(nextDaysForecast[0].date)
                nextDaysIcon[0].setAttribute('src', `https:${status.icon}`)
                nextDaysTemparature[0].innerHTML = `${temp} / ${Math.floor(wind)}<span class='smaller-unit'>km/h</span>`
                for (let i = 1; i < nextDaysForecast.length; i++) {
                    nextDaysDate[i].textContent = getDayName(nextDaysForecast[i].date)
                    nextDaysIcon[i].setAttribute('src', `https:${nextDaysForecast[i].day.condition.icon}`)
                    nextDaysIcon[i].setAttribute('alt', nextDaysForecast[i].day.condition.text)
                    nextDaysTemparature[i].innerHTML = `${Math.floor(nextDaysForecast[i].day.maxtemp_c)}℃ / ${Math.floor(nextDaysForecast[i].day.maxwind_kph)}<span class='smaller-unit'>km/h</span>`
                }
            }

            nextDaysWeather()

            nextDays.onclick = function (e) {
                var li = e.target.closest('li');
                var nodes = Array.from(li.closest('ul').children);
                var index = nodes.indexOf(li);
                if (index === 0) {
                    currentWeatherMain()
                } else {
                    mainTemperature.textContent = `${Math.floor(nextDaysForecast[index].day.maxtemp_c)}°`
                    mainWeather.textContent = nextDaysForecast[index].day.condition.text
                    humidity.innerHTML = `💦 ${nextDaysForecast[index].day.avghumidity}% / 💨 ${Math.floor(nextDaysForecast[index].day.maxwind_kph)}<span class='smaller-unit'>km/h</span>`
                }
            };
        })
    }
}
const saveLocation = () => {
    localStorage.setItem('lat', cityData[0].lat);
    localStorage.setItem('lon', cityData[0].lon);
}

const searchByEnter = e => {
    e.key === 'Enter' && getWeather()
}

getWeather()
button.addEventListener('click', getWeather)
input.addEventListener('keyup', searchByEnter)
