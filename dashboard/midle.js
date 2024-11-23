// switch between Air / today / tomorrow /Forecast
let options = document.querySelectorAll(".option")
options.forEach(option => {
  option.addEventListener("click", _ => {
    options.forEach(op => op.classList.remove("active"))
    option.classList.add("active")
    document.querySelector(".options").classList.remove("forecast", "air")
    document.querySelector(".options").classList.add(option.innerHTML.split(" ")[0].toLowerCase())

    if (option.innerHTML.split(" ")[0].toLowerCase() === "air") {
      document.querySelector(".main-air").style.display = "flex"
      document.querySelector(".dates").style.display = "none"
      document.querySelectorAll(".main").forEach(main => main.classList.remove("active"))
    } else {
      document.querySelector(".main-air").style.display = "none"
      document.querySelector(".dates").style.display = "flex"
      let lastActive = document.querySelector(".date.active").classList[1]
      document.querySelector(`.main.${lastActive}`).classList.add("active")
    }
  })
})
// activating main while clicking on its date ( today / tomorrow / forecast )
document.querySelectorAll(".date").forEach(date => {
  date.addEventListener("click", _ => {
    document.querySelectorAll(".date").forEach(date => date.classList.remove("active"))
    date.classList.add("active")

    document.querySelectorAll(".main").forEach(main => main.classList.remove("active"))
    let main = document.querySelector(`.main.${date.classList[1]}`)
    main.classList.add("active")
  })
})

// imports
import {datetoName, getBoxData, airColor, uvColor, getTime, convert12From} from "../utilities.js"
import {mainWeatherConditions, aqiImage, maxAirValues, forecastWeatherConditions, nightImages} from "../dicts.js"
import {getData} from "../api.js" // main fetching function
// default
export function getUserCords() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        succ => resolve(`${succ.coords.latitude} ${succ.coords.longitude}`),
        fail => resolve("london")
      )
    }else{
      resolve("london")
    }
  })
}
let defaultPlace = await getUserCords()
let [data, weekData, hoursData] = await getData(defaultPlace) // default data that will be showed first to the user
document.querySelector("header .left-part .location .loc-name").innerHTML = `${data.location.name}, <span>${data.location.country}</span>`

// getting the right image based on the mode (dark / light)
let imagePack = document.querySelector(".mode").classList[1] // dark or light
export function updateImagePack() {
  imagePack = document.querySelector(".mode").classList[1]
}
// Updating
export async function UpdateMidle(value = "") {
  ;[data, weekData, hoursData] = await getData(value) // new data !
  forecastType = document.querySelector(".forecast-type").classList[1]
  let lastActiveIndex = Array.from(document.querySelector(".midle .left-part .main.week").children).indexOf(document.querySelector(".day.active"))
  displayWeek() // displaying fetched data and creating new boxes
  addBoxInteractions() // making new boxes interactive
  makeActive(document.querySelectorAll(".day")[lastActiveIndex]) // activate the first box
  // air changes
  airData = data.current.air_quality // update data
  updateAir() // update the air values
  // today changes
  showDay(document.querySelector(".main.today"), data.current, data.current)
  // tommorow changes
  showDay(document.querySelector(".main.tomorrow"), data.forecast.forecastday[1].day, data.forecast.forecastday[1].hour[13])
  // C <=> F
  allConvertable()
  // graph of chances of rain
  showRainGraph()
  // changing to a new name city on the DOM
  document.querySelector("header .left-part .location .loc-name").innerHTML = `${data.location.name}, <span>${data.location.country}</span>`
}
let windImage = "/images/weather/simboles/arrow.png"
let weatherType = "normal" // normal or wind
////////////////         Today + Tommorow          ///////////////
function showDay(box, data, data2) {
  // infos vary taking care of today or tomorrow
  // infos to show to the user for data ( left / right )
  let temp, tempClass // getting correct temp unit ( value )
  if (box.children.length > 0 && box.children[2].children[0].classList.contains("F")) {
    temp = Math.round(data.temp_f ? data.temp_f : data.avgtemp_f) + " °F"
    tempClass = "F"
  } else {
    temp = Math.round(data.temp_c ? data.temp_c : data.avgtemp_c) + " °C"
    tempClass = "C"
  }
  let vis = data.vis_km ? data.vis_km : data.avgvis_km
  let humidity = data.humidity ? data.humidity : data.avghumidity
  let uv = data.uv
  let wind = data.wind_kph ? data.wind_kph : data.maxwind_kph
  let text = data.condition.text

  // infos to show to the user for data2 ( class : more )
  let current = data.wind_kph ? true : false
  let dateNumbers = data2.last_updated ? data2.last_updated : data2.time
  let date = current ? "Current" : `${dateNumbers.slice(8, 10)} ${new Date(dateNumbers.slice(5, 7)).toLocaleString("en", {month: "short"})} ${dateNumbers.slice(0, 4)}`
  // setting thev img based on the theme / mode and text
  let img = filterImage(data.condition.code, data.is_day, mainWeatherConditions)
  console.log(data)
  if (weatherType==="wind"){
    img = windImage
  }
  // setting vis img
  let visImg
  if (data.is_day === undefined) {
    visImg = "/images/weather/big images/vis2.png"
  } else {
    visImg = "/images/weather/big images/vis.png"
  }
  // filling 
  box.innerHTML = `
					<div class="day-bg">
						<img src="/images/weather/big images/sun.png" class="sun">
						<div class="wave"></div>
						<div class="wave1"></div>
						<div class="wave2"></div>
					</div>
					<div class="night-bg">
						<img src="/images/weather/big images/moon.png" alt="" class="moon">
					</div>
					<div class="left">
						<div class="temperature ${tempClass}">${temp}</div>
						<div class="infos">
							<div class="box humidity">
								<img src="/images/weather/big images/wind.png" alt="" class="icon">
								<span class="value">${Math.round(humidity)} %</span>
								<span class="text">Humidity</span>
							</div>
							<div class="box vis">
								<img src="${visImg}" alt="" class="icon">
								<span class="value">${Math.round(vis)} Km/h</span>
								<span class="text">Visibility</span>
							</div>
							<div class="box uv">
								<img src="/images/weather/big images/uv.png" alt="" class="icon">
								<span class="value">${Math.round(uv)}</span>
								<span class="text">Ultraviolet</span>
							</div>
							<div class="box wind">
								<img src="/images/weather/simboles/wind.png" alt="" class="icon">
								<span class="value">${Math.round(wind)} Km/h</span>
								<span class="text">Wind Speed</span>
							</div>
						</div>
					</div>
					<div class="more">
						<div class="Date">${date}</div>
						<div class="details">
							<div class="sec">
								<div class="gust_Kph">gust_Kph : <span class="value">${Math.round(data2.gust_kph)} Km/h</span></div>
								<div class="gust_mph">gust_mph : <span class="value">${Math.round(data2.gust_mph)} mph</span></div>
								<div class="pressure_mb">pressure_mb : <span class="value">${Math.round(data2.pressure_mb)} MB</span></div>
								<div class="pressure_in">pressure_in : <span class="value">${Math.round(data2.pressure_in)} in</span></div>
								<div class="dewpoint">dewpoint : <span class="value C">${Math.round(data2.dewpoint_c)} °C</span></div>
							</div>
							<div class="sec">
								<div class="heatindex">heatindex : <span class="value C">${Math.round(data2.heatindex_c)} °C</span></div>
								<div class="feelslike">feelslike : <span class="value C">${Math.round(data2.feelslike_c)} °C</span></div>
								<div class="windchill">windchill : <span class="value C">${Math.round(data2.windchill_c)} °C</span></div>
								<div class="precip_in">precip_in : <span class="value">${Math.round(data2.precip_in)} in</span></div>
								<div class="precip_mm">precip_mm : <span class="value">${Math.round(data2.precip_mm)} mm</span></div>
							</div>
						</div>
					</div>
					<div class="right">
						<div class="image">
							<img src="${img}" alt="" class="weatherImage" data-condition="${data.condition.code}" data-isday="${data.is_day}"> 
							<span class="description">${text}</span>
						</div>
					</div> `
  // day / night chages
  if (data.is_day !== undefined) {
    dayChanges(box, data.is_day)
  }

  // creating and placing stars randomly
  for (let i = 0; i < 3; i++) {
    let star = document.createElement("img")
    star.src = "/images/weather/big images/star.png"
    star.classList.add("star")
    document.querySelector(".night-bg").appendChild(star)
  }
  let stars = document.querySelectorAll(".star")
  stars.forEach(star => {
    Object.assign(star.style, {
      width: `${Math.round(Math.random() * 2)}rem`,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 80 + 60}%`,
      rotate: `${Math.random() * 45}deg`,
    })
  })
}
// change the theme of the day according to the day / night
function dayChanges(box, isDay) {
  if (isDay) {
    box.style.backgroundColor = "#FFD966"
    box.children[0].style.display = "block"
    box.children[1].style.display = "none"
  } else {
    box.style.backgroundColor = ""
    box.children[1].style.display = "block"
    box.children[0].style.display = "none"
  }
}
// update day image according to the mode
export function UpdateBoxImage(box) {
  let boxImage = box.querySelector(".right .image .weatherImage")
  boxImage.src = filterImage(boxImage.dataset.condition, boxImage.dataset.isday, mainWeatherConditions)
}
export function filterImage(code, is_day, imagesDic) {
  let img = imagesDic[imagePack][code]
  let absurdeCodes = [1003, 1006, 1204, 801, 802, 800, 1000]
  if (absurdeCodes.includes(code) && !is_day && is_day !== "undefined" && is_day !== undefined) {
    img = nightImages[imagePack][code]
  }
  return img
}
// default today / tommorow
showDay(document.querySelector(".main.today"), data.current, data.current)
showDay(document.querySelector(".main.tomorrow"), data.forecast.forecastday[1].day, data.forecast.forecastday[1].hour[13])
// C <=> F ( requires classes + has to be box (DOM el))
function convertTemp(temp) {
  temp.addEventListener("click", _ => {
    if (temp.classList.contains("C")) {
      temp.classList.remove("C")
      temp.classList.add("F")
      temp.innerHTML = `${Math.round((Number(temp.innerHTML.slice(0, -2)) * 9) / 5 + 32)} °F`
    } else {
      temp.classList.remove("F")
      temp.classList.add("C")
      temp.innerHTML = `${Math.round(((Number(temp.innerHTML.slice(0, -2)) - 32) * 5) / 9)} °C`
    }
  })
}
// all the time convert while click
function allConvertable() {
  document.querySelectorAll(".temperature").forEach(temp => convertTemp(temp))
  document.querySelectorAll(".dewpoint").forEach(dewpoint => convertTemp(dewpoint.children[0]))
  document.querySelectorAll(".feelslike").forEach(feelslike => convertTemp(feelslike.children[0]))
  document.querySelectorAll(".windchill").forEach(windchill => convertTemp(windchill.children[0]))
  document.querySelectorAll(".heatindex").forEach(heatindex => convertTemp(heatindex.children[0]))
}
allConvertable()
////////////////          forecast ( days / hours )          ///////////////
let forecastType = document.querySelector(".forecast-type").classList[1]
function gettingForecastData() {
  let forecastData
  if (forecastType === "days") {
    return (forecastData = weekData.data.slice(1, 8))
  } else {
    return hoursData.data.slice(0, 7)
  }
}
function displayWeek() {
  document.querySelector(".midle .left-part .main.week").innerHTML = "" // clean the week box to add new data boxes

  // getting right loop over forecast data ( days or hours )
  let forecastData = gettingForecastData()

  // placing the first boxes according to the data first is the current day
  forecastData.forEach(elementData => {
    // getting right label
    let label, shortLabel, is_day
    if (forecastType === "hours") {
      let time = Number(elementData.timestamp_local.slice(11, 13))
      label = convert12From(time)
      shortLabel = label
      is_day = elementData.pod === "d" ? 1 : 0
    } else {
      label = datetoName(elementData.datetime.slice(0, 10))
      shortLabel = label.slice(0, 3)
      is_day = 1
    }

    const boxDay = document.createElement("div")
    boxDay.innerHTML = `
        <span class="abr">${shortLabel}</span>
        <img src="${filterImage(elementData.weather.code, is_day, forecastWeatherConditions)}" alt="" class="weather-img" />
        <div class="temp">${Math.round(elementData.temp)}°</div>
        `
    boxDay.classList.add("day", label, shortLabel)
    document.querySelector(".midle .left-part .main.week").appendChild(boxDay)
  })
}
displayWeek() // display the default data

// add events to the days so can be activate or unactivate (as a function so new created days can also be manupilated)
function addBoxInteractions() {
  let boxes = document.querySelectorAll(".midle .left-part .main.week .day")
  boxes.forEach(box => {
    box.addEventListener("click", _ => {
      resetBoxes()
      makeActive(box)
    })
  })
}
addBoxInteractions() // making default boxes interactive

// making active function
function makeActive(box) {
  box.classList.add("active")
  // getting right forecast data type to get this box's data from
  let rightInfo1, rightInfo2, rightInfo1Name, rightInfo2Name,is_day
  let forecastData = gettingForecastData()

  let data = getBoxData(box, forecastData)
  let month = new Date(data.datetime.slice(5, 7)).toLocaleString("en", {month: "short"})

  // getting if we display sun(rise/set) or could high low
  if (forecastType === "days") {
    rightInfo1Name = "Sunrise"
    rightInfo1 = getTime(data.sunrise_ts, weekData.timezone)
    rightInfo2Name = "Sunset"
    rightInfo2 = getTime(data.sunset_ts, weekData.timezone)
    is_day = 1
  } else {
    rightInfo1Name = "Clouds High"
    rightInfo1 = data.clouds_hi + "%"
    rightInfo2Name = "Clouds Low"
    rightInfo2 = data.clouds_low + "%"
    is_day = data.pod === "d" ? 1 : 0
  }

  box.innerHTML = `
        <div class="top">
            <h3 class="name">${box.classList[1]}</h3>
            <span class="month">${month} ${data.datetime.slice(8, 10)}</span>
        </div>
        <div class="bottom">
            <div class="left">
                <div class="temp">${Math.round(data.temp)}°</div>
                <div class="info">
                    <p>Real Feel<span class="number"> : ${Math.round(data.app_max_temp ? (data.app_max_temp + data.min_temp) / 2 : data.app_temp)}°</span></p>
                    <p>Wind<span class="number"> : ${Math.round(data.wind_spd * 3.6)} Km/h</span></p>
                    <p>Pressure<span class="number"> : ${Math.round(data.pres)}MB</span></p>
                    <p>Humidity<span class="number"> : ${Math.round(data.rh)}%</span></p></div>
                </div>
            <div class="rigth">
                <img src="${filterImage(data.weather.code,is_day,forecastWeatherConditions)}" alt="" class="weather-img"/>
                <div class="info">
                    <p>${rightInfo1Name}<span class="number"> : ${rightInfo1}</span></p>
                    <p>${rightInfo2Name}<span class="number"> : ${rightInfo2}</span></p>
                </div>
            </div>
        </div>
    `
}
makeActive(document.querySelectorAll(".day")[0]) // default active

// reset Boxes function ( so the active will be unactive )
function resetBoxes() {
  let boxes = document.querySelectorAll(".midle .left-part .main.week .day")
  boxes.forEach(box => {
    box.classList.remove("active")
    // getting right box data 
    let forecastData
    let is_day = 1
    if (forecastType === "days") {
      forecastData = weekData.data.slice(1, 8)
    } else {
      forecastData = hoursData.data.slice(0, 7)
    }
    let finalData = getBoxData(box, forecastData)
    if (finalData.pod==="n"&&forecastType==="hours") is_day = 0

    box.innerHTML = `
            <span class="abr">${box.classList[2] ? box.classList[2] : box.classList[1]}</span>
            <img src="${filterImage(finalData.weather.code,is_day,forecastWeatherConditions)}" alt="" class="weather-img" />
            <div class="temp">${Math.round(finalData.temp)}°</div>
        `
  })
}

export {makeActive, resetBoxes} // exporting updating week functions so to maintain dynamic changes

////////////////          AIR          ///////////////
let chartsArr = []
let airData = data.current.air_quality
function displayAir() {
  // weather info
  let chartInfo = document.querySelectorAll(".main-air .infos .col .box .info")
  chartInfo.forEach(canvas => {
    let type = canvas.classList[1]
    let data = airData[type.toLowerCase()] // the data to display on DOM

    // add the number value
    canvas.parentElement.parentElement.children[0].innerHTML = Math.round(data)
    let percentage = (data / maxAirValues[type]) * 100
    // show data in form of a chart ( for the infos )
    let semiDoughnut = new Chart(canvas, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [percentage, 100 - percentage],
            backgroundColor: [airColor((data / maxAirValues[type]) * 100)[0], airColor((data / maxAirValues[type]) * 100)[1]],
            borderWidth: 0,
          },
        ],
      },
      options: {
        layout: {
          padding: {bottom: 5},
        },
        rotation: -90,
        circumference: 180,
        cutout: "80%",
        animation: false,
        tooltip: {enabled: false},
        plugins: {
          legend: {display: false},
        },
      },
    })
    chartsArr.push(semiDoughnut)
  })
  // weather aqi index
  let aqi_index = airData["gb-defra-index"]
  document.querySelector(".aqi-image").src = aqiImage[aqi_index][0]
  document.querySelector(".main-air .aqi .aqi-index .infos .number").innerHTML = aqi_index
  document.querySelector(".main-air .aqi .aqi-index .infos .description").innerHTML = aqiImage[aqi_index][1]
  // uv forecast
  let uvData = gettingForecastData()
  uvForecast(uvData)
}
displayAir() // default display of air

// update function after search
function updateAir() {
  // air info
  chartsArr.forEach(chart => {
    let type = chart.canvas.classList[1]
    let data = airData[type.toLowerCase()]
    chart.canvas.parentElement.parentElement.children[0].innerHTML = Math.round(data)

    let percentage = (data / maxAirValues[type]) * 100
    chart.config._config.data.datasets[0].data = [percentage, 100 - percentage]
    chart.config._config.data.datasets[0].backgroundColor = [airColor((data / maxAirValues[type]) * 100)[0], airColor((data / maxAirValues[type]) * 100)[1]]
    chart.update()
  })
  // weather aqi index
  let aqi_index = airData["gb-defra-index"]
  document.querySelector(".aqi-image").src = aqiImage[aqi_index][0]
  document.querySelector(".main-air .aqi .aqi-index .infos .number").innerHTML = aqi_index
  document.querySelector(".main-air .aqi .aqi-index .infos .description").innerHTML = aqiImage[aqi_index][1]
  // uv forecast
  let uvData = gettingForecastData()
  uvForecast(uvData)
}
function uvForecast(uvData) {
  let i = 0
  uvData.forEach(elementData => {
    if (i < 3) {
      let uvValue = Math.round(elementData.uv)
      let progress = document.querySelectorAll(".main-air .UV-forecast .box")[i].children[0].children[0]
      progress.style.width = `${(uvValue / 13) * 100}%`
      progress.style.backgroundColor = uvColor(uvValue)[0]
      progress.parentElement.style.backgroundColor = uvColor(uvValue)[1]
      progress.parentElement.parentElement.children[1].children[0].innerHTML = uvValue
      if (forecastType === "days") {
        progress.parentElement.parentElement.children[1].children[1].innerHTML = ` ${new Date(elementData.datetime.slice(5, 7)).toLocaleString("en", {month: "short"})} ${elementData.datetime.slice(8, 10)}`
      } else {
        progress.parentElement.parentElement.children[1].children[1].innerHTML = ` ${convert12From(Number(elementData.timestamp_local.slice(11, 13)))}`
      }
      i++
    }
  })
}
////////////////          Chances of Rain          ///////////////
export function showRainGraph() {
  document.querySelector(".midle .right-part .Chance-of-rain .Xaxis").innerHTML = ""
  // getting right data
  let forecastData = gettingForecastData()

  forecastData.forEach(elementData => {
    let chanceOfRain = (elementData.pop / 86) * 100
    let axe = document.createElement("div")
    axe.classList.add("axe")

    let date, is_day
    if (forecastType === "hours") {
      let time = Number(elementData.timestamp_local.slice(11, 13))
      date = convert12From(time)
      is_day = elementData.pod === "d" ? 1 : 0
    } else {
      date = datetoName(elementData.datetime.slice(0, 11)).slice(0, 3)
      is_day = 1
    }

    if (chanceOfRain > 0) {
      // chance of precip
      axe.innerHTML = `<div class="progress"></div><span>${date}</span>`
      axe.children[0].style.height = `${chanceOfRain}%`
    } else {
      // no precip ( showing that its rainy but other weather condition )
      axe.innerHTML = `<img src="${filterImage(elementData.weather.code, is_day, forecastWeatherConditions)}"><span>${date}</span>`
    }
    document.querySelector(".midle .right-part .Chance-of-rain .Xaxis").appendChild(axe)
  })
}
showRainGraph()
