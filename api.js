export async function getData(place) {
  console.time("all")
  console.time("weather api")
  console.time("weatherbit")
  try {
    showLoader()
    // get first data to fetch second one based on the first results ( place ) to match precisely the second data fetch ( same place )
    const mainResult = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=0bb3890e2cdc4fbabd5164832240711&q=${place}&days=7&aqi=yes`)
    console.timeEnd("weather api")
    if (mainResult.ok) {
      let mainData = await mainResult.json()
      const forecastResult = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${mainData.location.lat}&lon=${mainData.location.lon}&key=fd74d4e9a82147c289702cee21e4d219`)
      const hoursForecastResult = await fetch(`https://api.weatherbit.io/v2.0/forecast/hourly?lat=${mainData.location.lat}&lon=${mainData.location.lon}&key=fd74d4e9a82147c289702cee21e4d219`)
    console.timeEnd("weatherbit")
      if (forecastResult.ok && hoursForecastResult.ok) {
        hideError()
        let forecastData = await forecastResult.json()
        let hourForecastData = await hoursForecastResult.json()
        hideLoader()
        console.log(mainData, forecastData, hourForecastData)
        console.timeEnd("all")
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
  document.querySelector(".midle").style.display = "none"
  document.querySelector(".lower").style.display = "none"
  document.querySelector(".error-404").style.display = "block"
  document.querySelector("header .left-part .location .loc-name").innerHTML = `${error}, <span>ErrorLand</span>`
}
function hideError() {
  document.querySelector(".midle").style.display = "flex"
  document.querySelector(".lower").style.display = "flex"
  document.querySelector(".error-404").style.display = "none"
}
// loader controle
function showLoader() {
  document.querySelector(".loader").style.display = "block"
  document.querySelector(".error-404").style.display = "none"
  document.querySelector(".midle").style.display = "none"
  document.querySelector(".lower").style.display = "none"
  document.querySelector("header .left-part .location .loc-name").innerHTML = `Loading...`
}
function hideLoader() {
  document.querySelector(".loader").style.display = "none"
  document.querySelector(".midle").style.display = "flex"
  document.querySelector(".lower").style.display = "flex"
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
  return await result.json()
}
export async function getSimpleDataByCords(lat, lon) {
  const result = await fetch(`http://api.weatherapi.com/v1/current.json?key=0bb3890e2cdc4fbabd5164832240711&q=${lat},${lon}&aqi=yes`)
  return await result.json()
}
