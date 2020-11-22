var admin = require("firebase-admin");
var mime = require("mime-types");
const uuidv4 = require("uuid/v4");

var serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lprs-vnos.firebaseio.com"
});

var db = admin.firestore();
var bucketName = "lprs-vnos.appspot.com";
var bucketFolder = "gate-photos/";
var bucketFolderStream = "gate-stream/";
var storage = admin.storage().bucket(bucketName);

const findPlate = async plate => {
  return new Promise(function(resolve, reject) {
    db.collection("plate-licence")
      .where("plate", "==", plate)
      .get()
      .then(data => {
        if (data.empty) {
          console.log("Plate not found.");
          resolve(false);
        } else {
          console.log("Plate founded.");
          resolve(true);
        }
      })
      .catch(err => {
        console.log("Error getting documents", err);
        reject(err);
      });
  });
};

//insert to storage, insert to collection link on image from storage
const insertGateByAction = async (action, plate, fileName, usecase) => {
  const uuid = uuidv4();
  let img_url = '';
  
  if (fileName != "") {
    await storage.upload(fileName, {
      destination: bucketFolder + fileName + uuid,
      uploadType: "media",
      metadata: {
        contentType: mime.lookup(fileName + uuid),
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
      }
    });
    const file = await storage.file(bucketFolder + fileName);
  } else {
    const file = "";
  }

  //pouzivali sme tahanie tokenu z metadat
  //const data = await file.getMetadata()
  //const downloadToekn = data[0].metadata.firebaseStorageDownloadTokens

  if (fileName != "") {
    img_url =
    "https://firebasestorage.googleapis.com/v0/b/" +
    bucketName +
    "o/" +
    bucketFolder.replace("/", "%2F") +
    fileName +
    uuid +
    "?alt=media&token=" +
    uuid; //downloadToekn; pouzivali dme token dotiahnuty z metadat
  }else{
    img_url = null
  }
  console.log("Plate stored URL :" + img_url);

  db.collection("gate-action")
    .doc()
    .set({
      action: action,
      photo: img_url,
      usecase: usecase,
      plate: plate,
      time: new Date(new Date().toUTCString())
    });
};

//insert stream, insert to collection link on image from storage
const insertStreamImage = async fileName => {
  const uuid = uuidv4();

  await storage.upload(fileName, {
    destination: bucketFolderStream + fileName + uuid,
    uploadType: "media",
    metadata: {
      contentType: mime.lookup(fileName + uuid),
      metadata: {
        firebaseStorageDownloadTokens: uuid
      }
    }
  });
  const file = await storage.file(bucketFolderStream + fileName);

  //pouzivali sme tahanie tokenu z metadat
  //const data = await file.getMetadata()
  //const downloadToekn = data[0].metadata.firebaseStorageDownloadTokens

  const img_url =
    "https://firebasestorage.googleapis.com/v0/b/" +
    bucketName +
    "o/" +
    bucketFolderStream.replace("/", "%2F") +
    fileName +
    uuid +
    "?alt=media&token=" +
    uuid; //downloadToekn; pouzivali dme token dotiahnuty z metadat

  console.log("Stream stored URL :" + img_url);

  db.collection("gate-stream")
    .doc()
    .set({
      photo: img_url,
      time: new Date(new Date().toUTCString())
    });
};

const checkGate = async () => {
  return new Promise(function(resolve, reject) {
    db.collection("gate-action", ref => {
      ref.orderBy("time", "desc").limit(1);
      if (ref.action == "OPEN") resolve(true);
      else if (ref.action == "CLOSE") reject(false);
    });
  });
};

module.exports = {
  findPlate,
  insertGateByAction,
  insertStreamImage,
  checkGate
};
