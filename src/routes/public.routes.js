import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";
import { upload as pdfUpload } from "../middlewares/pdfUpload.middleware.js";

const router = Router();
router.route("/ping").get((req, res) => {
  let start = Date.now();
  res.send("Pong " + (Date.now() - start) + "ms");
});
router.route("/officeData").get(publicController.getOfficeDetails);
router.route("/social").get(publicController.getSocials);
router.route("/gallery").get(publicController.getGallery);
router.route("/about").get(publicController.getAbout);
router.route("/service").get(publicController.getService);
router.route("/staff").get(publicController.getStaff);
router.route("/notice").get(publicController.getNotice);
router.route("/faq").get(publicController.getFaq);
router.route("/contact-us").post(publicController.postContactUs);
router.route("/ads").get(publicController.getAds);
router.route("/grievance").post(pdfUpload.single("file"), publicController.postGrievance);
router.route("/activity").get(publicController.getActivity);
router.route("/people").get(publicController.getPeople);
router.route("/video-gallery").get(publicController.getVideos);
router.route("/enquiry").post(publicController.postEnquiry);
router.route("/package").get(publicController.getPackage);
router.route("/bank").get(publicController.getBank);
router.route("/headings").get(publicController.getHeadings);
router.route("/useful_links").get(publicController.getUsefulLinks);
router.route("/counter").get(publicController.getCounter);

export default router;
