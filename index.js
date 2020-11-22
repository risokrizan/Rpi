let gpio = require("./gpioActions");
let five = require("johnny-five");
let raspi = require("raspi-io").RaspiIO;
// Make a new `Board()` instance and use raspi-io
let board = new five.Board({
  io: new raspi()
});

board.on("ready", function() {
  let pir = new five.Motion("P1-18");
  let servo = new five.Servo("P1-32");
  let buttonON = new five.Button("P1-16");
  let buttonOFF = new five.Button("P1-12");
  gpio.init(pir, servo, buttonON, buttonOFF);
});

// const Func = async rampa => {
//   const isCarAuthorized = await db.findPlate("NR550JV");
//   await camera.capturePhoto();
//   console.log(isCarAuthorized);
//   console.log("END");
// };

// const a = Func();
