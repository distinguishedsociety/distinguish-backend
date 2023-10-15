const { S3, config } = require("aws-sdk");
// import multer from "multer";
const multer = require("multer");
const multerS3 = require("multer-s3");

config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DS,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_DS,
  region: "ap-south-1",
});

const s3 = new S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    // acl: "public-read",
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "The Distinguished Society product image" });
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}.${file.mimetype.split("/")[1]}`);
    },
  }),
});

module.exports = upload;
// export default upload;
