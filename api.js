export async function getData(place) {
	try{
        showLoader()
	    const result = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=e4b246c48b7247b88f3153127242510&q=${place}&days=7&aqi=yes`)
        if (result.ok) {
            hideError()
            let data = await result.json()
            hideLoader()
            return data
        } else {
            hideLoader()
            showError(result.status)
            // display the error to the DOM
            let i = 0
            result.status.toString().split("").forEach(letter => {
                document.querySelector(".error-404 .fours").children[i].innerHTML = letter
                i++
            })
        }
    }catch{
        hideLoader()
        showError("Wrong Url")
    }
}

function showError(error) {
	document.querySelector(".midle").style.display = "none"
	document.querySelector(".error-404").style.display = "block"
	document.querySelector("header .left-part .location .loc-name").innerHTML = `${error}, <span>ErrorLand</span>`
}
// remove that error screen and add the normal widgets
function hideError() {
	document.querySelector(".midle").style.display = "flex"
	document.querySelector(".error-404").style.display = "none"
}
// loader controle
function showLoader(){
    document.querySelector(".loader").style.display = "block"
	document.querySelector(".error-404").style.display = "none"
	document.querySelector(".midle").style.display = "none"
	document.querySelector("header .left-part .location .loc-name").innerHTML = `Loading...`
}
function hideLoader(){
    document.querySelector(".loader").style.display = "none"
	document.querySelector(".midle").style.display = "flex"
}