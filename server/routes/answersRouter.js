import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import {
	getProjectLevelAnswers,
	getPhaseLevelAnswers,
} from "../controllers/answersController.js";

const router = express.Router();

router.get("/getProjectLevelAnswers", verifyUser, getProjectLevelAnswers);
router.get("/getPhaseLevelAnswers", verifyUser, getPhaseLevelAnswers);

export default router;