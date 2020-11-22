var request = require("request");
var fs = require("fs");
let db = require("./databaseActions");

function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}

const recognizeAPI = async (photoPath, servo) => {
  var img_base64F = base64_encode(photoPath);
  servo = servo
  await request.post(
    {
      url:
        "https://api.openalpr.com/v2/recognize_bytes?recognize_vehicle=1&country=eu&secret_key=sk_fb9d0d046830860cfd1ac86e",
      headers: { "content-type": "text/plain;charset=UTF-8" },
      body: img_base64F
    },
    async (err, httpResponse, body, gpio) => {
      if (err) {
        console.error("upload failed:", err);
      }
      result = JSON.parse(body);
      let open = await db.findPlate(result.results[0].plate).catch(err => {});
      if (open) {
        db.insertGateByAction(
          "OPEN",
          result.results[0].plate,
          photoPath,
          "AUTOMATIC"
        ).catch(err => {});
        servo.max();
        setTimeout(() => {
          servo.min();
          db.insertGateByAction(
            "CLOSE",
            result.results[0].plate,
            photoPath,
            "AUTOMATIC"
          ).catch(err => {});
        }, 10000);
      } else {
        db.insertGateByAction(
          "DENIED",
          result.results[0].plate,
          photoPath,
          "AUTOMATIC"
        ).catch(err => {});
      }
    }
  );
};

module.exports = { recognizeAPI };
