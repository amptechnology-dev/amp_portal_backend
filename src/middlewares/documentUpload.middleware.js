import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only PDF and Image files (jpg, jpeg, png) are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 300 * 1024 },
});