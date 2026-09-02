import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";
import { upload as pdfUpload } from "../middlewares/pdfUpload.middleware.js";
import { upload as shareupload } from "../middlewares/sharedMulter.js";
import { createPublicMasterDataController } from "../controllers/publicMasterData.controller.js";
import { Village } from "../models/village.model.js";
import { PostOfficeMaster } from "../models/postOfficeMaster.model.js";
import { PoliceStation } from "../models/policeStation.model.js";
import { SansadMaster } from "../models/sansadMaster.model.js";
import { DocumentType } from "../models/documentType.model.js";

const router = Router();
router.route("/ping").get((req, res) => {
  let start = Date.now();
  res.send("Pong " + (Date.now() - start) + "ms");
});
const registerPublicMaster = (path, Model, label) => {
  const c = createPublicMasterDataController(Model, label);
  router.route(`/${path}`).get(c.list);
};
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
router.route("/jobs").get(publicController.jobList);
router.route("/recruitment").post(shareupload.fields([
    { name: "cv", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  publicController.postRecruitment
);
registerPublicMaster("village", Village, "Village");
registerPublicMaster("post_office", PostOfficeMaster, "Post Office");
registerPublicMaster("police_station", PoliceStation, "Police Station");
registerPublicMaster("sansad", SansadMaster, "Sansad");
registerPublicMaster("id_type", DocumentType, "Document Type");

export default router;
