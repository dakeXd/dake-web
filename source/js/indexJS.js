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

function showSomething(element){
    var tempElement = document.getElementById(element);
    if(tempElement.style.display == "none"){
        console.log("activando");
        tempElement.style.display = "block";
        return;
    }
    console.log("desactivando");
    tempElement.style.display = "none";
}