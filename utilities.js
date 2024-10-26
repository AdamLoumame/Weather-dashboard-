export function datetoName(date){
    return new Date(date).toLocaleDateString("en",{weekday : "long"})
}
export function getBoxData(box,iterableData){
    let result 
    iterableData.forEach(dayData=>{
        if (datetoName(dayData.date) === box.classList[1]){
            result =  dayData
        }
    })
    return result 
}