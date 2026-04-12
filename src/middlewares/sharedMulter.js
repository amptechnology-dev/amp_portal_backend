import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

  const allowedImages = ["image/jpeg", "image/jpg", "image/png"];
  const isPdf = file.mimetype === "application/pdf";

  if (allowedImages.includes(file.mimetype) || isPdf) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only PDF and Image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter
});