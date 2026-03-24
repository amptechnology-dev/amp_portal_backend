import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Multer file filter for video validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["mp4"];
  const ext = file.mimetype.split("/")[1].toLowerCase();
  const isAllowedType = allowedTypes.includes(ext);

  if (isAllowedType) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only videos with the following extensions are allowed: mp4"), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});
