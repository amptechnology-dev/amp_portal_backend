import { Router } from "express";
import { upload } from "../middlewares/imageUpload.middleware.js";
import { upload as pdfUpload } from "../middlewares/pdfUpload.middleware.js";
import { upload as videoUpload } from "../middlewares/videoUpload.middleware.js";

import {
  index,
  listOffices,
  updateOffice,
  listAbouts,
  updateAbout,
  deleteAbout,
  addBanner,
  addVideoBanner,
  listSocials,
  addSocial,
  listServices,
  addService,
  updateService,
  deleteService,
  listCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  listStaffs,
  addStaff,
  updateStaff,
  deleteStaff,
  listGallery,
  addGallery,
  updateGallery,
  deleteGallery,
  listNotice,
  addNotice,
  updateNotice,
  deleteNotice,
  addFaq,
  listFaq,
  updateFaq,
  deleteFaq,
  listContactUs,
  updateContactUs,
  deleteContactUs,
  listAds,
  addAds,
  deleteAds,
  deleteBanner,
  listGrievances,
  upadateGrievance,
  deleteGrievance,
  listActivity,
  addActivity,
  editActivity,
  deleteActivity,
  listPeoples,
  addPeople,
  editPeople,
  deletePeople,
  listVideos,
  addVideo,
  deleteVideo,
  listPackages,
  addPackage,
  editPackage,
  deletePackage,
  listBanks,
  addBank,
  editBank,
  deleteBank,
  listEnquiries,
  updateEnquiry,
  deleteEnquiry,
  listUseFulLinks,
  createUsefulLinks,
  updateUsefulLinks,
  deleteUsefulLinks,
  listCounter,
  createCounter,
  updateCounter,
  deleteCounter,
  addJob,
  jobList,
  singleJob,
  updateJob,
  deleteJob,
  getAllApplications,
  changeApplicationStatus,
  deleteApplication,
} from "../controllers/dashboard.controller.js";
import validate from "../middlewares/validator.middleware.js";
import { officeSchemaValidation } from "../validations/officeValidation.js";
import {
  aboutSchema,
  serviceSchema,
  staffSchema,
  gallerySchema,
  noticeSchema,
  faqSchema,
  adsSchema,
  socialSchema,
  activitySchema,
  packageSchema,
} from "../validations/dashboardValidations.js";

const router = Router();
// Protected Routes
router.route("/auth").get((req, res) => {
  res.send("Authenticated");
});
router.route("/").get(index);

// Office Routes
router.route("/office/list").get(listOffices);
// router.route("/office/insert").post(validate(officeSchemaValidation), addOffice);
router.route("/office/update").put(
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "logo_alt", maxCount: 1 },
    { name: "notification_bg_iamge", maxCount: 1 },
    { name: "activity_bg_iamge", maxCount: 1 },
  ]),
  validate(officeSchemaValidation),
  updateOffice
);
// router.route("/office/delete/:id").delete(deleteOffice);

// About Us Routes
router.route("/about_us/list").get(listAbouts);
// router.route("/about_us/insert").post(upload.single("image"), validate(aboutSchema), addAbout);
router.route("/about_us/update").put(upload.single("image"), validate(aboutSchema), updateAbout);
router.route("/about_us/delete/:id").delete(deleteAbout);

//Banner Routes
router.route("/banner/insert").post(upload.single("banner"), addBanner);
router.route("/banner/delete/:index").delete(deleteBanner);

//Video Banner Routes
router.route("/banner/video/insert").post(videoUpload.single("video"), addVideoBanner);

// Social Links Routes
router.route("/social/list").get(listSocials);
router.route("/social/insert").post(validate(socialSchema), addSocial);

//Service Routes
router.route("/services/list").get(listServices);
router.route("/services/insert").post(validate(serviceSchema), addService);
router.route("/services/update/:id").put(validate(serviceSchema), updateService);
router.route("/services/delete/:id").delete(deleteService);

// Staff Category Routes
router.route("/category/list").get(listCategory);
router.route("/category/insert").post(addCategory);
router.route("/category/update/:id").put(updateCategory);
router.route("/category/delete/:id").delete(deleteCategory);

// Staff Routes
router.route("/staffs/list").get(listStaffs);
router.route("/staffs/insert").post(upload.single("avatar"), validate(staffSchema), addStaff);
router.route("/staffs/update/:id").put(upload.single("avatar"), validate(staffSchema), updateStaff);
router.route("/staffs/delete/:id").delete(deleteStaff);

// Gallery Routes
router.route("/gallery/list").get(listGallery);
router.route("/gallery/insert").post(upload.single("galleryImage"), validate(gallerySchema), addGallery);
router.route("/gallery/update/:id").put(upload.single("galleryImage"), validate(gallerySchema), updateGallery);
router.route("/gallery/delete/:id").delete(deleteGallery);

// Notice Routes
router.route("/notice/list").get(listNotice);
router.route("/notice/insert").post(pdfUpload.single("link"), validate(noticeSchema), addNotice);
router.route("/notice/update/:id").put(pdfUpload.single("link"), validate(noticeSchema), updateNotice);
router.route("/notice/delete/:id").delete(deleteNotice);

// Faq Routes
router.route("/faq/list").get(listFaq);
router.route("/faq/insert").post(validate(faqSchema), addFaq);
router.route("/faq/update/:id").put(validate(faqSchema), updateFaq);
router.route("/faq/delete/:id").delete(deleteFaq);

// ContactUs Routes
router.route("/contact_us/list").get(listContactUs);
router.route("/contact_us/update/:id").put(updateContactUs);
router.route("/contact_us/delete/:id").delete(deleteContactUs);

// Ads Routes
router.route("/ads/list").get(listAds);
router.route("/ads/insert").post(upload.single("image"), validate(adsSchema), addAds);
router.route("/ads/delete/:id").delete(deleteAds);

//grievance Routes
router.route("/grievance/list").get(listGrievances);
router.route("/grievance/update/:id").put(upadateGrievance);
router.route("/grievance/delete/:id").delete(deleteGrievance);

// Activity Routes
router.route("/activity/list").get(listActivity);
router.route("/activity/insert").post(upload.single("image"), validate(activitySchema), addActivity);
router.route("/activity/update/:id").put(upload.single("image"), validate(activitySchema), editActivity);
router.route("/activity/delete/:id").delete(deleteActivity);

// People Routes
router.route("/people/list").get(listPeoples);
router.route("/people/insert").post(upload.single("image"), addPeople);
router.route("/people/update/:id").put(upload.single("image"), editPeople);
router.route("/people/delete/:id").delete(deletePeople);

// Video Gallery Routes
router.route("/video_gallery/list").get(listVideos);
router.route("/video_gallery/insert").post(upload.single("video"), addVideo);
router.route("/video_gallery/delete/:id").delete(deleteVideo);

// Package Routes
router.route("/package/list").get(listPackages);
router.route("/package/insert").post(upload.single("image"), validate(packageSchema), addPackage);
router.route("/package/update/:id").put(upload.single("image"), validate(packageSchema), editPackage);
router.route("/package/delete/:id").delete(deletePackage);

// Bank Routes
router.route("/bank/list").get(listBanks);
router.route("/bank/insert").post(upload.single("qr"), addBank);
router.route("/bank/update/:id").put(upload.single("qr"), editBank);
router.route("/bank/delete/:id").delete(deleteBank);

// Enquery Routes
router.route("/enquiry/list").get(listEnquiries);
router.route("/enquiry/update/:id").put(updateEnquiry);
router.route("/enquiry/delete/:id").delete(deleteEnquiry);

// Useful Links Routes
router.route("/useful_links/list").get(listUseFulLinks);
router.route("/useful_links/insert").post(createUsefulLinks);
router.route("/useful_links/update/:id").put(updateUsefulLinks);
router.route("/useful_links/delete/:id").delete(deleteUsefulLinks);

// Counter Routes
router.route("/counter/list").get(listCounter);
router.route("/counter/insert").post(createCounter);
router.route("/counter/update/:counterItemId").put(updateCounter);
router.route("/counter/delete/:counterItemId").delete(deleteCounter);

// Job Routes
router.route("/job/list").get(jobList);
router.route("/job/insert").post(addJob);
router.route("/job/:jobId").get(singleJob);
router.route("/job/update/:jobId").put(updateJob);
router.route("/job/delete/:jobId").delete(deleteJob);

// Applications Routes
router.route("/applications/list").get(getAllApplications);
router.route("/applications/status/update/:id").put(changeApplicationStatus);
router.route("/applications/delete/:id").delete(deleteApplication);

export default router;
