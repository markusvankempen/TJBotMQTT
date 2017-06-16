// Run "sudo node led_test.js" from your terminal to test your LED.
// It should set your light to white and turn the LED on.

var ws281x = require('rpi-ws281x-native');
var NUM_LEDS = 1;        // Number of LEDs
ws281x.init(NUM_LEDS);   // initialize LEDs 

// ----  reset LED before exit
process.on('SIGINT', function () {
    ws281x.reset();    
    process.nextTick(function () { process.exit(0); });
});

var color = new Uint32Array(NUM_LEDS); 
ws281x.render(color);

console.log("turning ON the light");
setLED("on"); // setLED sets the light
console.log("Wait 2 sec");

sleep(2000);
console.log("turning OFF the light");
setLED("off"); // setLED sets the light

function sleep(milliseconds) {
                var start = new Date().getTime();
                for (var i = 0; i < 1e7; i++) {
                    if ((new Date().getTime() - start) > milliseconds){
                        break;
                    }
                }
            }

function setLED(value) {
    if (value == "on") {
        color[0] = 0xffff00 ;
    } else {
        color[0] = 0x000000 ;
    }
    ws281x.render(color);
}

