import { Router } from "express";
import * as certificateController from "../controllers/certificate.controller.js";

// Public part
export const publicCertificateRouter = Router();
publicCertificateRouter.post("/download", certificateController.publicCertificateView);
publicCertificateRouter.get("/certificate/:certificate_no/image", certificateController.viewCertificateImage);

// Admin-only part
export const adminCertificateRouter = Router();
adminCertificateRouter.post("/application/complete", certificateController.generateCertificate);
adminCertificateRouter.get("/certificates", certificateController.listAllCertificates);