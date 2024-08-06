import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {getStoryDetails} from '../controllers/storyController.js';

const router = express.Router();
router.get("/getStoryDetails",verifyUser,getStoryDetails);

export default router;
