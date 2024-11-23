export function datetoName(date) {
	return new Date(date).toLocaleDateString("en", {weekday: "long"})
}
export function getBoxData(box, iterableData) {
	let result
	iterableData.forEach(elementData => {
		if (datetoName(elementData.datetime) === box.classList[1]) {
			result = elementData
		}else if(elementData.timestamp_local){
			let time = Number(elementData.timestamp_local.slice(11, 13))
			let comparands = time > 12 ? `${time - 12}PM` : time + "AM"
			if (comparands===box.classList[1]){
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
		hour12: true,
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
export function uvColor(rate) {
	if (rate <= 2) {
		return ["#16FF00", "#16FF004d"]
	} else if (rate <= 5) {
		return ["#FFC700", "#FFC7004d"]
	} else if (rate <= 7) {
		return ["#FF6500", "#FF65004d"]
	} else if (rate <= 10) {
		return ["#E72929", "#E729294d"]
	} else {
		return ["#7A1CAC", "#7A1CAC4d"]
	}
}
export function convert12From(time){
	return time > 12 ? `${time - 12}PM` : time + "AM"
}