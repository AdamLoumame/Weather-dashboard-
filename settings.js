import {UpdateMidle} from "./dashboard/midle.js"
import { updateCitiesWeather } from "./dashboard/lower.js"
import { toC,toF } from "./utilities.js"

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
2) api handling catching and so on
3) learn those opperators 
4) copyright rules on the bottom of settings.js
5) stats
cilcking on to loc icon map go to it 
*/



// forecast type
let forecastOption = document.querySelector(".forecast-type")
forecastOption.children[0].addEventListener("click",async _ => {
  if (forecastOption.classList.contains("days")) {
    forecastOption.classList.remove("days")
    forecastOption.classList.add("hours")
    await UpdateMidle(document.querySelector("header .left-part .location .loc-name").textContent.trim())
    document.querySelector(".midle .left-part .info .dates .week").innerHTML = "Next 7 hours"
    updateUnit()
  } else {
    forecastOption.classList.add("days")
    forecastOption.classList.remove("hours")
    await UpdateMidle(document.querySelector("header .left-part .location .loc-name").textContent.trim())
    document.querySelector(".midle .left-part .info .dates .week").innerHTML = "Next 7 days"
    updateUnit()
  }
})
// full screen
let fullScreenOption = document.querySelector(".fullScreen")
function fullScreen(){
  if (fullScreenOption.classList.contains("full")) {
    if (document.exitFullscreen) {
      fullScreenOption.classList.add("small")
      fullScreenOption.classList.remove("full")
      document.exitFullscreen()
      fullScreenOption.children[1].src = "/images/weather/simboles/full-screen.png"
    }
  } else {
    if (document.documentElement.requestFullscreen) {
      fullScreenOption.classList.add("full")
      fullScreenOption.classList.remove("small")
      document.documentElement.requestFullscreen()
      fullScreenOption.children[1].src = "/images/weather/simboles/minimized-screen.png"
    }
  }
}
document.addEventListener("keyup",e=>{
  if (e.key==="F11") e.preventDefault()
})
fullScreenOption.children[0].addEventListener("click", _ => {
  fullScreen()
})
// wind 
let windOption = document.querySelector(".tools .container .settings .wind")
windOption.children[0].addEventListener("click",async _=>{
  if (windOption.classList.contains("active")){
    windOption.classList.remove("active")
    upWind()
  }else{
    windOption.classList.add("active")
    upWind()
  }
})
async function upWind(){
  await UpdateMidle(document.querySelector("header .left-part .location .loc-name").textContent.trim())
  await updateCitiesWeather()
  updateUnit()
}
// temperature unit 
let tempOption = document.querySelector(".temp-unit")
tempOption.children[0].addEventListener("click",_=>{
  if (tempOption.classList.contains("F")){
    tempOption.classList.remove("F")
    tempOption.classList.add("C")
    changeUnitTemp("F")
  }else{
    tempOption.classList.add("F")
    tempOption.classList.remove("C")
    changeUnitTemp("C")
  }
})
export function changeUnitTemp(unit){
  let temps = [...document.querySelectorAll(".midle .left-part .main.week .day .temp"),document.querySelector(".midle .left-part .main.week .day.active .bottom .info p span"),...document.querySelectorAll('.lower .right .cities .box .info .temp'),...document.querySelectorAll(".left-part .main .left .temperature"),...document.querySelectorAll(".left-part .main .more .details .sec > div .value.temp")]
  temps.forEach(temp=>{
    if(temp.childElementCount === 0){
      let number = temp.innerHTML.match(/-?\d+/)?.[0]
      if (unit==="C" && temp.innerHTML.includes("C")) temp.innerHTML = temp.innerHTML.replace(number,toF(Number(number))),temp.innerHTML=temp.innerHTML.replace("C","F")
      if (unit==="F" && temp.innerHTML.includes("F")) temp.innerHTML = temp.innerHTML.replace(number,toC(Number(number))),temp.innerHTML=temp.innerHTML.replace("F","C")
    }else{
      let number = temp.children[0].innerHTML.match(/-?\d+/)?.[0]
      if (temp.children[1].innerHTML.includes("C") && unit ==="C"){
        temp.children[0].innerHTML = temp.children[0].innerHTML.replace(number,toF(Number(number)))
        temp.children[1].innerHTML = temp.children[1].innerHTML.replace("C","F")
      }
      if (temp.children[1].innerHTML.includes("F") && unit ==="F"){
        temp.children[0].innerHTML = temp.children[0].innerHTML.replace(number,toC(Number(number)))
        temp.children[1].innerHTML = temp.children[1].innerHTML.replace("F","C") 
      }
    }
  })
}
export function updateUnit(){
  if (tempOption.classList[1]==="F") changeUnitTemp("C") // retrive last unit 
}