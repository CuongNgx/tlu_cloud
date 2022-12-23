const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const decompress = require("decompress");
const fs = require("fs");

const app = express();

app.use("/static", express.static(path.join(__dirname, "dist")));

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
    return file;
  } catch (err) {
    return err;
  }
};

const deleteFile = async (req) => {
  const path = req.uploadedFile;

  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

const uploadMl = multer({ storage: storage });
app.post("/upload", uploadMl.single("file"), async (req, res) => {
  try {
    const url = await unzip(req);
    if (!url) {
      throw new Error("unzip failed");
    }

    res.status(200).send({
      success: true,
      response: {
        message: {
          demo: path.join("https://tlu-cloud-cuongngx.vercel.app/", "static", url[1].path.substring(1)),
          index: path.join("https://tlu-cloud-cuongngx.vercel.app/", "static", url[3].path.substring(1)),
          practice: path.join("https://tlu-cloud-cuongngx.vercel.app/", "static", url[13].path.substring(1)),
          test: path.join("https://tlu-cloud-cuongngx.vercel.app/", "static", url[30].path.substring(1)),
          tutorial: path.join("https://tlu-cloud-cuongngx.vercel.app/", "static", url[31].path.substring(1)),
        },
      },
    });
    await deleteFile(req);
  } catch (err) {
    res.status(500).send({
      success: false,
      response: {
        message: err.message,
      },
    });
  }
});

app.use("/", (req, res, next) => {
	res.json({
		message: "Welcome to TLU_C cloud",
	});
});

app.listen(3002, (err) => {
  if (!err) {
    console.log("app listening on 3002");
  }
});
