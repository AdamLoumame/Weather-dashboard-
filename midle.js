// Air or Forecast
let options = document.querySelectorAll(".option")
options.forEach(option=>{
    option.addEventListener("click",_=>{
        options.forEach(op=>op.classList.remove("active"))
        option.classList.add("active")
        document.querySelector(".options").classList.remove("forecast","air")
        document.querySelector(".options").classList.add(option.innerHTML.split(" ")[0].toLowerCase())

        if (option.innerHTML.split(" ")[0].toLowerCase() === "air"){
            document.querySelector(".main-air").style.display = "block"
            document.querySelector(".dates").style.display = "none"
            document.querySelectorAll(".main").forEach(main=>main.classList.remove("active"))
        }else{
            document.querySelector(".main-air").style.display = "none"
            document.querySelector(".dates").style.display = "flex"
            let lastActive = document.querySelector(".date.active").classList[1]
            document.querySelector(`.main.${lastActive}`).classList.add("active")
        }
    })
})
// activating main while clicking on its date
document.querySelectorAll(".date").forEach(date=>{
    date.addEventListener("click",_=>{
        document.querySelectorAll(".date").forEach(date=>date.classList.remove("active"))
        date.classList.add("active")

        document.querySelectorAll(".main").forEach(main=>main.classList.remove("active"))
        let main = document.querySelector(`.main.${date.classList[1]}`)
        main.classList.add("active")
    })
})

// imports ( minimalize code )
import { datetoName , getBoxData} from "./utilities.js" 
import { weatherConditions } from "./dicts.js" 
import { getData } from "./api.js" // main fetching function 

// default
let data = await getData("marrakech") // default data that will be showed first to the user
let weekData = data.forecast.forecastday 
document.querySelector("header .left-part .location .loc-name").innerHTML = `${data.location.name}, <span>${data.location.country}</span>`

// search listeners
let searchBar = document.querySelector(".search-bar")
let searhcButton = document.querySelector(".search-button")
searhcButton.addEventListener("click",e=>{
    if (searchBar.value){
        OnSearch()        
    }
})
document.addEventListener("keyup",e=>{
    if (searchBar.value && e.code==="Enter"){
        OnSearch()        
    }
})



// changing data trough inputed value ( if there is )  
async function OnSearch(){
    data = await getData(searchBar.value)  // new data !
    weekData = data.forecast.forecastday
    // week changes
    let lastActiveIndex = Array.from(document.querySelector(".midle .left-part .main.week").children).indexOf(document.querySelector(".day.active"))
    display() // displaying fetched data and creating new boxes
    addBoxInteractions() // making new boxes interactive
    makeActive(document.querySelectorAll(".day")[lastActiveIndex]) // activate the first box

    // air changes
    
    // today changes

    // tommorow changes

    // changing to a new name city on the DOM
    document.querySelector("header .left-part .location .loc-name").innerHTML = `${data.location.name}, <span>${data.location.country}</span>`
}
////////////////          7 days ahead         /////////////// 
function display(){
    // clean the week box to add new data boxes
    document.querySelector(".midle .left-part .main.week").innerHTML = "" 

    // placing the first boxes according to the data first is the current day
    weekData.forEach(dayData=>{
        let dayName = datetoName(dayData.date)
        let shortDayName = dayName.slice(0,3)

        // getting the right image based on the mode (dark / light)
        let imagePack = document.querySelector(".mode").classList[1] // dark or light

        const boxDay = document.createElement("div")
        boxDay.innerHTML = `
        <span class="abr">${shortDayName}</span>
        <img src="${weatherConditions[imagePack][dayData.day.condition.code]}" alt="" class="weather-img" />
        <div class="temp">${Math.round(dayData.day.avgtemp_c)}°</div>
        `
        boxDay.classList.add("day",dayName)
        document.querySelector(".midle .left-part .main.week").appendChild(boxDay)
    })
}
display() // display the default data

// add events to the days so can be activate or unactivate (as a function so new created days can also be manupilated)
function addBoxInteractions(){
    let boxes = document.querySelectorAll(".midle .left-part .main.week .day")
    boxes.forEach(box=>{
        box.addEventListener("click",_=>{
            resetBoxes()
            makeActive(box)
        })
    })
}
addBoxInteractions() // making default boxes interactive 

// making active function
function makeActive(box){
    box.classList.add("active")
    
    let data = getBoxData(box,weekData)
    let month = new Date(data.date.slice(5,7)).toLocaleString("en",{month:"short"})

    // getting the right image based on the mode (dark / light)
    let imagePack = document.querySelector(".mode").classList[1] // dark or light
    box.innerHTML = `
        <div class="top">
            <h3 class="name">${datetoName(data.date)}</h3>
            <span class="month">${month} ${data.date.slice(8)}</span>
        </div>
        <div class="bottom">
            <div class="left">
                <div class="temp">${Math.round(data.day.avgtemp_c)}°</div>
                <div class="info">
                    <p class="real-feel">Real Feel<span class="number"> : ${Math.round(data.hour[15].feelslike_c)}°</span></p>
                    <p class="wind">max Wind<span class="number"> : ${data.day.maxwind_mph} Km/h</span></p>
                    <p class="pressure">Pressure<span class="number"> : ${Math.round(data.hour[15].pressure_mb)}MB</span></p>
                    <p class="humidity">Humidity<span class="number"> : ${Math.round(data.day.avghumidity)}%</span></p></div>
                </div>
            <div class="rigth">
                <img src="${weatherConditions[imagePack][data.day.condition.code]}" alt="" class="weather-img"/>
                <div class="info">
                    <p class="sunrise">Sunrise<span class="number"> : ${data.astro.sunrise}</span></p>
                    <p class="sunset">Sunset<span class="number"> : ${data.astro.sunset}</span></p>
                </div>
            </div>
        </div>
    `
}
makeActive(document.querySelectorAll(".day")[0]) // default active

// reset Boxes function ( so the active will be unactive )
function resetBoxes(){
    let boxes = document.querySelectorAll(".midle .left-part .main.week .day")
    boxes.forEach(box=>{
        box.classList.remove("active")

        // get the data of this box using its class 
        let finalData = getBoxData(box,weekData)
        
        // getting the right image based on the mode (dark / light)
        let imagePack = document.querySelector(".mode").classList[1] // dark or light

        box.innerHTML = `
            <span class="abr">${datetoName(finalData.date).slice(0,3)}</span>
            <img src="${weatherConditions[imagePack][finalData.day.condition.code]}" alt="" class="weather-img" />
            <div class="temp">${Math.round(finalData.day.avgtemp_c)}°</div>
        `
    })
}

export {makeActive,resetBoxes} // exporting updating week functions so to maintain dynamic changes