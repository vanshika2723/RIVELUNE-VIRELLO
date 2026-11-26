
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "..", "uploads", "payment-proofs");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = allowedMimeTypes[file.mimetype];

    if (!extension) {
      return cb(new Error("Unsupported image type."));
    }

    const randomName = crypto.randomBytes(24).toString("hex");

    cb(null, `${randomName}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return cb(new Error("Only JPG, PNG and WebP images are allowed."));
  }

  cb(null, true);
};

const paymentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 3,
  },
});

module.exports = paymentUpload;
