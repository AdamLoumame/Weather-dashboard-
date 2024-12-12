import {nightImages, tempRanges} from "./dicts.js"
export function getUserCords() {
	return new Promise((resolve, reject) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				succ => resolve(`${succ.coords.latitude} ${succ.coords.longitude}`),
				fail => resolve("london")
			)
		} else {
			resolve("london")
		}
	})
}
export function datetoName(date) {
	return new Date(date).toLocaleDateString("en", {weekday: "long"})
}
export function getMonth(number) {
	return new Date(number).toLocaleString("en", {month: "short"})
}
export function getBoxData(box, iterableData) {
	let result
	iterableData.forEach(elementData => {
		if (datetoName(elementData.datetime) === box.classList[1]) {
			result = elementData
		} else if (elementData.timestamp_local) {
			let time = Number(elementData.timestamp_local.slice(11, 13))
			let comparands = time > 12 ? `${time - 12}PM` : time + "AM"
			if (comparands === box.classList[1]) {
				result = elementData
			}
		}
	})
	return result
}
export function getTime(timestamp, timeZone) {
	let date = new Date(timestamp * 1000)
	let options = {
		timeZone: timeZone,
		hour: "2-digit",
		minute: "2-digit",
		hour12: true
	}
	return new Intl.DateTimeFormat("en-US", options).format(date)
}
export function airColor(percentage) {
	if (percentage <= 25) {
		return ["lime", "#00ff004d"]
	} else if (percentage <= 50) {
		return ["yellow", "#ffff004d"]
	} else if (percentage <= 75) {
		return ["orange", "#ffa5004d"]
	} else {
		return ["red", "#ff00004d"]
	}
}
export function convert12form(time, space = false) {
	return time > 12 ? `${time - 12}${space ? " " : ""}PM` : time + `${space ? " " : ""}AM`
}
export function filterImage(code, is_day, imagesDic) {
	let imagePack = document.querySelector(".mode").classList[1] // dark or light
	let img = imagesDic[imagePack][code]
	let absurdeCodes = [1003, 1006, 1204, 801, 802, 800, 1000]
	if (absurdeCodes.includes(code) && !is_day && is_day !== "undefined" && is_day !== undefined) {
		img = nightImages[imagePack][code]
	}
	return img
}
export let toF = n => Math.round((n * 9) / 5 + 32)
export let toC = n => Math.round(((n - 32) * 5) / 9)

export function OnMain() {
	return document.querySelector(".tools .container .nav").children[0].classList.contains("active")
}
export function toggleMain(display) {
	document.querySelector(".midle").style.display = display ? "flex" : "none"
	document.querySelector(".lower").style.display = display ? "flex" : "none"
}
export function toggleCitiesError(display) {
	document.querySelector(".cities .error").style.display = display ? "flex" : "none"
}
export function toggleCitiesLoader(display) {
	document.querySelector(".lower .right .cities .cities-loader").style.display = display ? "flex" : "none"
}
export function OnStats() {
	return document.querySelector(".tools .container .nav").children[1].classList.contains("active")
}
export function toggleStats(display) {
	document.querySelector(".main-chart").style.display = display ? "block" : "none"
	document.querySelector(".bottom").style.display = display ? "flex" : "none"
}
export let getFillColor = (wt, value = 0) => (wt === "temp" ? tempRanges.find(range => value >= range.threshold).color : wt === "wind" ? "#06d6a0" : "#4cc9f0")
