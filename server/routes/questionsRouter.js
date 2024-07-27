import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import {
  getProjectLevelQuestions,
  updateAnswers,
  submitQuestions
} from "../controllers/questionsController.js";
import { validateUpdateAnswersDetails,validateSubmitQuestionsDetails } from "../middlewares/validate.js";

const router = express.Router();

router.get("/getProjectLevelQuestions", verifyUser, getProjectLevelQuestions);
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
