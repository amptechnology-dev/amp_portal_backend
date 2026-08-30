import { Router } from "express";
import { downloadUserFile } from "../controllers/userFileDownload.controller.js";

const router = Router();
router.get("/download_user_file/:id", downloadUserFile);

export default router;