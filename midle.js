// Air or Forecast
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
// activating main while clicking on its date
document.querySelectorAll(".date").forEach(date => {
	date.addEventListener("click", _ => {
		document.querySelectorAll(".date").forEach(date => date.classList.remove("active"))
		date.classList.add("active")

		document.querySelectorAll(".main").forEach(main => main.classList.remove("active"))
		let main = document.querySelector(`.main.${date.classList[1]}`)
		main.classList.add("active")
	})
})

// imports ( minimalize code )
import {datetoName, getBoxData, airColor, uvColor} from "./utilities.js"
import {weatherConditions, aqiImage, maxAirValues} from "./dicts.js"
import {getData} from "./api.js" // main fetching function
// default
let data = await getData("marrakech") // default data that will be showed first to the user
document.querySelector("header .left-part .location .loc-name").innerHTML = `${data.location.name}, <span>${data.location.country}</span>`

// search listeners
let searchBar = document.querySelector(".search-bar")
let searhcButton = document.querySelector(".search-button")
searhcButton.addEventListener("click", e => {
	if (searchBar.value) {
		OnSearch()
	}
})
document.addEventListener("keyup", e => {
	if (searchBar.value && e.code === "Enter") {
		OnSearch()
	}
})

// changing data trough inputed value ( if there is )
async function OnSearch() {
	data = await getData(searchBar.value) // new data !
	console.log(data)
	// week changes
	weekData = data.forecast.forecastday // update data
	let lastActiveIndex = Array.from(document.querySelector(".midle .left-part .main.week").children).indexOf(document.querySelector(".day.active"))
	displayWeek() // displaying fetched data and creating new boxes
	addBoxInteractions() // making new boxes interactive
	makeActive(document.querySelectorAll(".day")[lastActiveIndex]) // activate the first box
	// air changes
	airData = data.current.air_quality // update data
	updateAir() // update the air values
	// today changes
	showDay(document.querySelector(".main.today"), data.current)
	// tommorow changes
	showDay(document.querySelector(".main.tomorrow"), data.forecast.forecastday[1].day)
	// changing to a new name city on the DOM
	document.querySelector("header .left-part .location .loc-name").innerHTML = `${data.location.name}, <span>${data.location.country}</span>`
}
////////////////         Today + Tommorow          ///////////////
function showDay(box, data) {
	// infos show to the user
	let temp = data.temp_c ? data.temp_c : data.avgtemp_c
	let vis = data.vis_km ? data.vis_km : data.avgvis_km
	let humidity = data.humidity ? data.humidity : data.avghumidity
	let uv = data.uv
	let wind = data.wind_kph ? data.wind_kph : data.maxwind_kph
	let text = data.condition.text
	// setting the img based on the theme / mode and text
	let imagePack = document.querySelector(".mode").classList[1] // dark or light
	let img
	if (data.condition.code === 1000) {
		if (data.is_day) {
			img = "/images/weather/big images/sun.png"
		} else {
			img = "/images/weather/simboles/Group 1214.png"
			text = "Clear"
		}
	} else if ((data.condition.code === 1003 || data.condition.code === 1006 || data.condition.code === 1204) && !data.is_day) {
		if (imagePack === "dark") {
			img = "/images/weather/dark mode/night/Group 5.png"
		} else {
			img = "/images/weather/white mode/night/Group 5.png"
		}
	} else {
		img = weatherConditions[imagePack][data.condition.code]
	}

	box.innerHTML = `
					<div class="day-bg">
						<img src="/images/weather/big images/sun.png" class="sun">
						<div class="wave"></div>
						<div class="wave1"></div>
						<div class="wave2"></div>
					</div>
					<div class="night-bg"></div>
					<div class="left">
						<div class="temp">${Math.round(temp)} °C</div>
						<div class="infos">
							<div class="box humidity">
								<img src="/images/weather/big images/wind.png" alt="" class="icon">
								<span class="value">${humidity}%</span>
								<span class="text">Humidity</span>
							</div>
							<div class="box vis">
								<img src="/images/weather/big images/vis.png" alt="" class="icon">
								<span class="value">${vis}Km/h</span>
								<span class="text">Visibility</span>
							</div>
							<div class="box uv">
								<img src="/images/weather/big images/uv.png" alt="" class="icon">
								<span class="value">${uv}</span>
								<span class="text">Ultraviolet</span>
							</div>
							<div class="box wind">
								<img src="/images/weather/simboles/wind.png" alt="" class="icon">
								<span class="value">${wind}Km/h</span>
								<span class="text">Wind Speed</span>
							</div>
						</div>
					</div>
					<div class="right">
						<div class="image">
							<img src="${img}" alt="" class="weatherImage">
							<span class="description">${text}</span>
						</div>
					</div> `
	// day / night chages
	dayChanges(box,data.is_day)
}
// default today / tommorow
showDay(document.querySelector(".main.today"), data.current)
showDay(document.querySelector(".main.tomorrow"), data.forecast.forecastday[1].day)
export function dayChanges(box,isDay){
	if (isDay){
		box.style.backgroundColor = "#FFD966"
		box.style.console = "white"
		box.children[0].style.display = "block"
		box.children[1].style.display = "none"
	}else{
		box.style.backgroundColor = ""
		box.children[1].style.display = "block"
		box.children[0].style.display = "none"
	}
}
////////////////          7 days ahead ( week )          ///////////////
let weekData = data.forecast.forecastday
function displayWeek() {
	// clean the week box to add new data boxes
	document.querySelector(".midle .left-part .main.week").innerHTML = ""

	// placing the first boxes according to the data first is the current day
	weekData.forEach(dayData => {
		let dayName = datetoName(dayData.date)
		let shortDayName = dayName.slice(0, 3)

		// getting the right image based on the mode (dark / light)
		let imagePack = document.querySelector(".mode").classList[1] // dark or light

		const boxDay = document.createElement("div")
		boxDay.innerHTML = `
        <span class="abr">${shortDayName}</span>
        <img src="${weatherConditions[imagePack][dayData.day.condition.code]}" alt="" class="weather-img" />
        <div class="temp">${Math.round(dayData.day.avgtemp_c)}°</div>
        `
		boxDay.classList.add("day", dayName)
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

	let data = getBoxData(box, weekData)
	let month = new Date(data.date.slice(5, 7)).toLocaleString("en", {month: "short"})

	// getting the right image based on the mode (dark / light)
	let imagePack = document.querySelector(".mode").classList[1] // dark or light
	box.innerHTML = `
        <div class="top">
            <h3 class="name">${datetoName(data.date)}</h3>
            <span class="month">${month} ${data.date.slice(8)}</span>
        </div>
        <div class="bottom">
            <div class="left">
                <div class="temp">${Math.round(data.day.avgtemp_c)}°</div>
                <div class="info">
                    <p class="real-feel">Real Feel<span class="number"> : ${Math.round(data.hour[15].feelslike_c)}°</span></p>
                    <p class="wind">max Wind<span class="number"> : ${data.day.maxwind_mph} Km/h</span></p>
                    <p class="pressure">Pressure<span class="number"> : ${Math.round(data.hour[15].pressure_mb)}MB</span></p>
                    <p class="humidity">Humidity<span class="number"> : ${Math.round(data.day.avghumidity)}%</span></p></div>
                </div>
            <div class="rigth">
                <img src="${weatherConditions[imagePack][data.day.condition.code]}" alt="" class="weather-img"/>
                <div class="info">
                    <p class="sunrise">Sunrise<span class="number"> : ${data.astro.sunrise}</span></p>
                    <p class="sunset">Sunset<span class="number"> : ${data.astro.sunset}</span></p>
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

		// get the data of this box using its class
		let finalData = getBoxData(box, weekData)

		// getting the right image based on the mode (dark / light)
		let imagePack = document.querySelector(".mode").classList[1] // dark or light

		box.innerHTML = `
            <span class="abr">${datetoName(finalData.date).slice(0, 3)}</span>
            <img src="${weatherConditions[imagePack][finalData.day.condition.code]}" alt="" class="weather-img" />
            <div class="temp">${Math.round(finalData.day.avgtemp_c)}°</div>
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
	let uvdays = data.forecast.forecastday.slice(0, 3)
	uvForecast(uvdays)
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
	let uvdays = data.forecast.forecastday.slice(0, 3)
	uvForecast(uvdays)
}
function uvForecast(days) {
	let i = 0
	days.forEach(day => {
		let uvValue = Math.round(day.day.uv)
		let progress = document.querySelector(".main-air .UV-forecast").children[i].children[0].children[0]
		progress.style.width = `${(uvValue / 13) * 100}%`
		progress.style.backgroundColor = uvColor(uvValue)[0]
		progress.parentElement.style.backgroundColor = uvColor(uvValue)[1]
		progress.parentElement.parentElement.children[1].children[0].innerHTML = uvValue
		progress.parentElement.parentElement.children[1].children[1].innerHTML = ` ${new Date(day.date.slice(5, 7)).toLocaleString("en", {month: "short"})} ${day.date.slice(8)}`
		i++
	})
}
