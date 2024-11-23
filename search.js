import {UpdateLower} from "../dashboard/lower.js"
import {UpdateMidle} from "../dashboard/midle.js"
import {continents} from "./dicts.js"

let searchBar = document.querySelector(".search-bar")
let searchButton = document.querySelector(".search-button")
// search listeners
searchButton.addEventListener("click", e => {
  if (searchBar.value) {
    bigUpdate(searchBar.value)
  }
})
document.addEventListener("keyup", e => {
  if (searchBar.value && e.code === "Enter") {
    if (document.querySelector(".suggestions li.active")) {
      bigUpdate(document.querySelector(".suggestions li.active").dataset.place)
    } else if (document.querySelector(".suggestions li")) {
      bigUpdate(document.querySelector(".suggestions li").dataset.place)
    } else {
      bigUpdate(searchBar.value)
    }
  }
})

// search Bar SUGGESTION AND AUTOCOMPLETE
searchBar.addEventListener("input", async _ => {
  if (searchBar.value !== "") {
    // displaying content
    document.querySelector(".separator").style.opacity = "1"
    document.querySelector(".suggestions").style.display = "flex"

    let cities = await fetch(`http://api.geonames.org/searchJSON?name_startsWith=${searchBar.value}&maxRows=5&username=adam08&style=full`)
    let data = await cities.json()

    // getting right cities
    let citiesArr = []
    data.geonames.forEach(city => {
      citiesArr = citiesArr.filter(c => c.name !== city.name || c.countryName !== city.countryName)
      if (document.querySelector("header .left-part .location .loc-name").textContent !== `${city.name}, ${city.countryName}`) {
        citiesArr.push(city)
      }
    })
    // undisplay content if no available recommendations
    if (citiesArr.length === 0) {
      document.querySelector(".separator").style.display = "none"
      document.querySelector(".suggestions").style.display = "none"
    } else {
      document.querySelector(".separator").style.display = "block"
    }
    // display cities into suggestions box
    let suggBox = document.querySelector(".suggestions")
    suggBox.innerHTML = ""
    citiesArr.forEach(async place => {
      let imagePack = document.querySelector(".mode").classList[1] // dark or light
      let continentSRC = continents[imagePack][place.continentCode]
      // el creation
      let sugg = document.createElement("li")
      sugg.dataset.place = `${place.name},${place.countryName}`
      sugg.dataset.continent = place.continentCode
      sugg.innerHTML = `<img class="continent" src="${continentSRC}">
                                <div class="info">
                                    <span class="cityName">${place.name}</span>
                                    <span class="countryName">${place.countryName}</span>
                                </div>
                            `
      suggBox.appendChild(sugg)
      // displaying data placing on clicking
      sugg.addEventListener("click", e => {
        bigUpdate(`${place.name},${place.countryName}`)
      })
    })
    // updaating current on the search bar
    current = -1
  } else {
    document.querySelector(".separator").style.opacity = "0"
    document.querySelector(".suggestions").style.display = "none"
  }
})
// update depending on the mode
export function UpdateSugg() {
  let suggBox = document.querySelector(".suggestions")
  Array.from(suggBox.children).forEach(sugg => {
    let imagePack = document.querySelector(".mode").classList[1] // dark or light
    let continentSRC = continents[imagePack][sugg.dataset.continent]
    sugg.querySelector(".continent").src = continentSRC
  })
}
// arrows navigation over the sugge
let current = -1
document.addEventListener("keydown", e => {
  if (e.code === "ArrowDown" && current < document.querySelector(".suggestions").childElementCount - 1) {
    current++
    makeSugActive(current)
  }
  if (e.code === "ArrowUp" && current > -1) {
    current--
    makeSugActive(current)
  }
})
function makeSugActive(i) {
  document.querySelectorAll(".suggestions li").forEach(c => c.classList.remove("active"))
  document.querySelector(".suggestions").children[i].classList.add("active")
}
// undisplay Search Bar on clicking other part
window.addEventListener("click", e => {
  if (!document.querySelector(".search").contains(e.target) && !document.querySelector(".mode").contains(e.target)) {
    document.querySelector(".suggestions").style.display = "none"
    document.querySelector(".separator").style.opacity = "0"
  }
})
// the BIG UPADATE function that regroupes all changes
export function bigUpdate(value) {
  UpdateMidle(value)
  UpdateLower(value)
  searchBar.value = ""
  document.querySelector(".suggestions").innerHTML = ""
  current = -1
  document.querySelector(".suggestions").style.display = "none"
  document.querySelector(".separator").style.opacity = "0"
}