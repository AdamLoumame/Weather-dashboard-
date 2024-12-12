import {OnMain, toggleMain, OnStats, toggleStats} from "./utilities.js"
export async function getData(place) {
	try {
		showLoader()
		// get first data to fetch second one based on the first results ( place ) to match precisely the second data fetch ( same place )
		const mainResult = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=0bb3890e2cdc4fbabd5164832240711&q=${place}&days=7&aqi=yes`)
		if (mainResult.ok) {
			let mainData = await mainResult.json()
			const forecastResult = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${mainData.location.lat}&lon=${mainData.location.lon}&key=7eb8ce98b8d7433fb39fff8ab605de58`)
			const hoursForecastResult = await fetch(`https://api.weatherbit.io/v2.0/forecast/hourly?lat=${mainData.location.lat}&lon=${mainData.location.lon}&key=7eb8ce98b8d7433fb39fff8ab605de58`)
			if (forecastResult.ok && hoursForecastResult.ok) {
				hideError()
				let forecastData = await forecastResult.json()
				let hourForecastData = await hoursForecastResult.json()
				hideLoader()
				document.querySelector("header .location .loc-name").innerHTML = `${mainData.location.name}, <span>${mainData.location.country}</span>`
				console.log(mainData, forecastData, hourForecastData)
				return [mainData, forecastData, hourForecastData]
			} else {
				catchStatus(forecastResult)
			}
		} else {
			catchStatus(mainResult)
		}
	} catch {
		hideLoader()
		showError("Wrong Url")
	}
}
// error showing
function showError(error) {
	if (OnMain()) toggleMain(false)
	if (OnStats()) toggleStats(false)
	document.querySelector(".error-404").style.display = "block"
	document.querySelector("header .location .loc-name").innerHTML = `${error}, <span>ErrorLand</span>`
}
function hideError() {
	if (OnMain()) toggleMain(true)
	if (OnStats()) toggleStats(true)
	document.querySelector(".error-404").style.display = "none"
}
// loader controle
function showLoader() {
	document.querySelector(".loader").style.display = "block"
	document.querySelector(".error-404").style.display = "none"
	if (OnMain()) toggleMain(false)
	if (OnStats()) toggleStats(false)
	document.querySelector("header .location .loc-name").innerHTML = `Loading...`
}
function hideLoader() {
	document.querySelector(".loader").style.display = "none"
	if (OnMain()) toggleMain(true)
	if (OnStats()) toggleStats(true)
}
// catching bad result function
function catchStatus(badResult) {
	hideLoader()
	showError(mainResult.status)
	// display the error to the DOM
	let i = 0
	badResult.status
		.toString()
		.split("")
		.forEach(letter => {
			document.querySelector(".error-404 .fours").children[i].innerHTML = letter
			i++
		})
}

// simple data fetching
export async function getSimpleDataByName(name) {
	const result = await fetch(`http://api.weatherapi.com/v1/current.json?key=0bb3890e2cdc4fbabd5164832240711&q=${name}`)
	if (result.ok) return await result.json()
}
export async function getSimpleDataByCords(lat, lon) {
	const result = await fetch(`http://api.weatherapi.com/v1/current.json?key=0bb3890e2cdc4fbabd5164832240711&q=${lat},${lon}&aqi=yes`)
	if (result.ok) return await result.json()
}
