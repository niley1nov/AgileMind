import express from "express";
import { verifyUser,authorizationMiddleware } from '../middlewares/verifyUser.js';
import { getStoryList, getStoryDependencyData } from '../controllers/epicController.js';
import {ALL_ROLE} from '../utilities/constant.js';

const router = express.Router();
router.get("/getStoryList", verifyUser, authorizationMiddleware('Epic',ALL_ROLE), getStoryList);
router.get("/getStoryDependencyData", verifyUser, authorizationMiddleware('Epic',ALL_ROLE), getStoryDependencyData);

export default router;
