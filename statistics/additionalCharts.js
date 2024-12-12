import {getData} from "../api.js"
import {getUserCords, datetoName, convert12form} from "../utilities.js"
import {mainWeatherConditions, uvColor} from "../dicts.js"

export async function UpdateAdditionalCharts(place = "") {
	if (place) [data, weekData, hourData] = await getData(place)
	forecastType = document.querySelector(".main-chart .forecast-options").classList[1]
	forecastData = forecastType === "days" ? weekData.data : hourData.data.filter(el => (Number(el.timestamp_local.slice(11, 13)) - (Number(hourData.data[0].timestamp_local.slice(11, 13)) % 3)) % 3 === 0)
	mode = document.querySelector(".mode").classList[1]
	displayUvChart()
}

// default
let defaultPlace = await getUserCords()
let [data, weekData, hourData] = await getData(defaultPlace)

let forecastType = document.querySelector(".main-chart .forecast-options").classList[1]
let forecastData = forecastType === "days" ? weekData.data : hourData.data.filter(el => (Number(el.timestamp_local.slice(11, 13)) - (Number(hourData.data[0].timestamp_local.slice(11, 13)) % 3)) % 3 === 0)
let mode = document.querySelector(".mode").classList[1]

let lastUvChart
function displayUvChart() {
	let proMode = document.querySelector(".view-mode").classList.contains("active")
	// reset
	if (lastUvChart) lastUvChart.destroy()
	document.querySelector(".bar-chart .container .labels").innerHTML = ""
	document.querySelector(".empty-uv-chart-label").innerHTML = ""
	document.querySelectorAll(".bottom .bar-chart .container .day").forEach(day => day.parentElement.removeChild(day))

	let options = {
		series: [{data: forecastData.map(el => ({y: el.uv, x: forecastType === "days" ? datetoName(el.datetime).slice(0, 3) : `${datetoName(el.timestamp_local.slice(0, 10)).slice(0, 3)} at ${convert12form(Number(el.timestamp_local.slice(11, 13)), true)}`, goals: [{value: el.uv, strokeColor: mode === "dark" ? "#f5f5f5" : "#1c1c1c", strokeHeight: 1}]}))}],
		chart: {
			type: "bar",
			height: proMode ? "85%" : "100%",
			toolbar: {show: false},
			animations: {enabled: false},
			sparkline: {enabled: true}
		},
		plotOptions: {
			bar: {
				colors: {
					ranges: uvColor.map((range, i) => {
						return {
							from: i === 0 ? 0 : uvColor[i - 1].threshold + 1,
							to: range.threshold,
							color: range.colors[0]
						}
					})
				},
				columnWidth: "98%"
			}
		},
		fill: {
			type: "gradient",
			gradient: {
				type: "vertical",
				shade: "light",
				shadeIntensity: 0,
				opacityFrom: mode === "dark" ? 0.6 : 1,
				opacityTo: 0,
				stops: [0, 90, 100]
			}
		},
		tooltip: {
			enabled: !proMode,
			custom: function ({series, dataPointIndex}) {
				return `<div class="uv-chart-tooltip">
							<span class="date">${options.series[0].data[dataPointIndex].x}</span>
							<span class="index">${series[0][dataPointIndex]}</span>
						</div>`
			},
			followCursor: true
		},
		states: {hover: {filter: {type: "none"}}, active: {filter: {type: "none"}}},
		xaxis: {crosshairs: {show: false}, labels: {style: {colors: mode === "dark" ? "#b3b3b3" : "#5e5e5e"}}},
		yaxis: {min: 0, max: Math.ceil(forecastData.reduce((acc, curr) => (curr.uv >= acc.uv ? curr : acc)).uv) + 2, labels: {show: false}},
		grid: {borderColor: "#323234", strokeDashArray: 10, padding: {right: proMode && 16, left: proMode && 16}}
	}

	let UvChart = new ApexCharts(document.querySelector(".bottom .bar-chart #uv-chart"), options)
	lastUvChart = UvChart
	UvChart.render()
	let emptyChart = options.series[0].data.every(value => value.y === 0)

	// add indecators
	if (proMode) {
		options.series[0].data.forEach((el, i) => {
			// adding x labels
			let label = document.createElement("span")
			label.innerHTML = forecastType === "days" ? el.x : convert12form(Number(forecastData[i].timestamp_local.slice(11, 13)), true)
			document.querySelector(".bar-chart .container .labels").append(label)
		})
	}
	if (forecastType === "hours" && !emptyChart) {
		options.series[0].data.forEach((el, i) => {
			if (i === 0 || i === options.series[0].data.length - 1) return // reject first and last el

			if (forecastData[i].timestamp_local.slice(8, 10) !== forecastData[i - 1].timestamp_local.slice(8, 10)) {
				let day = document.createElement("div")
				day.classList.add("day")
				if (proMode) Object.assign(day.style, {height: "68%", fontSize: "0.68rem"})
				day.style.left = proMode ? i * 5.7 + 1.5 + "%" : i * 6 - 1 + "%"
				day.innerHTML = `<h3>${datetoName(forecastData[i].timestamp_local.slice(0, 10))}</h3>`
				document.querySelector(".bottom .bar-chart .container").prepend(day)
			}
		})
	}
	// empty chart handling
	if (emptyChart) document.querySelector(".empty-uv-chart-label").innerHTML = `No UV expected for the next ${forecastType}`
}
UpdateAdditionalCharts()
