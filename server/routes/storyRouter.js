import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {validateUpdateStoryDetails,validateStoryRefectorReqDetails} from '../middlewares/validate.js';
import {getStoryDetails,updateStoryDetails,requestForStoryRefectoring} from '../controllers/storyController.js';

const router = express.Router();
router.get("/getStoryDetails",verifyUser,getStoryDetails);
router.post("/updateStoryDetails",verifyUser,validateUpdateStoryDetails,updateStoryDetails);
router.post("/requestForStoryRefectoring",verifyUser,validateStoryRefectorReqDetails,requestForStoryRefectoring);


export default router;
