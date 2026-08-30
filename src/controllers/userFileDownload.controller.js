import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Download } from "../models/download.model.js";
import path from "path";

export const downloadUserFile = asyncHandler(async (req, res) => {
  const file = await Download.findOne({ office: req.office._id, _id: req.params.id });
  if (!file) return res.status(404).json(new ApiError(404, "File not found."));
  return res.download(file.file, `${file.title}${path.extname(file.file)}`);
});