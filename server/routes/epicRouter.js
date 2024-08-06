import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {getStoryList} from '../controllers/epicController.js';

const router = express.Router();
router.get("/getStoryList",verifyUser,getStoryList);

export default router;
