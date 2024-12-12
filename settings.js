import {toC, toF, OnMain} from "./utilities.js"

let toolButton = document.querySelector(".toolsIcon")
let tools = document.querySelector(".tools")
// ( un / ) displaying
toolButton.addEventListener("click", _ => {
	tools.style.left = 0
})
window.addEventListener("click", e => {
	if (!tools.contains(e.target) && !toolButton.contains(e.target) && !document.querySelector(".mode").contains(e.target)) {
		tools.style.left = "-20%"
	}
})
/*


bar chart for presure 
big derfault
sunrise sunset semi cercle 


2) chart
5) stats
4) copyright rules on the bottom of settings.js
3) learn those opperators 
settings resee
*/

// forecast type
let forecastOption = document.querySelector(".forecast-type")
if (forecastOption) {
	forecastOption.children[0].addEventListener("click", async _ => {
		let {UpdateMidle} = await import("./dashboard/midle.js")
		if (forecastOption.classList.contains("days")) {
			forecastOption.classList.replace("days", "hours")
			UpdateMidle()
			document.querySelector(".midle .left-part .info .dates .week").innerHTML = "Next 7 hours"
			updateUnit()
		} else {
			forecastOption.classList.replace("hours", "days")
			UpdateMidle()
			document.querySelector(".midle .left-part .info .dates .week").innerHTML = "Next 7 days"
			updateUnit()
		}
	})
}

// wind
let windOption = document.querySelector(".tools .container .settings .wind")
if (windOption) {
	windOption.children[0].addEventListener("click", async _ => {
		if (windOption.classList.contains("active")) {
			windOption.classList.remove("active")
			upWind()
		} else {
			windOption.classList.add("active")
			upWind()
		}
	})
}
async function upWind() {
	let [{UpdateMidle}, {updateCitiesWeather}] = await Promise.all([import("./dashboard/midle.js"), import("./dashboard/lower.js")])
	UpdateMidle()
	await updateCitiesWeather()
	updateUnit()
}

// temperature unit
let tempOption = document.querySelector(".temp-unit")
tempOption.children[0].addEventListener("click", _ => {
	if (tempOption.classList.contains("F")) {
		tempOption.classList.replace("F", "C")
		changeUnitTemp("F")
	} else {
		tempOption.classList.replace("C", "F")
		changeUnitTemp("C")
	}
})
function changeUnitTemp(unit) {
	let temps = [...document.querySelectorAll(".midle .left-part .main.week .day .temp"), document.querySelector(".midle .left-part .main.week .day.active .bottom .info p span"), ...document.querySelectorAll(".lower .right .cities .box .info .temp"), ...document.querySelectorAll(".left-part .main .left .temperature"), ...document.querySelectorAll(".left-part .main .more .details .sec > div .value.temp")]
	temps.forEach(temp => {
		if (temp.childElementCount === 0) {
			let number = temp.innerHTML.match(/-?\d+/)?.[0]
			if (unit === "C" && temp.innerHTML.includes("C")) (temp.innerHTML = temp.innerHTML.replace(number, toF(Number(number)))), (temp.innerHTML = temp.innerHTML.replace("C", "F"))
			if (unit === "F" && temp.innerHTML.includes("F")) (temp.innerHTML = temp.innerHTML.replace(number, toC(Number(number)))), (temp.innerHTML = temp.innerHTML.replace("F", "C"))
		} else {
			let number = temp.children[0].innerHTML.match(/-?\d+/)?.[0]
			if (temp.children[1].innerHTML.includes("C") && unit === "C") {
				temp.children[0].innerHTML = temp.children[0].innerHTML.replace(number, toF(Number(number)))
				temp.children[1].innerHTML = temp.children[1].innerHTML.replace("C", "F")
			}
			if (temp.children[1].innerHTML.includes("F") && unit === "F") {
				temp.children[0].innerHTML = temp.children[0].innerHTML.replace(number, toC(Number(number)))
				temp.children[1].innerHTML = temp.children[1].innerHTML.replace("F", "C")
			}
		}
	})
}
export function updateUnit() {
	if (tempOption.classList[1] === "F") changeUnitTemp("C") // retrive last unit
}

// View mode
let veiwMode = document.querySelector(".view-mode")
if (veiwMode) {
	veiwMode.children[0].addEventListener("click", async _ => {
		let [{displayMainChart}, {UpdateAdditionalCharts}] = await Promise.all([import("/statistics/mainChart.js"), import("/statistics/additionalCharts.js")])
		if (veiwMode.classList.contains("active")) {
			veiwMode.classList.remove("active")
			displayMainChart()
			UpdateAdditionalCharts()
		} else {
			veiwMode.classList.add("active")
			displayMainChart()
			UpdateAdditionalCharts()
		}
	})
}
