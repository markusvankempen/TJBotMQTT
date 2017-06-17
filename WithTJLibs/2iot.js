/*********************************************************************

markus van Kempen - mvk@ca.ibm.com

Sends mqtt message to IoT and Waits for commands to controls the 
TJ servo motor and led 

version 20170613 
Note: needs TJBot Lib
**********************************************************************/
var iotf = require("../iot-nodejs/.");
var config = require("./device.json");
//var ws281x = require('rpi-ws281x-native');
var rpiDhtSensor = require('rpi-dht-sensor');
var exec = require('child_process').exec;
const TJBot = require('tjbot');

/***********************************************************************
* Setup
***********************************************************************/

//var dht = new rpiDhtSensor.DHT11(4);
var dht = new rpiDhtSensor.DHT22(4);
var readout = dht.read();
var NUM_LEDS = 1;        // Number of LEDs
//ws281x.init(NUM_LEDS);   // initialize LEDs 
//var color = new Uint32Array(NUM_LEDS); 
//ws281x.render(color);
var tjled   = new TJBot(['led'], {log: {level: 'debug'}}, {});
var tjservo = new TJBot(['servo'], {log: {level: 'debug'}}, {});


var mincycle = 500; var maxcycle = 2300 ;
var dutycycle = mincycle;

// Init board, setup software PWM on pin 26.
//var Gpio = require('pigpio').Gpio;
//var motor = new Gpio(7, {mode: Gpio.OUTPUT});

var deviceClient = new iotf.IotfDevice(config);

// none fancy sleep function
function sleep( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

//setting the log level to trace. By default its 'warn'
deviceClient.log.setLevel('debug');

console.log("TJBot WIOT controler program");

console.log('Wave check and Led on');
setLED("on");
readout = dht.read();
console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
        'humidity: ' + readout.humidity.toFixed(2) + '%');

deviceClient.connect();

deviceClient.on('connect', function(){ 
    var i=0;

    console.log("connected");
    setInterval(function function_name () {
	readout = dht.read();
	mystr = ',"Temperature":' +readout.temperature.toFixed(2)+', "humidity": ' + readout.humidity.toFixed(2);
    	i++;
    	deviceClient.publish('myevt', 'json', '{"value":'+i+mystr+'}', 2);
    },5000);
});

deviceClient.on('reconnect', function(){ 
	console.log("Reconnected!!!");
});

deviceClient.on('disconnect', function(){
  console.log('Disconnected from IoTF');
});

deviceClient.on('error', function (argument) {
	console.log(argument);
});



deviceClient.on("command", function (commandName,format,payload,topic) {
   
console.log("Command:", commandName);
console.log("payload = "+JSON.parse(payload));
myjson = JSON.parse(payload);
//console.log("payload = "+JSON.stringify(payload));

   if(commandName === "armFORWARD") {
      console.log("armForward = 2000");    
 //     motor.servoWrite(2000); //open
 
tjservo.lowerArm();
    } else if(commandName === "armUP") {
      console.log("armUP = 1000 ");
//      motor.servoWrite(1000); //open
	tjservo.raiseArm();


    } else if(commandName === "armBACK") {
   console.log("armBACK = 500") ;  
   // motor.servoWrite(500); //open
	 tjservo.armBack();
    } else if(commandName === "armMOVE") {
        console.log("armMove");
        console.log("armMove value = "+myjson.d.motorSpin);
        //motor.servoWrite(myjson.d.motorSpin); //open

    } else if(commandName === "armWAVE") {
     console.log("armWave");
tjservo.lWave();
/*
     motor.servoWrite(1200);
     sleep(300)
     motor.servoWrite(2000);
     sleep(400);
     motor.servoWrite(1200);
     sleep(300)
     motor.servoWrite(2000);
     sleep(400);
     motor.servoWrite(1200);
*/

}else if( commandName === "ledON") {
          setLED("on");
}else if( commandName === "ledOFF") {
          setLED("off");
}else if( commandName === "ledRED") {
          setLED("red");
}else if( commandName === "ledGREEN") {
          setLED("green");
}else if( commandName === "ledBLUE") {
          setLED("blue");
}else if( commandName === "ledSET") {
  console.log("Set LED to  (GGRRBB) = "+myjson.d.color +" value = "+myjson.d.value);
          setLED("led",myjson.d.color,myjson.d.value);
}else {
          console.log("Command not supported.. " + commandName);
    }
});


function setLED(value,mycolor,myvalue) {
    if (value == "on") {
	tjled.shine('white');
    //    color[0] = 0xffffff ;
    } else if (value == "blue"){
	tjled.shine('blue');
       // color[0] = 0x0000ff ;
    } else if (value == "red"){
	tjled.shine('red');
        //color[0] = 0x00ff00 ;
    } else if (value == "green"){
	tjled.shine('green');
       // color[0] = 0xff0000 ;
    } else if (value == "led"){
	tjled.shine(myvalue);      
 // color[0] = mycolor ;
    }else {
tjled.shine('off');
        //color[0] = 0x000000 ;
    }
   // ws281x.render(color);
}


