const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const decompress = require("decompress");

var rimraf = require("rimraf");

const app = express();

app.use("/static", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const suffix = uuidv4();
    const fileName = file.fieldname + "-" + suffix + "-" + file.originalname;
    req.uploadedFile = "./uploads/" + fileName;
    cb(null, fileName);
  },
});

const unzip = async (req) => {
  try {
    const file = await decompress(req.uploadedFile, "dist", {
      map: (file) => {
        file.path = `${req.uploadedFile}-${file.path}`;
        return file;
      },
    });
    return file.path;
  } catch (err) {
    return err;
  }
};

const uploadMl = multer({ storage: storage });
app.post("/", uploadMl.single("file"), async (req, res) => {
  const url = await unzip(req);
  res.send(url);
});

app.listen(3002, (err) => {
  if (!err) {
    console.log("app listening on 3002");
  }
});
