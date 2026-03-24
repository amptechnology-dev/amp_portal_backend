import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Multer file filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["jpeg", "jpg", "png"];
  const ext = file.mimetype.split("/")[1].toLowerCase();
  const isAllowedType = allowedTypes.includes(ext);

  if (isAllowedType) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only images with the following extensions are allowed: jpeg, jpg, png"), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
});
