import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.send("Nothing Found!");
});

export default router;
