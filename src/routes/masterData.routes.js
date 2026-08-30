import { Router } from "express";
import { createMasterDataController } from "../controllers/masterData.controller.js";
import { Village } from "../models/village.model.js";
import { PostOfficeMaster } from "../models/postOfficeMaster.model.js";
import { PoliceStation } from "../models/policeStation.model.js";
import { SansadMaster } from "../models/sansadMaster.model.js";
import { MouzaMaster } from "../models/mouzaMaster.model.js";
import { DocumentType } from "../models/documentType.model.js";
import { OldDataType } from "../models/oldDataType.model.js";
import { adminAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(adminAuth);

const registerCrud = (path, Model, label) => {
  const c = createMasterDataController(Model, label);
  router.get(`/${path}`, c.list);
  router.post(`/${path}/add`, c.add);
  router.post(`/${path}/update`, c.update);
  router.delete(`/${path}/delete/:id`, c.remove);
};

registerCrud("village", Village, "Village");
registerCrud("post_office", PostOfficeMaster, "Post Office");
registerCrud("police_station", PoliceStation, "Police Station");
registerCrud("sansad", SansadMaster, "Sansad");
registerCrud("mouza", MouzaMaster, "Mouza");
registerCrud("document_type", DocumentType, "Document Type");
registerCrud("old_data_type", OldDataType, "Old Data Type");

export default router;