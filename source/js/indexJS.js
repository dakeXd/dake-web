var activeElement = null;

function activateElement(element){
    if(activeElement!=null){
        activeElement.style.display = "none";
    }
    //console.log(element);
    var tempElement = document.getElementById(element);

    if(tempElement==activeElement){
        activeElement.style.display = "none";
        activeElement=null;
        return;
    }

    activeElement = tempElement;
    activeElement.style.display = "block";
    
    //console.log(activeElement);
    
}