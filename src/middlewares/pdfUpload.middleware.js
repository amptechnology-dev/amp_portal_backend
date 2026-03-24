import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/pdf");
  },
  filename: function (req, file, cb) {
    const ext = path?.extname(file.originalname);
    cb(null, file?.fieldname + "-" + Date.now() + Math.round(Math.random() * 1e9) + ext);
  },
});

// Multer file filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["pdf"];
  const ext = file.mimetype.split("/")[1].toLowerCase();
  const isAllowedType = allowedTypes.includes(ext);
  const isValidFile = isAllowedType && allowedTypes.includes(ext);

  isValidFile ? cb(null, true) : cb(new ApiError(400, "Only file with pdf extensions are allowed."), false);
};

export const upload = multer({
  storage,
  fileFilter,
});
