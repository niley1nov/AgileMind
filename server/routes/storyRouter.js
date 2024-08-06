import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {validateUpdateStoryDetails} from '../middlewares/validate.js';
import {getStoryDetails,updateStoryDetails} from '../controllers/storyController.js';

const router = express.Router();
router.get("/getStoryDetails",verifyUser,getStoryDetails);
router.post("/updateStoryDetails",verifyUser,validateUpdateStoryDetails,updateStoryDetails);


export default router;
