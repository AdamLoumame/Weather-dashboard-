export async function getData(place){
    const result = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=e4b246c48b7247b88f3153127242510&q=${place}&days=7`)
    let data = await result.json()
    return data
}