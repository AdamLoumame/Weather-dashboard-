import {UpdateAdditionalCharts} from "./additionalCharts.js"
// weather options changing by clicking
let weatherOptions = document.querySelectorAll(".main-chart .weather-type-options span")
weatherOptions.forEach(choice => {
	choice.addEventListener("click", _ => {
		weatherOptions.forEach(choice => choice.classList.remove("active"))
		choice.classList.add("active")
		choice.parentElement.classList.replace(choice.parentElement.classList[1], choice.classList[0])
		displayMainChart()
	})
})
// forecast types changing by clicking
let forecastOptions = document.querySelectorAll(".main-chart .forecast-options span")
forecastOptions.forEach(option => {
	option.addEventListener("click", _ => {
		forecastOptions.forEach(option => option.classList.remove("active"))
		option.classList.add("active")
		option.parentElement.classList.replace(option.parentElement.classList[1], option.classList[0])
		displayMainChart()
		UpdateAdditionalCharts()
	})
})

import {getData} from "../api.js"
import {forecastWeatherConditions} from "../dicts.js"
import {getUserCords, convert12form, getMonth, datetoName, toF, getFillColor, filterImage} from "../utilities.js"

// default data
let defaultPlace = await getUserCords()
let [data, weekData, hourData] = await getData(defaultPlace)

let lastChart
export async function UpdateMainChart(place) {
	;[data, weekData, hourData] = await getData(place)
	// display new chart
	displayMainChart()
}
let windImage = "/images/weather/simboles/arrow.png"
export function displayMainChart() {
	let proMode = document.querySelector(".view-mode").classList.contains("active")
	// reset last chart + info labels + empty chart label + day indecator
	if (lastChart) lastChart.destroy()
	document.querySelector(".main-chart .container .info-labels").innerHTML = ""
	document.querySelector(".main-chart .container .empty-chart-label").style.display = "none"
	document.querySelectorAll(".main-chart .container .day").forEach(day => day.parentElement.removeChild(day))

	let mode = document.querySelector(".mode").classList[1]
	let weatherType = document.querySelector(".main-chart .weather-type-options").classList[1]
	let forecastType = document.querySelector(".main-chart .forecast-options").classList[1]

	let forecastData = forecastType === "days" ? weekData.data : hourData.data.filter(el => (Number(el.timestamp_local.slice(11, 13)) - (Number(hourData.data[0].timestamp_local.slice(11, 13)) % 3)) % 3 === 0)
	let valueName = weatherType === "temp" ? "temp" : weatherType === "wind" ? "wind_spd" : "pop"

	// getting the right scales and look of the curve
	let maximum = forecastData.reduce((acc, curr) => (curr[valueName] >= acc[valueName] ? curr : acc))[valueName]
	let minimum = forecastData.reduce((acc, curr) => (curr[valueName] <= acc[valueName] ? curr : acc))[valueName]
	let monotonicChart = maximum * minimum > 0 || maximum > 3 * Math.abs(minimum) || maximum * 3 < Math.abs(minimum)
	if (weatherType === "wind") [minimum, maximum] = [minimum * 3.6, maximum * 3.6]
	let tickAmount = 4
	let step = minimum > 0 ? maximum / tickAmount : maximum < 0 ? Math.abs(minimum) / tickAmount : Math.abs((maximum - minimum) / tickAmount)
	let min, max
	if (monotonicChart) {
		;[min, max] = Math.abs(minimum) > maximum ? [minimum - 2 * step, 0] : [0, maximum + 2 * step]
	} else {
		;[min, max] = [minimum - 2 * step, maximum + 2 * step]
	}

	let chartColor = getFillColor(weatherType, (maximum + minimum) / 2)
	let options = {
		series: [{data: forecastData.map((el, i) => (valueName === "wind_spd" ? el[valueName] * 3.6 : el[valueName]))}],
		chart: {
			type: "area",
			height: "100%",
			animations: {enabled: false},
			toolbar: {show: false},
			sparkline: {enabled: true}
		},
		markers: {hover: {size: proMode ? 8 : 0}, colors: [chartColor], strokeColors: mode === "dark" ? "#121212" : "#ffffff", strokeWidth: 4},
		tooltip: {
			custom: function ({series, dataPointIndex}) {
				return `<div class="main-chart-tooltip">
							${proMode && weatherType !== "precip" ? `<img src=${weatherType === "temp" ? filterImage(forecastData[dataPointIndex].weather.code, forecastData[dataPointIndex].pod === "n" && forecastType === "hours" ? 0 : 1, forecastWeatherConditions) : windImage} style="transform:rotateZ(${weatherType === "wind" ? forecastData[dataPointIndex].wind_dir : ""}deg);">` : `<span class="date">${options.xaxis.categories[dataPointIndex]}</span>`}		
							<div class="infos">
								<span class="curve-color" style="background-color:${chartColor};"></span>
								<span>${weatherType} : </span>
								<span>${Math.round(series[0][dataPointIndex])} ${weatherType === "temp" ? "°C / " + toF(series[0][dataPointIndex]) + " °F" : weatherType === "wind" ? "Km/h" : "%"}</span>
							</div>		
						</div>`
			},
			followCursor: !proMode
		},
		xaxis: {
			crosshairs: {
				show: proMode,
				width: 3,
				stroke: {width: 0},
				fill: {
					type: "gradient",
					gradient: {
						colorFrom: "transparent",
						colorTo: mode !== "dark" ? "#121212" : "#ffffff",
						stops: [0, 30, 50, 90, 100],
						opacityFrom: 0,
						opacityTo: 1
					}
				}
			},
			categories: forecastType === "days" ? forecastData.map(el => `${getMonth(el.datetime.slice(5, 7))} ${parseInt(el.datetime.slice(8, 10))}`) : forecastData.map(el => `${datetoName(el.timestamp_local.slice(0, 10)).slice(0, 3)} at ${convert12form(Number(el.timestamp_local.slice(11, 13)), true)}`)
		},
		yaxis: {
			min: min,
			max: max,
			tickAmount: tickAmount
		},
		fill: {
			type: "gradient",
			colors: [chartColor],
			gradient: {
				type: "vertical",
				opacityFrom: 0.5,
				opacityTo: 0
			}
		}
	}
	let emptyChart = options.series[0].data.every(value => value === 0)
	let chart = new ApexCharts(document.querySelector(".main-chart #chart"), options)
	chart.render()
	lastChart = chart // to deleat on creation of new one

	// placing infos ( chart essentials )
	if (proMode && !emptyChart) {
		options.xaxis.categories.forEach((el, index) => {
			if (index === 0 || index === options.xaxis.categories.length - 1) return // reject first and last el

			// dipaying labels and lines
			let label = document.createElement("div")
			label.innerHTML = forecastType === "days" ? datetoName(forecastData[index].datetime.slice(0, 11)).slice(0, 3) : el.split(" ").slice(-2).join(" ")
			document.querySelector(".main-chart .container .info-labels").appendChild(label)
		})
	} else {
		options.xaxis.categories.forEach((el, index) => {
			if (index === 0 || index === options.xaxis.categories.length - 1) return // reject first and last el
			let value = options.series[0].data[index]
			let appears = value * (Math.abs(minimum) > maximum ? minimum : maximum) > 0
			let rangeHeight = Math.abs(max - min)
			let top = value >= 0 ? max - step / 3 - value : min + step / 3 - value
			let topINpx = (top * chart.w.globals.svgHeight) / rangeHeight // converting to px
			if (monotonicChart && weatherType !== "precip" && value * (Math.abs(minimum) > maximum ? minimum : maximum) > 0) {
				// adding indecator line
				chart.addXaxisAnnotation({
					x: index + 1,
					borderColor: mode === "dark" ? "#f5f5f5" : "#1c1c1c",
					strokeDashArray: 0,
					strokeWidth: 2,
					offsetY: topINpx
				})
			}
			// adding Indecator image
			if (weatherType !== "precip") {
				let image = document.createElement("img")
				image.src = weatherType === "temp" ? filterImage(forecastData[index].weather.code, forecastData[index].pod === "n" && forecastType === "hours" ? 0 : 1, forecastWeatherConditions) : windImage
				image.style.top = (value < 0 ? chart.w.globals.svgHeight + topINpx + 5 : topINpx - 35) + "px"
				if (monotonicChart) image.style.top = (value >= 0 && max === 0 ? 5 : value <= 0 && min === 0 ? chart.w.globals.svgHeight - 40 : parseInt(image.style.top)) + "px"
				if (weatherType === "wind") image.style.transform = `rotateZ(${forecastData[index].wind_dir}deg)`
				document.querySelector(".main-chart .container .info-labels").appendChild(image)
			}
		})
	}

	// placing days idecators on hourschart to mention start and end of a day
	if (forecastType === "hours" && !emptyChart) {
		options.xaxis.categories.forEach((el, index) => {
			if (index === 0 || index === options.xaxis.categories.length - 1) return // reject first and last el

			if (forecastData[index - 1].timestamp_local.slice(8, 10) !== forecastData[index].timestamp_local.slice(8, 10)) {
				let day = document.createElement("div")
				day.classList.add("day")
				day.style.left = (index / 16 - (Number(el.split(" ")[2]) % 3) / 49) * 100 + "%"
				if (max === 0) day.style.textAlign = "right"
				day.innerHTML = `<h3>${datetoName(forecastData[index].timestamp_local.slice(0, 10))}</h3>`
				document.querySelector(".main-chart .container").prepend(day)
			}
		})
	}

	// Chart Empty Message
	if (emptyChart) {
		// display message
		document.querySelector(".main-chart .container .empty-chart-label").innerHTML = `No ${weatherType} expected for the commming ${forecastType} !`
		Object.assign(document.querySelector(".main-chart .container .empty-chart-label").style, {display: "block", color: getFillColor(weatherType)})
		// hide proMode options
		chart.updateOptions({xaxis: {crosshairs: {show: false}}, markers: {hover: {size: 0}}, tooltip: {followCursor: true}})
	}
}
displayMainChart()
