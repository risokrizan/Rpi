let PiCamera = require("pi-camera");
let api = require("./apiActions");
let db = require("./databaseActions");

const photo = new PiCamera({
  mode: "photo",
  //output: filePath,
  width: 1920,
  height: 1080,
  nopreview: true
});

async function takePhoto(servo) {
  const filePath = `${__dirname}/data/${Date.now()}.jpg`;
  photo.config.output = filePath;
  photo
    .snap()
    .then(async () => {
      await api.recognizeAPI(filePath, servo);
    })
    .catch(err => console.error(err));
}

async function streamVideo() {
  const filePath = `${__dirname}/stream/${Date.now()}.jpg`;
  photo.config.output = filePath;
  photo
    .snap()
    .then(async () => {
      await db.insertStreamImage(filePath);
    })
    .catch(err => console.error(err));
}

module.exports = { takePhoto, streamVideo };
