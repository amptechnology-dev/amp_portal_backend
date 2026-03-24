import { ApiError } from "../utils/ApiError.js";
import fs from "fs";

const validator = (schema) => async (req, res, next) => {
  const data = req.body;
  try {
    await schema.validate(data, { abortEarly: false });
    next();
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path); // Delete the file from disk
    }
    // Delete mutli files
    if (req.files) {
      for (const file in req.files) {
        let filePath = req.files[file][0].path;
        console.log(filePath);
        fs.unlinkSync(filePath);
      }
    }
    return res.status(400).json(new ApiError(400, "Form Validation Error", error));
  }
};

export default validator;
