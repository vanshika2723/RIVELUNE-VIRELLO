
const fs = require("fs");
const FileType = require("file-type");

const allowedTypes = ["jpg", "png", "webp"];

const validatePaymentImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const buffer = await fs.promises.readFile(req.file.path);
    const detectedType = await FileType.fromBuffer(buffer);

    if (!detectedType || !allowedTypes.includes(detectedType.ext)) {
      await fs.promises.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: "Invalid image file. Upload a genuine JPG, PNG or WebP image.",
      });
    }

    if (detectedType.mime !== req.file.mimetype) {
      await fs.promises.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: "Image file type does not match its content.",
      });
    }

    next();
  } catch (error) {
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }

    return res.status(400).json({
      success: false,
      message: "Unable to validate uploaded image.",
    });
  }
};

module.exports = validatePaymentImage;
