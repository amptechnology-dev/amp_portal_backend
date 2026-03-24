import { Router } from "express";
const router = Router();
import {
  Offices,
  officeInfo,
  addOffice,
  editOffice,
  updateOffice,
  deleteOffice,
  users,
  addUser,
  editUser,
  resetPassword,
  deleteUser,
  Login,
  Logout,
  editSectionHeaders,
  updateSectionHeaders,
  editBackgrounds,
  updateBackgrounds,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/imageUpload.middleware.js";

router.get("/", (req, res) => {
  res.redirect("/admin/offices");
});
router.get("/login", (req, res) => {
  res.render("pages/login", { error: null });
});
router.post("/login", Login);
router.get("/logout", Logout);

//offices routes
router.get("/offices", adminAuth, Offices);
router.get("/office/add", adminAuth, addOffice);
router.post("/office/add", adminAuth, addOffice);
router.get("/office/info/:id", adminAuth, officeInfo);
router.get("/office/edit/:id", adminAuth, editOffice);
router.post("/office/update/:id", adminAuth, updateOffice);
router.post("/office/delete/:id", adminAuth, deleteOffice);
router.get("/office/edit/headings/:id", adminAuth, editSectionHeaders);
router.post("/office/edit/headings/:id", adminAuth, updateSectionHeaders);
router.get("/office/edit/backgrounds/:id", adminAuth, editBackgrounds);
router.post(
  "/office/edit/backgrounds/:id",
  adminAuth,
  upload.fields([
    { name: "headerImage", maxCount: 1 },
    { name: "footerImage", maxCount: 1 },
  ]),
  updateBackgrounds
);

//Admin routes
router.get("/users", adminAuth, users);
router.get("/user/add", adminAuth, addUser);
router.post("/user/add", adminAuth, addUser);
router.get("/user/edit/:id", adminAuth, editUser);
router.post("/user/edit/:id", adminAuth, editUser);
router.post("/user/reset_password/:id", adminAuth, resetPassword);
router.post("/user/delete/:id", adminAuth, deleteUser);

export default router;
