/////////////////Variables/////////////////////////
var recursosCargados = false;                                   //Variable que comprueba si los recursos del juego ya han sido cargados
var canvas;                                                     //Variable que almacena el canvas de la pagina
var contexto;                                                   //Variable que almacena el contexto del canvas
var musicaAct = false;                                          //Variable que comprueba si la musica esta activada
var puntuacion = 0;                                             //Variable que almacena la puntuacion
var bolaEliminada = true;                                       //Variable que comprueba si la bola ha sido eliminada
var anchoBorde = 20;                                            //Variable que almacena el ancho lateral de la escena 
var anchoSuperior = 10;                                         //Variable que almacena el ancho superior de la escena
var anchoEscena = 0;                                            //Variable que almacenara el ancho total de la escena
var altoEscena = 0;                                             //Variable que almacenara el alto total de la escena
var temporizador = undefined;                                   //Variable que almacena el bucle de juego
var escenas = [];                                               //Variable que almacena las escenas del juego
var escenaActual = 0;                                           //Variable que almacena el indice de la escena actual
var multiplicador = 1;                                          //Variable que almacena el multiplicador de la puntuacion
var puntuacionDestruccion = 100;                                //Constante que almacena la puntuacion base por destruir un ladrillo
var puntuacionNivel = 1000;                                     //Constante que almacena la puntuacion base por pasar de nivel
var probabilidadPowerUp = 0.3;                                  //Constante que almacena la probabilidad de conseguir un Power Up
var numPowerUps = 7;                                            //Constante que almacena la cantidad de distintos powerUps que existen
var chX = 0;                                                    //Variable que almacena la posicion del raton en X
var numPelotas = 3;                                             //Variable que almacena las vidas restantes
var paused = true;                                              //Variable que indica si el juego esta pausado
//Variables para almacenar sonidos e imagenes
var audio1= document.getElementById("sonido1");
var audio2= document.getElementById("sonido2");
var audio3= document.getElementById("sonido3");
var audio4= document.getElementById("sonido4");
var audio5= document.getElementById("sonido5");
var audio6= document.getElementById("sonido6");
var musica= document.getElementById("sonido7");
var imagen1 = new Image();
imagen1.src = "Arkanoid_Sprites/fondo.png";
var imagen2 = new Image();
imagen2.src = "Arkanoid_Sprites/racket.png";
var imagen3 = new Image();
imagen3.src = "Arkanoid_Sprites/border_top.png";
var imagen4 = new Image();
imagen4.src = "Arkanoid_Sprites/border_left.png";
var imagen5 = new Image();
imagen5.src = "Arkanoid_Sprites/border_right.png";

/////////////////Clases/////////////////////////

//La clase pelota representara el objeto pelota del juego, que e a compuesta por los atributos aqui indicados
function Pelota(radio, velocidadX, velocidadY, posicionX, posicionY){

    this.radio = radio;
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.velocidadTotal = Math.abs(velocidadX) + Math.abs(velocidadY);              //La velocida total es la suma de las velocidades en X y en Y, que se mantendra constante mientras no se altere con powerUps o cambios de nivel

}

//Funcion de la clase pelota que nos permite actualizar su posicion
Pelota.prototype.actualizarPelota = function(){

    if(this.radio!=0){            //Si el radio es 0, la pelota no existe y no tendremos que actualizarla (Util para cuando eliminamos pelotas)
        //Si la pelota choca contra cualquiera de los bordes (menos el inferior), rebotara, por lo que su velocidad em esa direcion se invierte, ademas de sonar un audio que corresponde a esta accion
        if(this.posicionX + this.radio >= anchoEscena || this.posicionX  - this.radio <= anchoBorde){  
            this.velocidadX = -this.velocidadX;
            reactivarSonido(audio2);
        }
        if(this.posicionY - this.radio <= anchoSuperior){
            this.velocidadY = -this.velocidadY;
            reactivarSonido(audio2);
        }
        //Actualizamos la posicion de la pelota con cada una de sus velocidades
        this.posicionX += this.velocidadX;
        this.posicionY += this.velocidadY;

        //Si la pelota se sale de la escena, la eliminaremos (Pero como cada escena tiene una pelota asignada, no podemos hacer esto, asique le damos unos valores para que, a efecto tanto del juego como del jugador, no exista)
        if(this.posicionY > altoEscena){
            this.radio = 0;
            this.velocidadTotal = 0;
            this.velocidadX = 0;
            this.velocidadY = 0;
            this.posicionX = 0;
            this.posicionY= 0;
            numPelotas--;                   //Reducimos el numero de vidas restantes
            reactivarSonido(audio3);                  //Ejectuamos el audio correspondiente
            bolaEliminada = true;           //La bola ha sido eliminada, asique le damos un valor de true a este booleano
        }
    }
}



//La clase ladrillo representa los rectangulos que el jugador debe destruir para avanzar
function Ladrillo(ancho, alto, vidas, posicionX, posicionY){
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.alto = alto;
    this.ancho = ancho;
    this.vidas = vidas;                 //Vidas indica el numero de veces que hay que golpear al ladrillo para que desaparezca
}   

//La clase paleta representa la raqueta que usa el jugador para golpear la pelota
function Paleta(ancho, alto, velocidadMax, posicionX, posicionY){
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.alto = alto;
    this.ancho = ancho;
    this.velocidadMax = velocidadMax;   //No queremos que la paleta pueda moverse de un lado a otro de la escena en un instante, asique tendra una velocidad maxima que puede desplazarse en cada iteracion
}

//Funcion de la clase Paleta que actualiza su posicion
Paleta.prototype.actualizarPosicion = function(posicionRatonX){

    var distancia = posicionRatonX - this.posicionX-this.ancho/2; //Distancia entre la posicion del raton y el centro de la paleta

    //Vamos a desplazarnos hasta la posicion del raton, pero si la distancia es mayor que la velocidad maxima, solo nos desplazaremos esa distancia
    if(distancia >= this.velocidadMax){                   //Comprobamos que la distancia sea mayor que la velocidadMax
        this.posicionX += this.velocidadMax;   
    }else{
        if(distancia <= -this.velocidadMax){              //Comprobamos que la distancia sea mayor que la velocidadMax, pero en -x
            this.posicionX -= this.velocidadMax;
        }else{                                            //Si no se han cumplido las condiciones anteriores, desplazamos la paleta a la posicion del raton, ya que la distnacia entre paleta y raton no sobrepasa la indicada por la velocidad maxima
            this.posicionX = posicionRatonX-this.ancho/2;        
        }
    }

    //Comprobamos que la paleta no este fuera del canvas
    if(this.posicionX < anchoBorde){        
        this.posicionX = anchoBorde;
    }
    if(this.posicionX+this.ancho > anchoEscena){        
        this.posicionX = anchoEscena - this.ancho;
    }

}

//La clase escena guardara toda la informacion de cada nivel
function Escena(ladrillos, pelota, paleta){
    this.ladrillos = ladrillos;
    this.pelota = pelota;
    this.paleta = paleta;
    this.powerUps = [];
}

Escena.prototype.comprobarColisiones = function(){
    
    //Comprobamos todos los ladrillos para ver si alguno de ellos colisiona con la pelota
    for(var i = 0;i <this.ladrillos.length; i++){

        //Para comprobar las colisiones de una bola con un rectangulo lo primero es calcular el punto del rectangulo más cercano al circulo
        //Si el circulo estuviese dentro del rectangulo, este punto seria el centro mismo del circulo.
        var puntoRectX = this.pelota.posicionX; 
        var puntoRectY = this.pelota.posicionY;
        //Comprobamos si el circulo esta fuera del rectangulo por la izquierda o la derecha, el punto mas cercano
        //al circulo sera el punto del perimetro que mas cerca este, por lo que la x sera igual o a la posicion X del rectangulo (Recordemos que la posicion del rectangulo
        //viene dada por la esquina superior derecha) o a la posicion x mas el ancho del rectanuglo. Haremos exactamente lo mismo para el Y con la altura
        //Si se diese que el circulo no esta ni a la derecha ni a la izquierda (o arriba o abajo), El punto sera igual que la posicion del circulo
        if(this.pelota.posicionX <= this.ladrillos[i].posicionX){
            puntoRectX = this.ladrillos[i].posicionX;
        }
        if(this.pelota.posicionX >= this.ladrillos[i].posicionX + this.ladrillos[i].ancho){
            puntoRectX = this.ladrillos[i].posicionX + this.ladrillos[i].ancho;
        }
        if(this.pelota.posicionY <= this.ladrillos[i].posicionY){
            puntoRectY = this.ladrillos[i].posicionY;
        }
        if(this.pelota.posicionY >= this.ladrillos[i].posicionY + this.ladrillos[i].alto){
            puntoRectY = this.ladrillos[i].posicionY + this.ladrillos[i].alto;
        }
        //Una vez tenemos el punto, calcularemos su distancia con el centro del circulo y si esta es menor que el radio de este habra colision
        var distanciaCol = Math.sqrt((puntoRectY-this.pelota.posicionY)*(puntoRectY-this.pelota.posicionY) + (puntoRectX-this.pelota.posicionX)*(puntoRectX-this.pelota.posicionX));
        if(distanciaCol<=this.pelota.radio){
            reactivarSonido(audio1);                                                                                                         //Ejecutamos el audio correspondiente al suceso
            this.ladrillos[i].vidas = this.ladrillos[i].vidas-1;                                                                    //Restamos uno al numoer de vidas restantes del ladrillos
            if(puntoRectX>this.ladrillos[i].posicionX && puntoRectX<this.ladrillos[i].posicionX + this.ladrillos[i].ancho ){        //Si la pelota esta colisionando dentro del ancho de la pelota, rebotara en Y
                this.pelota.velocidadY = -this.pelota.velocidadY;
            }else{
                if(puntoRectY>this.ladrillos[i].posicionY && puntoRectY<this.ladrillos[i].posicionY + this.ladrillos[i].alto ){     //Si la pelota esta colisionando dentro del alto de la pelota, rebotara en X
                this.pelota.velocidadX = -this.pelota.velocidadX;
                }else{                                                                                                              //Si no esta colisionando con ninguno de ellos, la pelota estara chocando contra una esquina y rebotara en los dos ejes
                    this.pelota.velocidadX = -this.pelota.velocidadX;
                    this.pelota.velocidadY = -this.pelota.velocidadY;
                }
            }
            
            //Si la vida de los ladrillos se reduce a 0, estos seran eliminados
            if(this.ladrillos[i].vidas <= 0){
                var generarPowerup = Math.random();                         //Generamos un numero random para generar Power Ups
                if(generarPowerup <= probabilidadPowerUp){                  //Si el numero generado es menor que la probabilidad de crar un nuevo Power Up, creamos uno nuevo
                    var numPower = Math.ceil(Math.random()*numPowerUps)     //Generamos aleatoriamente uno de los distintos powerUps que existen, que vienen dados por el valor numPowerUps
                    var nuevoPower = new PowerUp(numPower, this.ladrillos[i].posicionX + this.ladrillos[i].ancho/2, this.ladrillos[i].posicionY + this.ladrillos[i].alto/2,10, 4  );    //Creamos un nuevo powerUp en la posicion del centro del ladrillo
                    this.powerUps.push(nuevoPower);                         //Añadimos el Power Up al array de Power Ups
                }
                puntuacion += puntuacionDestruccion*multiplicador;          //Añadimos a la puntuacion la puntuacion por destruir un ladrillo por el multiplicador de puntuacion
                multiplicador += 0.05;                                      //Aumentamos el valor del multiplicador de puntuacion
                this.ladrillos.splice(i,1);                                 //Eliminamos el ladrillos

            }
            this.pelota.actualizarPelota();                                 //Actualizamos la posicion de la pelota para evitar que choque con otros ladrillos y los atraviese
        }
    }

    //Siguiendo el modelo de colisiones anteriores, hacemos lo mismo con los powerUps (que son circulos) y la paleta (que es un rectangulo)
    for(var i = 0; i<this.powerUps.length; i++){
        var puntoRectX = this.powerUps[i].posicionX; 
        var puntoRectY = this.powerUps[i].posicionY;

        if(this.powerUps[i].posicionX <= this.paleta.posicionX){
            puntoRectX = this.paleta.posicionX;
        }
        if(this.powerUps[i].posicionX >= this.paleta.posicionX + this.paleta.ancho){
            puntoRectX = this.paleta.posicionX + this.paleta.ancho;
        }
        if(this.powerUps[i].posicionY <= this.paleta.posicionY){
            puntoRectY = this.paleta.posicionY;
        }
        if(this.powerUps[i].posicionY >= this.paleta.posicionY + this.paleta.alto){
            puntoRectY = this.paleta.posicionY + this.paleta.alto;
        }
        var distanciaCol = Math.sqrt((puntoRectY-this.powerUps[i].posicionY)*(puntoRectY-this.powerUps[i].posicionY) + (puntoRectX-this.powerUps[i].posicionX)*(puntoRectX-this.powerUps[i].posicionX));
        if(distanciaCol<=this.powerUps[i].radio){
            this.powerUps[i].aplicarModificacion(this);         //Si se recoge el power up, se aplica su modificacion correspondiente en la escena actual
            this.powerUps.splice(i,1);                          //Eliminamos el power up de la escena
            reactivarSonido(audio6);                                    //Ejecutamos el audio correspondiente
        }else{
            if(this.powerUps[i].posicionY>canvas.height){       //Si el Power Up sale de la escena, lo eliminaremos
                this.powerUps.splice(i,1);;
            }
        }
    }
    
    //Segumos el modelo de las colisiones anteriores para comprobar las colisiones entre la pelota y la paleta
    var puntoRectX = this.pelota.posicionX; 
    var puntoRectY = this.pelota.posicionY;
    if(this.pelota.posicionX <= this.paleta.posicionX){
        puntoRectX = this.paleta.posicionX;
    }
    if(this.pelota.posicionX >= this.paleta.posicionX + this.paleta.ancho){
        puntoRectX = this.paleta.posicionX + this.paleta.ancho;
    }
    if(this.pelota.posicionY <= this.paleta.posicionY){
        puntoRectY = this.paleta.posicionY;
    }
    if(this.pelota.posicionY >= this.paleta.posicionY + this.paleta.alto){
        puntoRectY = this.paleta.posicionY + this.paleta.alto;
    }
    var distanciaCol = Math.sqrt((puntoRectY-this.pelota.posicionY)*(puntoRectY-this.pelota.posicionY) + (puntoRectX-this.pelota.posicionX)*(puntoRectX-this.pelota.posicionX));
    if(distanciaCol<=this.pelota.radio){
      
            //Normalizamos la distanica entre el centro de la paleta y el circulo ()
            var distancia2 =  (this.paleta.posicionX + this.paleta.ancho/2) - this.pelota.posicionX ; //Distancia entre el centro de la paleta y el circulo
            distancia2 = distancia2/(this.paleta.ancho/2);                                            //Hacemos que este valor este entre -1 y 1

            //Para evitar que la pelota salga directamente horizontal o vertical, le damos unos valores minimos y maximos a la distancia maxima
            if(distancia2 <=0.3 && distancia2>0){
                distanica2 = 0.3;
            } 
            if(distancia2 >=-0.3 && distancia2<=0){
                distanica2 = -0.3;
            }
            if(distancia2>0.7){
                distancia2 = 0.7;
            } 
            if(distancia2<-0.7){
                distanica2 = -0.7;
            }
            //La velocidad en X sera la velocidad total por menos la distancia2, recordemos que distancia 2 es proporcionalmente la distancia que separa la bola de la paleta en x, asique
            //Cuanto mayor sea esta, mas en el extremo estamos dando y querremos que salga con mayor angulo, ademas, el - es para invertir la velocidad, ya que estamos rebotando. Como la velocidad
            //Total es la suma de la velocidad X e Y, si tomamos un valor entre 0 y 1 y multiplicamos una por este, y la otra por 1 menos ese valor, la suma de esas velocidades seguira siendo la misima
            //Ejemplo: velocidadT = 4, valor = 0.6, 4*0.6 = 2.4, 4*(1-0.6) = 1.6, 1.6+2.4 = 4
            //Ejemplo2: velocidadT = 4; valor = 0.9, 4*0.9 = 3.6, 4*(1-0.9) = 0.4. 3.6+0.4 = 4
            this.pelota.velocidadX = this.pelota.velocidadTotal*(-distancia2) ;
            //COmo hemos hecho ne los ejemplos anteriores, la velocidad en Y sera la absoluta por 1 menos distancia2, mas bien por el valor absoluto de esta, para que si el valor es negativo, el valor no sea mayor de uno
            this.pelota.velocidadY = -this.pelota.velocidadTotal*(1-Math.abs(distancia2));
            reactivarSonido(audio4);  //Ejecutamos el audio correspondiente
      
    }
        
       
}
//Funcion de escena que actualiza sus elementos
Escena.prototype.actualizarEscena = function(){
    
    if(numPelotas>=0){                                  //Solo seguiremos actualizando si nos quedan vidas
        this.comprobarColisiones();                     //Comprobamos las colisiones de los objetos de la escena
        this.pelota.actualizarPelota();                 //Actualizamos la pelota
        this.paleta.actualizarPosicion(chX);            //Actualizamso la paleta
        for(var i = 0; i<this.powerUps.length; i++){    //Actualizamos todos los powerUps
            this.powerUps[i].actualizarPowerUp();
        }
        dibujarJuego(escenas[escenaActual]);            //Dibujamos la escena ya actualizada
    }else{
        pararJuego(1);                                   //Si el numero de vidas se ha reducido por debajo de 0, terminamos el juego
    }

    if(this.ladrillos.length <= 0){                     //Si el numero de ladrillos de la escena se reduce a 0, cambiaremos de escena
        if(escenaActual<escenas.length-1){              //Si siguen quedando escenas, pasamos a la siguiente
            escenaActual++;
            puntuacion += puntuacionNivel*escenaActual; //Aplicamos el multiplicador de escena que sera la puntuacion por pasar de nivel por el numero de escena siguiente (si la puntuacionNIvel es 0, para escena 0 1000, para escena 1 2000...)
            bolaEliminada = true;                       //La bola se elimina para poder crear otra en la nueva escena
        }else{
            pararJuego(2);                               //Si no quedan escenas, habremos acabado el juego y saldra un mensaje de victoria
        }
    }

    if(musica.paused && musicaAct){                     //Si la musica esta activada y la pista se acaba, se reinicia
        musica.play();
    }
}

//Funcion de la clase Escena que dibuja sus elementos
Escena.prototype.dibujarEscena = function(){

    //Dibujamos una curva cerrada alrededor de la posicion de la bola y la rellenamos (es decir, hacemos un circulo)
    contexto.beginPath();
    contexto.arc(this.pelota.posicionX,this.pelota.posicionY,this.pelota.radio,0,(Math.PI/180)*360,true);
    contexto.strokeStyle = "rgb(90, 90, 0)";
    contexto.lineWidth = 1;
    contexto.fillStyle="rgb(255, 207, 142)";
    contexto.fill();
    contexto.stroke();
    contexto.closePath();

    //Dibujamos el sprite de la paleta en la posicion de esta con sus dimensiones
    contexto.drawImage(imagen2,this.paleta.posicionX, this.paleta.posicionY, this.paleta.ancho, this.paleta.alto );

   //Dibujamos cada uno de los ladrillos con un color correspondiente a su numero de vidas
    for(var i = 0; i<this.ladrillos.length; i++){          
        //seleccionamos el color segun las vidas restantes
        switch(this.ladrillos[i].vidas){
            
            case 1:
                contexto.fillStyle="rgb(0, 0, 160)";
                break;
            case 2:
                contexto.fillStyle="rgb(0, 160, 0)";
                break;
            case 3:
                contexto.fillStyle="rgb(160, 0, 0)";
                break;
            case 4:
                contexto.fillStyle="rgb(160, 160, 0)";
                break;
            case 5:
                contexto.fillStyle="rgb(0, 160, 160)";
                break;
            case 6:
                contexto.fillStyle="rgb(160, 0, 160)";
                break;
            default: 
                contexto.fillStyle="rgb(0, 0, 0)";
                break;  
        }
        //Dibujamos un rectangulo en la posicion del ladrillo
        contexto.fillRect(this.ladrillos[i].posicionX, this.ladrillos[i].posicionY, this.ladrillos[i].ancho, this.ladrillos[i].alto);
        contexto.strokeRect(this.ladrillos[i].posicionX, this.ladrillos[i].posicionY, this.ladrillos[i].ancho, this.ladrillos[i].alto);
    
    }

    //Dibujamos cada uno de los powerUps de la escena
    var escrito = false; //Escrito indica si ya hemos escrito algo en la pantalla

    for(var i = this.powerUps.length-1; i>=0; i--){  //Recorremos el array al reves para que se escriba la informacion del ultimo power Up que ha aparecido
        //Dibujamos un circulo como el que hicimos con la bola
        contexto.beginPath();
        contexto.arc(this.powerUps[i].posicionX,this.powerUps[i].posicionY,this.powerUps[i].radio,0,(Math.PI/180)*360,true);
        contexto.strokeStyle = "rgb(0, 90, 180)";
        contexto.lineWidth = 1;
        //Ademas de la esfera vamos a escribir su efecto en la parte inferior de la pantalla
        contexto.font = "20px sans-serif"
        switch(this.powerUps[i].indice){
            case 1:
                contexto.fillStyle="rgb(180, 0, 0)";
                if(!escrito){
                    contexto.fillText("Aumenta el tamaño de la paleta",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
            case 2:
                contexto.fillStyle="rgb(0, 180, 0)";
                if(!escrito){
                    contexto.fillText("Reduce el tamaño de la paleta",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
            case 3:
                contexto.fillStyle="rgb(0, 0, 180)";
                if(!escrito){
                    contexto.fillText("Aumenta la velocidad de la paleta",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
            case 4:
                contexto.fillStyle="rgb(180, 0, 180)";
                if(!escrito){
                    contexto.fillText("Reduce la velocidad de la paleta",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
            case 5:
                contexto.fillStyle="rgb(0, 180, 180)";
                if(!escrito){
                    contexto.fillText("Aumenta la velocidad de la bola",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
            case 6:   
                contexto.fillStyle="rgb(180, 180, 0)";
                if(!escrito){
                    contexto.fillText("Reduce la velocidad de la bola",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
            default:
                contexto.fillStyle="rgb(180, 180, 180)";
                if(!escrito){
                    contexto.fillText("Vida extra",canvas.width*2/3,canvas.height*11/12);
                escrito = true;
                }
                break;
        }
        contexto.fill();
        contexto.stroke();
        contexto.closePath();
        
    }
}

//La clase PowerUp representa diferentes buffs y nerffs que nos adectaran durante la partida, se representa con una esfera con distintos colores segun su efecto
function PowerUp (indice, posicionX, posicionY, radio, velocidadY){
    this.indice = indice;
    this.posicionX = posicionX;
    this.posicionY = posicionY;
    this.radio = radio;
    this.velocidadY = velocidadY;
    //Efectos segun el indice:
    //1-Agrandar paleta
    //2-disminuir paleta
    //3-Aumentar velocidad paleta
    //4-Disminuir celocidad paleta
    //5-Aumentar velocidad pelota
    //6-Disminuir velocidad pelota
    //7-vida extra
}

//Funcion de la clase PowerUp que aplica su modificador correspondiente a la escena indicada
PowerUp.prototype.aplicarModificacion = function(escenaAc){
    //Haremos un switch del indice para aplicar los distintos efectos 
    switch(this.indice){
        case 1:        
            escenaAc.paleta.ancho = escenaAc.paleta.ancho*1.25;
            break;
        case 2:
            escenaAc.paleta.ancho = escenaAc.paleta.ancho*0.8;
            break;
        case 3:
            escenaAc.paleta.velocidadMax = escenaAc.paleta.velocidadMax*1.25;
            break;
        case 4:
            escenaAc.paleta.velocidadMax = escenaAc.paleta.velocidadMax*0.8;
            break;
        case 5:
            //Queremos que al aumentar la velocidad de la pelota, esta siga manteniendo la misma direccion ,por lo que el aumento se aplica a la velocidad maxima y proporcionalmente a las velocidades en X e Y
            var aumento = escenaAc.pelota.velocidadTotal*1.25 - escenaAc.pelota.velocidadTotal;
            var propX =  Math.abs(escenaAc.pelota.velocidadX)/ escenaAc.pelota.velocidadTotal;      //Proporcion de la velocidad en X respecto a la velocidad total
            var propY =  Math.abs(escenaAc.pelota.velocidadY)/ escenaAc.pelota.velocidadTotal;      //Proporcion de la velocidad en Y respecto a la velocidad total
            //Aumentamos la velocidad en proporcion a cada uno de los ejes
            escenaAc.pelota.velocidadX += aumento*propX * escenaAc.pelota.velocidadX/Math.abs(escenaAc.pelota.velocidadX);
            escenaAc.pelota.velocidadY += aumento*propY * escenaAc.pelota.velocidadY/Math.abs(escenaAc.pelota.velocidadY);
            escenaAc.pelota.velocidadTotal += aumento;
            
            break;
        case 6:
            //Queremos que al reducir la velocidad de la pelota, esta siga manteniendo la misma direccion ,por lo que el aumento se aplica a la velocidad maxima y proporcionalmente a las velocidades en X e Y
            var aumento = escenaAc.pelota.velocidadTotal*0.8 - escenaAc.pelota.velocidadTotal;
            escenaAc.pelota.velocidadTotal += aumento;
            var propX =  Math.abs(escenaAc.pelota.velocidadX)/ escenaAc.pelota.velocidadTotal;      //Proporcion de la velocidad en X respecto a la velocidad total
            var propY =  Math.abs(escenaAc.pelota.velocidadY)/ escenaAc.pelota.velocidadTotal;      //Proporcion de la velocidad en Y respecto a la velocidad total
            //Aumentamos la velocidad en proporcion a cada uno de los ejes
            escenaAc.pelota.velocidadX += aumento*propX * escenaAc.pelota.velocidadX/Math.abs(escenaAc.pelota.velocidadX);
            escenaAc.pelota.velocidadY += aumento*propY * escenaAc.pelota.velocidadY/Math.abs(escenaAc.pelota.velocidadY);
            break;
        default:
            numPelotas++;
            break;
    }
}

//funcion de la clase powerUp que actualzia su posicion
PowerUp.prototype.actualizarPowerUp = function(){
    this.posicionY+=this.velocidadY;
}

/////////////////Funciones/////////////////////////

//Funcion que carga los diferentes elementos del juego y muestra la pantalla de inicio
function iniciarJuego(){              
    //Si los recursos no se han cargado todavia, los cargamos
    if(!recursosCargados){
        canvas = document.getElementById("lienzo");                     //Cargamos el canvas                                              
        contexto = canvas.getContext("2d");                             //Cargamos el contexto de canvas
        canvas.addEventListener("mousemove", pasarRaton, false);        //Cargamos la funcion correspondiente al movimiento del raton
        canvas.addEventListener("click", clickRaton, false);            //Cargamos la funcion correspondiente al clicj del raton
        anchoEscena = canvas.width-anchoBorde;                          //El ancho de la escena sera el ancho del canvas menos el ancho del borde
        altoEscena = canvas.height-anchoSuperior;                       //El alto de la escena sera el alto del canvas menos el ancho del top
        recursosCargados = true;                                        //Indicamos que ya hemos cargado los recursos
    }
    pararJuego(0);                                                       //Si el juego esta iniciado, lo paramos
    paused = true;                                                      //Indicamos que el juego esta pausado
    //Dibujamos los diferentes elementos del fondo
    contexto.drawImage(imagen1, 0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagen3, 0, 0, canvas.width, anchoSuperior);
    contexto.drawImage(imagen4, 0, anchoSuperior, anchoBorde, canvas.height-anchoSuperior);
    contexto.drawImage(imagen5, canvas.width-anchoBorde, anchoSuperior, anchoBorde, canvas.height-anchoSuperior);
    //Escribimos lo correspondiente a la pantalla de inicio
    contexto.font = "bold 60px comic-sans";
    contexto.fillStyle = "rgb(160, 90, 0)";
    contexto.fillText("Para jugar pulsa Inicio",canvas.width/6,canvas.height/3);
    contexto.font = "bold 45px comic-sans";
    contexto.fillStyle = "rgb(160, 90, 0)";
    contexto.fillText("Usa el raton para mover la paleta ",canvas.width/5.5,canvas.height/2);
    contexto.fillText("Pulsa el click izq para lanzar una pelota",canvas.width/8.1,canvas.height*2/3);
}

//Funcion que activa/desactiva la musica en el juego
function volumen(){             
    if(!musicaAct){
        musica.play();
        musicaAct = true;
    }else{
        musica.pause();
        musicaAct = false;
    }

}

//Funcion que reinicia los elementos del juego y empieza una nueva partida
function reiniciarJuego(){                  
    pararJuego(0);                      //Si el juego esta iniciado, lo paramos

    numPelotas = 3;                     //reiniciamos la cuenta de vidas
    puntuacion = 0;                     //reiniciamos la puntuacion
    multiplicador = 1;                  //reiniciamos el multiplicador
    escenas.splice(0, escenas.length);  //Eliminamos todas las escenas del array de escenas
    escenaActual = 0;                   //Volvemos a colorcarnos en la escena 0
    
    cargarEscenas();                    //Cargamos de nuevo todas las escenas
   
    temporizador = setInterval("escenas[escenaActual].actualizarEscena()", 20);     //Activamos un bucle con la funcion de atualizar la escena actual
    paused = false;                                                                 //Indicamos que el juego ha dejado de estar pausado
}


function pararJuego(codigo){
    //Mensajes correspondientes a los diferentes codigos:
    //0-nada
    //1-Derrota
    //2-Victoria

    bolaEliminada = true;                                                            //Indicamos que la bola ha sido eliminada
    clearInterval(temporizador);                                                     //Limiamos el temporizador
    temporizador = undefined;                                                        //le asignamos un valor nulo
    contexto.font = "bold 60px sans-serif";                                          //Iniciamos unos valores para escribir un mensaje en la pantalla
    contexto.fillStyle = "rgb(160, 90, 0)"
    switch(codigo){                                                                  //Hacemos un switch del codigo para indicar el mensaje que saldra por pantalla
        case 1:
            contexto.fillText("Has perdido",canvas.width/3.05,canvas.height/2);
            break;
        case 2:
            contexto.fillText("Has ganado, Enhorabuena!",canvas.width/8,canvas.height/2);
            break;
        default:
            break;
    }                                                                                                  
}

//funcion que dibuja el juego
function dibujarJuego(escena){
    contexto.drawImage(imagen1, 0, 0, canvas.width, canvas.height);     //dibujamos la imagen de fondo
    
    escena.dibujarEscena();                                             //Dibujamos la escena actual

    for(var i = 0; i<numPelotas; i++){                                  //Dibujamos en la parte inferior de la pantalla el numero restante de vidas
        contexto.beginPath();
        contexto.arc(i*canvas.width/20 + canvas.width/12 ,canvas.height*11/12,10,0,(Math.PI/180)*360,true);
        contexto.strokeStyle = "rgb(90, 90, 0)";
        contexto.lineWidth = 1;
        contexto.fillStyle="rgb(255, 207, 142)";
        contexto.fill();
        contexto.stroke();
        contexto.closePath();    
    }

    //Dibujamos los bordes
    contexto.drawImage(imagen3, 0, 0, canvas.width, anchoSuperior);
    contexto.drawImage(imagen4, 0, anchoSuperior, anchoBorde, canvas.height-anchoSuperior);
    contexto.drawImage(imagen5, canvas.width-anchoBorde, anchoSuperior, anchoBorde, canvas.height-anchoSuperior);

    //Mostramos la puntuacion
    contexto.fillStyle="rgb(180, 180, 30)";
    contexto.font = "10px sans-serif"
    contexto.fillText("Puntuacion " + puntuacion ,canvas.width/20,canvas.height/20);
}

//Funcion que carga las distintas escenas
function cargarEscenas(){

    bola1 = new Pelota(0, 0,  0,0, 0);                                      //No podemos iniciar una escena sin bola, por lo que le asignaremos a todas una bola nula
    paleta1 = new Paleta(100, 15, 20, canvas.width/2, canvas.height*7/8);   //Paleta de la escena
    bloques1 = [];                                                          //Array que almacena todos los ladrillos de la escena
    for(var i = 0; i<3; i++){                                               //Tendremos 3 filas
        for(var j = 0; j < 8; j++){                                         //Tendremos 8 columnas
            //Dividimos el ancho de escena entre el numero de columnas para obtener el ancho de cada ladrillo y que cubran todo el ancho de la pantalla
            //El alto es mas arbitrario y sera un dieciseisavo del alto de la escena
            //Las vidas del ladrillo sera la fila en la que se encuentran + 1 (en la fila 0, 1, en la fila 1, 2...)
            //La posicion sera lo que ocupa cada ladrillo por su columna, ya que todos los ladrillos ocupan lo mismo
            //Para el alto haremos lo mismo, pero con la inversa de i para empezar a dibujar por debajo
            ladrilloAux = new Ladrillo((anchoEscena-anchoBorde)/8, altoEscena/16, i+1, (anchoEscena-anchoBorde)/8*j + anchoBorde, altoEscena/16*(4-i) + anchoSuperior);
            //Metemos el ladrillo al array de bloques
            bloques1.push(ladrilloAux);
        }
    }
    //Creamos una nueva escena con los lementos anteriores y la metemos en el array de escenas
    escena1 = new Escena(bloques1, bola1, paleta1);
    escenas.push(escena1);
    
    //El resto e escenas se crearan exactamente igual, pero con ligeros cambios

    //La escena 2 no tendra bloques en los laterales y tendra una fila mas y dos columnas extra
    //Ademas de lo anterior  los bloques tienen la vida al reves de la escena anterior, asi en la primera fila estan los bloques con mas vida y en la ultima los de menos
    bloques2 = [];
    paleta2 = new Paleta(100, 15, 20, canvas.width/2, canvas.height*7/8);
    for(var i = 0; i<4; i++){
        for(var j = 0; j<10; j++){
            if(j!= 0 && j!=9){
                ladrillosAux = new Ladrillo((anchoEscena-anchoBorde)/10, altoEscena/16, 4-i, (anchoEscena-anchoBorde)/10*j + anchoBorde, altoEscena/16*(5-i) + anchoSuperior);
                bloques2.push(ladrillosAux);
            }
        }
    }
    escena2 = new Escena(bloques2, bola1, paleta2);
    escenas.push(escena2);

    //La escena 3 tiene mas filas y columnas, pero las columnas centrales tienen todos sus ladrillos con 2 vidas y tiene algunos bloques vacios
    paleta3 = new Paleta(100, 15, 20, canvas.width/2, canvas.height*7/8);
    bloques3 = [];
    for(var i = 0; i<4; i++){
        for(var j = 0; j<12; j++){
            if(i!=j && i+j!=11){
                var vidas = i+1;
                if(j==6 || j == 5){
                    vidas = 2;
                }
                ladrillosAux = new Ladrillo((anchoEscena-anchoBorde)/12, altoEscena/16, vidas, (anchoEscena-anchoBorde)/12*j + anchoBorde, altoEscena/16*(5-i) + anchoSuperior);
                bloques3.push(ladrillosAux);
            }
        }
    }
    escena3 = new Escena(bloques3, bola1, paleta3);
    escenas.push(escena3);

    //La escena 4 es bastante mas grande, debido a sus 6 filas, debido a eso volvemos a poner 8 columnas para evitar un numero excesivo de ladrillos
    //Ademas de esto, los laterales tienen 2 de vida y los ladrillos forman una imagen que referencia a un famoso videojuego. ¿Cual? Bueno, tendras que llegar hasta aqui para averiguarlo
    paleta4 =  new Paleta(100, 15, 20, canvas.width/2, canvas.height*7/8);
    bloques4 = [];
    for(var i = 0; i<6; i++){
        for(var j = 0; j<8; j++){
           
                var vidas = i+1;
                if(vidas == 3){
                    vidas = 2;
                }
                if((j==1 || j == 2 || j==5 || j== 6) && (i ==5|| i==4)){
                    vidas = 3;
                }
                if((j== 3 || j == 4) && (i ==2 || i == 3)){
                    vidas = 3
                }
                if((j== 2 || j ==5) && (i==2 || i==1)){
                    vidas = 3;
                }
                if(j== 0 || j == 7){
                    vidas = 2;
                }
                
                ladrillosAux = new Ladrillo((anchoEscena-anchoBorde)/8, altoEscena/16, vidas, (anchoEscena-anchoBorde)/8*j + anchoBorde, altoEscena/16*(7-i) + anchoSuperior);
                bloques4.push(ladrillosAux);
            
        }
    }
    escena4 = new Escena(bloques4, bola1, paleta4);
    escenas.push(escena4);


}

//funcion que se ejecuta con el movimiento del raton
function pasarRaton(evt){
   
    var ClientRect = canvas.getBoundingClientRect();    //Obtenemos la posicion del raron
    chX = evt.clientX - ClientRect.left;                //Calculamos la posicion del raton dentro del canvas
    //Esto actuallizara la variable chx, que almacena la posicion del raton
}
         
//Funcion que se ejecuta con el click del raton
function clickRaton(evt){
    //Si nos quedan pelotas que lanzar o si la anterior pelota fue eliminada por el juego y el juego no esta pausado, crearemos una nueva pelota
    if((numPelotas>0 || bolaEliminada == true) && paused == false){
        reactivarSonido(audio5);                          //Ejecutamos el audio correspondiente
        var velocidad;                          //La pelota tendra una velocidad diferente dependiendo de la escena en la que nos encontremos
        var veelocidadVertical;                 //Tenemos qe definir tanto la velocidad total y al menos una de las dos velocidades, o en X o en Y
        switch(escenaActual){                   //Segun la escena asignaremos diferentes velocidades
            case 0:
                velocidad = 10;
                veelocidadVertical = 7;
                break;
            case 1:
                velocidad = 12;
                veelocidadVertical = 8;
            case 2:
                velocidad = 14;
                veelocidadVertical = 9;
            default:
                velocidad = 15;
                veelocidadVertical = 10;

        }
        //Creamos una nueva pelota con estas velocidades y la posicion del centro de  la paleta y la añadimos a la escena
        bola1 = new Pelota(10, velocidad-veelocidadVertical,  -veelocidadVertical, escenas[escenaActual].paleta.posicionX +  escenas[escenaActual].paleta.ancho/2 , escenas[escenaActual].paleta.posicionY - 11  )
        escenas[escenaActual].pelota = bola1;

        //Si la bola no ha sido eliminada por el juego, restamos uno al contador de bolas
        if(!bolaEliminada){
            numPelotas--;
            multiplicador = 1;
        }

        bolaEliminada = false;          //Indicamos que la pelota ya no esta eliminada
    }
}

//Funcion que activa un sonido,y si este ya se esta ejectuando lo reinicia
function reactivarSonido(sonido){
    if (sonido.paused) {
        sonido.play();              //Si el sonido esta pausado, lo iniciamos
    }else{
        sonido.currentTime = 0      //Si el sonido ya esta activado, lo reiniciamos
    }
}