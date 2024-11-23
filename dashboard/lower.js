import {getSimpleDataByCords, getSimpleDataByName} from "../api.js"
import {mainWeatherConditions, biggestCities} from "../dicts.js"
import {getUserCords, filterImage} from "./midle.js"
import {bigUpdate} from "../search.js"

// default
let defaultPlace = await getUserCords()
let data = await getSimpleDataByName(defaultPlace) // default data that will be showed first to the user
// Updating
export async function UpdateLower(value = "") {
  mode = document.querySelector(".mode").classList[1]
  UpdateCities()
  if (lastLayer !== ReaLayer) {
    applyLayer()
  }
  displayWeather()
  data = await getSimpleDataByName(value)
  map.getView().animate({
    center: ol.proj.fromLonLat([data.location.lon, data.location.lat]),
    zoom: 12,
    duration: 1500,
  })
}
////////////////         MAP          ///////////////
// markers group
let markers = []
let map = new ol.Map({
  view: new ol.View({
    center: ol.proj.fromLonLat([data.location.lon, data.location.lat]),
    zoom: 10,
    minZoom: 2,
    maxZoom: 18,
  }),
  target: "map",
})
// get user location and travel to it on click on the loc button
let geolocation = new ol.Geolocation({
  tracking: true,
  projection: map.getView().getProjection(),
})
document.querySelector(".zoom-location").addEventListener("click", async _ => {
  let coordinates = geolocation.getPosition()
  map.getView().animate({
    center: coordinates,
    zoom: 16,
    duration: 1500,
  })
})
let darkLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
  }),
  visible: false,
  title: "darkLayer",
})
let lightLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
  }),
  visible: false,
  title: "lightLayer",
})
let ReaLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  }),
  visible: false,
  title: "lightLayer",
  crossOrigin: "anonymous",
})
let lastLayer
let mode = document.querySelector(".mode").classList[1]
applyLayer()
map.addLayer(ReaLayer)
map.addLayer(darkLayer)
map.addLayer(lightLayer)
// displaying weather condition and update while mvt occurs and clicking changes
map.on("moveend", async _ => {
  displayWeather()
})
async function displayWeather() {
  let places = (await getBoundedCities(map.getView().calculateExtent())).elements
  // remove unneeded markers and update places so alr there wont be replaced 
  markers.forEach(marker => {
    let usedMarker
    places.forEach(place => {
      let [markerLat, markerLon] = marker.getSource().getFeatures()[0].get("class")[0]
      if (markerLat === place.lat && markerLon === place.lon) usedMarker = true,places.splice(places.indexOf(place),1)
    })
    if (!usedMarker) map.removeLayer(marker),marker.getSource().removeFeature(marker.getSource().getFeatures()[0]), markers.splice(markers.indexOf(marker), 1)
  })
  places.forEach(async place => {
    // place marker according to the place data
    let palceData = await getSimpleDataByCords(place.lat, place.lon)
    let marker = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([place.lon, place.lat])),
          }),
        ],
      }),
      style: getStyle("image", palceData.current.condition.code),
    })
    marker
      .getSource()
      .getFeatures()[0]
      .set("class", [[place.lat, place.lon], "image",palceData.current.condition.code])
    map.addLayer(marker)
    markers.push(marker)
  })
}
// on click on the marker switching between text and image
map.on("singleclick", async e => {
  let feature = map.forEachFeatureAtPixel(e.pixel, feature => feature)
  if (feature) {
    let palceData = await getSimpleDataByCords(...feature.get("class")[0])
    if (feature.get("class")[1] === "image") {
      feature.set("class", [feature.get("class")[0], "number"])
      feature.setStyle(null)
      feature.setStyle(getStyle("text", palceData.current.temp_c))
    } else {
      feature.set("class", [feature.get("class")[0], "image"])
      feature.setStyle(null)
      feature.setStyle(getStyle("image", palceData.current.condition.code))
    }
  }
})
// getting the style of the marker feature according to the type of it 
function getStyle(type, filling) {
  let style
  if (type === "text") {
    style = new ol.style.Style({
      text: new ol.style.Text({
        text: filling,
        font: "16px Rubik, sans-serif",
        fill: new ol.style.Fill({color: "#f7f7f7"}),
        backgroundFill: new ol.style.Fill({ color: "transparent"}),
        stroke: new ol.style.Stroke({color: '#111015', width: 2})
      }),
    })
  } else {
    style = new ol.style.Style({
      image: new ol.style.Icon({
        src: mainWeatherConditions[mode][filling],
        scale: 0.3,
      }),
    })
  }
  return style
}
export function updateMarkersImages(){
  markers.forEach(marker=>{
    let feature = marker.getSource().getFeatures()[0]
    if (feature.get("class")[1]==="image") feature.setStyle(getStyle("image",feature.get("class")[2]))
  })
}
// getting the cities displayed to the user
async function getBoundedCities(cords) {
  let [minX, minY, maxX, maxY] = cords
  let [Nlng, Nlat] = ol.proj.toLonLat([maxX, maxY])
  let [Slng, Slat] = ol.proj.toLonLat([minX, minY])

  let data, result
  if (map.getView().getZoom() <= 5) {
    result = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];node["place"="country"](${Slat},${Slng},${Nlat},${Nlng});out body 10;`)
    data = await result.json()
  } else {
    result = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];node["place"="city"](${Slat},${Slng},${Nlat},${Nlng});out body 10;`)
    data = await result.json()
  }
  return data
}
// add tile layer based on mode
function applyLayer() {
  if (mode === "dark") {
    darkLayer.setVisible(true)
    lightLayer.setVisible(false)
    lastLayer = darkLayer
  } else {
    lightLayer.setVisible(true)
    darkLayer.setVisible(false)
    lastLayer = lightLayer
  }
}
// wide View
document.querySelector(".wide-view").onclick = _ => map.getView().setZoom(0)
// layer switcher
let layerSwitcher = document.querySelector(".layerSwitcher")
layerSwitcher.addEventListener("click", _ => {
  if (lastLayer === lightLayer || lastLayer === darkLayer) {
    lightLayer.setVisible(false)
    darkLayer.setVisible(false)
    ReaLayer.setVisible(true)
    lastLayer = ReaLayer
  } else {
    ReaLayer.setVisible(false)
    applyLayer()
  }
})
////////////////         large CITIES          ///////////////
let chosedCities = []
async function displayRandCities() {
  chosedCities = []
  for (let i = 0; i < 3; i++) {
    let city = biggestCities[Math.floor(Math.random() * biggestCities.length)]
    while (chosedCities.includes(city)) {
      city = biggestCities[Math.floor(Math.random() * biggestCities.length)]
    }
    chosedCities.push(city)
    let cityData = await getSimpleDataByName(city)
    let box = document.querySelector(".cities").children[i]
    box.classList.remove(box.classList[1])
    box.querySelector(".country").innerHTML = cityData.location.country
    box.querySelector(".city-name").innerHTML = cityData.location.name
    box.querySelector(".condition").innerHTML = cityData.current.condition.text
    box.querySelector(".weatherImage").src = filterImage(cityData.current.condition.code, cityData.current.is_day, mainWeatherConditions)
    box.querySelector(".temp").innerHTML = Math.round(cityData.current.temp_c) + "°"
    box.classList.add(`${city.split(" ").join("-")},${cityData.location.country.split(" ").join("-")}`)
    box.querySelector(".weatherImage").dataset.code = cityData.current.condition.code
  }
}
displayRandCities()
// update cities according to the mode
function UpdateCities() {
  chosedCities.forEach(city => {
    let weatherImage = document.querySelector(`.cities .box.${city} .weatherImage`)
    if (weatherImage) weatherImage.src = mainWeatherConditions[mode][weatherImage.dataset.code]
  })
}
// search new data according to box content (on click)
let citiesBoxes = document.querySelectorAll(".cities .box")
citiesBoxes.forEach(box => {
  box.addEventListener("mousedown", _ => {
    bigUpdate(box.classList[1])
    displayRandCities()
  })
})

// sliding on drag
let slider = document.querySelector(".cities")
let drag = false
let startY
let scrollTop
slider.addEventListener("mousedown", e => {
  drag = true
  e.preventDefault()
  startY = e.offsetY - slider.offsetTop
  scrollTop = slider.scrollTop
})
window.addEventListener("mouseup", e => {
  drag = false
})
slider.addEventListener("mouseleave", e => {
  drag = false
})
slider.addEventListener("mousemove", e => {
  if (!drag) return
  e.preventDefault()
  let walk = e.offsetY - slider.offsetTop - startY
  slider.scrollTop = scrollTop - walk
})
