let camera = require("./cameraActions");
let db = require("./databaseActions");

let pir = {};
let servo = {};
let buttonOpen = {};
let buttonClose = {};
let isPaused = false;

function init(pirIndex, servoIndex, buttonON, buttonOFF) {
  pir = pirIndex;
  servo = servoIndex;
  buttonOpen = buttonON;
  buttonClose = buttonOFF;

  pir.on("motionstart", function() {
    isPaused = true;
    camera.takePhoto(servo);
    console.log("motionstart");
  });
  pir.on("motionend", function() {
    isPaused = false;
    
    console.log("motionend");
  });
  buttonOpen.on("down", function() {
    db.insertGateByAction("OPEN", "Manualne", "", "MANUAL").catch(err =>
      console.error(err)
    );
    openGate();
    console.log("otvara sa");
  });
  buttonClose.on("down", function() {
    db.insertGateByAction("CLOSE", "Manualne", "", "MANUAL").catch(err =>
      console.error(err)
    );
    closeGate();
    console.log("zatvara sa");
  });

  setServoInit();
  setInterval(() => {
    if (!isPaused) {
      camera.streamVideo();
    }
  }, 8000);
}

function openGate() {
  servo.max();
}
function closeGate() {
  servo.min();
}
function setServoInit() {
  let status = db.checkGate();
  if (!!status) {
    openGate();
  } else closeGate();
}

module.exports = { init, openGate, closeGate };
