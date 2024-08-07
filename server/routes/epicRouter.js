import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {getStoryList,getStoryDependencyData} from '../controllers/epicController.js';

const router = express.Router();
router.get("/getStoryList",verifyUser,getStoryList);
router.get("/getStoryDependencyData",verifyUser,getStoryDependencyData);

export default router;
