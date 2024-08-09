import express from "express";
import { verifyUser, authorizationMiddleware } from '../middlewares/verifyUser.js';
import { validateUpdateStoryDetails, validateStoryRefectorReqDetails } from '../middlewares/validate.js';
import { getStoryDetails, updateStoryDetails, requestForStoryRefectoring } from '../controllers/storyController.js';
import {ALL_ROLE} from '../utilities/constant.js';

const router = express.Router();
router.get("/getStoryDetails", verifyUser, authorizationMiddleware('Story',ALL_ROLE), getStoryDetails);
router.post("/updateStoryDetails", verifyUser, authorizationMiddleware('Story',ALL_ROLE), validateUpdateStoryDetails, updateStoryDetails);
router.post("/requestForStoryRefectoring", verifyUser, authorizationMiddleware('Story',ALL_ROLE), validateStoryRefectorReqDetails, requestForStoryRefectoring);

export default router;
