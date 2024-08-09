import express from "express";
import { verifyUser } from '../middlewares/verifyUser.js';
import { getPhaseList, getEpicList } from "../controllers/phaseController.js";

const router = express.Router();
router.get("/getPhaseList", verifyUser, getPhaseList);
router.get("/getEpicList", verifyUser, getEpicList);

export default router;
