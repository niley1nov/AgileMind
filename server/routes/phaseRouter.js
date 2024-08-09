import express from "express";
import { verifyUser,authorizationMiddleware } from '../middlewares/verifyUser.js';
import { getPhaseList, getEpicList } from "../controllers/phaseController.js";
import {ALL_ROLE} from '../utilities/constant.js';

const router = express.Router();
router.get("/getPhaseList", verifyUser, authorizationMiddleware('Project',ALL_ROLE), getPhaseList);
router.get("/getEpicList", verifyUser, authorizationMiddleware('Phase',ALL_ROLE), getEpicList);

export default router;
