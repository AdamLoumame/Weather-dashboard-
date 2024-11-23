import {UpdateMidle} from "./dashboard/midle.js"
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
// shadows
let elements = [...document.querySelectorAll("header .left-part .icons a"), document.querySelector(".midle .left-part .info .options"), document.querySelector(".main.today"), document.querySelector(".main.tomorrow"), document.querySelector(".ol-viewport canvas"), document.querySelector(".wide-view"), document.querySelector("#map"), ...document.querySelectorAll(".lower .right .cities .box")].filter(el => el)
let shadowsOption = document.querySelector(".shadows")
let shadow = "0 2px 6px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)"
shadowsOption.addEventListener("click", _ => {
  if (!shadowsOption.classList.contains("activated")) {
    shadowsOption.classList.add("activated")
    // changes
    elements.forEach(el => (el.style.boxShadow = shadow))
    document.querySelectorAll(".midle .left-part .main.week .day").forEach(day => (day.style.boxShadow = shadow))
    document.querySelectorAll(".midle .right-part .Chance-of-rain .Xaxis .axe .progress").forEach(prog => (prog.style.boxShadow = shadow))
  } else {
    shadowsOption.classList.remove("activated")
    // changes
    elements.forEach(el => (el.style.boxShadow = ""))
    document.querySelectorAll(".midle .left-part .main.week .day").forEach(day => (day.style.boxShadow = ""))
    document.querySelectorAll(".midle .right-part .Chance-of-rain .Xaxis .axe .progress").forEach(prog => (prog.style.boxShadow = ""))
  }
})

/*
1) wind yes no options 
2) dots chart (precip forecast) settings.js
4) copyright rules on the bottom of settings.js
5) getting loc and showing user loc data 


*/
// forecast type
let forecastOption = document.querySelector(".forecast-type")
forecastOption.children[0].addEventListener("click", _ => {
  if (forecastOption.classList.contains("days")) {
    forecastOption.classList.remove("days")
    forecastOption.classList.add("hours")
    UpdateMidle(document.querySelector("header .left-part .location .loc-name").textContent.trim())
    document.querySelector(".midle .left-part .info .dates .week").innerHTML = "Next 7 hours"
  } else {
    forecastOption.classList.add("days")
    forecastOption.classList.remove("hours")
    UpdateMidle(document.querySelector("header .left-part .location .loc-name").textContent.trim())
    document.querySelector(".midle .left-part .info .dates .week").innerHTML = "Next 7 days"
  }
})
// full screen
let fullScreenOption = document.querySelector(".fullScreen")
fullScreenOption.children[0].addEventListener("click", _ => {
  if (fullScreenOption.classList.contains("full")) {
    if (document.exitFullscreen) {
      fullScreenOption.classList.add("small")
      fullScreenOption.classList.remove("full")
      document.exitFullscreen()
      fullScreenOption.children[1].src = "/images/weather/simboles/full screen.png"
    }
  } else {
    if (document.documentElement.requestFullscreen) {
      fullScreenOption.classList.add("full")
      fullScreenOption.classList.remove("small")
      document.documentElement.requestFullscreen()
      fullScreenOption.children[1].src = "/images/weather/simboles/minimized screen.png"
    }
  }
})
// wind 
let windOption = document.querySelector(".tools .container .settings .wind")
windOption.children[0].addEventListener("click",_=>{
  if (windOption.classList.contains("active")){
    windOption.classList.remove("active")
  }else{
    windOption.classList.add("active")
  }
})
