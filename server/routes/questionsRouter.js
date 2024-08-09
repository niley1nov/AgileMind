import express from "express";
import { verifyUser, authorizationMiddleware } from "../middlewares/verifyUser.js";
import {
	getProjectLevelQuestions,
	getPhaseLevelQuestions,
	updateAnswers,
	submitQuestions
} from "../controllers/questionsController.js";
import { validateUpdateAnswersDetails, validateSubmitQuestionsDetails } from "../middlewares/validate.js";
import {ALL_ROLE} from '../utilities/constant.js';


const router = express.Router();

router.get("/getProjectLevelQuestions", authorizationMiddleware('Project',ALL_ROLE),  verifyUser, getProjectLevelQuestions);
router.get("/getPhaseLevelQuestions", authorizationMiddleware('Phase',ALL_ROLE), verifyUser, getPhaseLevelQuestions);

router.post(
	"/updateQuestionAnswers",
	verifyUser,
	validateUpdateAnswersDetails,
	updateAnswers
);

router.post(
	"/submitQuestions",
	verifyUser,
	validateSubmitQuestionsDetails,
	submitQuestions
);

export default router;
