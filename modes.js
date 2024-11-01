// some changes require funtions from other modules 
import {makeActive , resetBoxes} from './midle.js'
// all the changes that occures while changing mode 
function applyChanges(){
    // week changes
    let lastActive = document.querySelector(".day.active")
    if (document.querySelector(".day")){
        resetBoxes()
        if (lastActive){
            makeActive(lastActive)
        }
    }    
    // today / tomorrow changes
    
}

// applying mode from localStorage if there is  
if (localStorage.getItem("mode")){
    if (localStorage.getItem("mode") === "light"){
        light()
    }else{
        dark()
    }
}
// add event to modes checkboxes
document.querySelectorAll(".mode i").forEach(mode => {
    mode.addEventListener("click", _ => {
        // change the theme 
        if (mode.classList.contains("light")) {
            light(mode)
        } else {
            dark(mode)
        }
    })
})
// activate dark mode function
function dark(){
    // active class to the clicked
    document.querySelectorAll(".mode i").forEach(mode => mode.classList.remove("active"))
    document.querySelector(".mode .dark").classList.add("active")
    
    // controle the toggle position ( using ::before )
    document.querySelector(".mode").classList.remove("light")
    document.querySelector(".mode").classList.add("dark")

    document.documentElement.style.setProperty("--main-text-color", "white")
    document.documentElement.style.setProperty("--sec-text-color", "#b0b0b0")
    document.documentElement.style.setProperty("--bg-color", "#111015")
    document.documentElement.style.setProperty("--sec-bg-color", "#1e1e1e")
    document.documentElement.style.setProperty("--icon-bg-color", "#232325")
    document.documentElement.style.setProperty("--border-color", "#292929")
    document.documentElement.style.setProperty("--info-color", "#bbd7ec")
    localStorage.setItem("mode","dark")

    applyChanges()

    // error 404 changes
    document.querySelector(".cloud").src = "/images/weather/big images/dark cloud.png"
}
// activate light mode function
function light(){
    // active class to the clicked
    document.querySelectorAll(".mode i").forEach(mode => mode.classList.remove("active"))
    document.querySelector(".mode .light").classList.add("active")

    // controle the toggle position ( using ::before )
    document.querySelector(".mode").classList.remove("dark")
    document.querySelector(".mode").classList.add("light")

    document.documentElement.style.setProperty("--main-text-color", "#1c1c1c")
    document.documentElement.style.setProperty("--sec-text-color", "#5e5e5e")
    document.documentElement.style.setProperty("--bg-color", "#f7f7f7")
    document.documentElement.style.setProperty("--sec-bg-color", "#ffffff")
    document.documentElement.style.setProperty("--icon-bg-color", "#e9e9e9")
    document.documentElement.style.setProperty("--border-color", "#dcdcdc")
    document.documentElement.style.setProperty("--info-color", "#91c3e9")
    // saving last mode in localStorage
    localStorage.setItem("mode","light")

    applyChanges()

    document.querySelector(".cloud").src = "/images/weather/big images/light cloud.png"
}