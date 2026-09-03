import { Router } from "express";
import * as ctrl from "../controllers/applicationAdmin.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/documentUpload.middleware.js";
import { upload as imageUpload } from "../middlewares/imageUpload.middleware.js";

const router = Router();

router.get("/dashboard", ctrl.dashboardStats);

router.get("/applicationnew", ctrl.listApplications);
router.get("/view/:id", ctrl.viewApplication);
router.post("/application/reject", ctrl.rejectApplication);

router.get("/guidelines", ctrl.listGuidelines);
router.post("/guidelines/add", ctrl.addGuideline);
router.post("/guidelines/update", ctrl.updateGuideline);
router.delete("/guidelines/delete/:id", ctrl.deleteGuideline);

router.get("/signatures", ctrl.listSignatures);
router.post("/signatures/update", upload.single("signature"), ctrl.updateSignature);

router.get("/downloads", ctrl.listDownloads);
router.post("/downloads/add", upload.single("file"), ctrl.addDownload);
router.get("/downloads/download/:id", ctrl.downloadFile);
router.delete("/downloads/delete/:id", ctrl.deleteDownload);

router.get("/report/certificate_issued", ctrl.certificateReport);

router.get("/old_data", ctrl.oldDataList);
router.post("/old_data/add", ctrl.addOldData);
router.delete("/old_data/delete/:id", ctrl.deleteOldData);

export default router;