import { Router } from "express";
import * as applicationController from "../controllers/application.controller.js";
import { upload } from "../middlewares/documentUpload.middleware.js";

const router = Router();

// note: req.office already set by your existing office-resolve middleware (jeta public.routes e use hocche)
router.route("/apply/:type").get(applicationController.getApplicationFormData);

router.route("/save_application").post(
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "tax_receipt", maxCount: 1 },
  ]),
  applicationController.storeApplication
);

router.route("/save_heirship").post(
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "tax_receipt", maxCount: 1 },
    { name: "member_authorization", maxCount: 1 },
  ]),
  applicationController.storeHeirship
);

router.route("/check_status").post(applicationController.getApplicationStatus);
router.route("/send-otp").post(applicationController.sendOtp);
router.route("/verify-otp").post(applicationController.verifyOtp);

export default router;