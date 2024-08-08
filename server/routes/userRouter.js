import express from "express";
import { verifyUser } from '../middlewares/verifyUser.js';
import { getUserByEmail, getNavigationInfo } from '../controllers/userController.js';

const router = express.Router();
router.get("/getUserByEmail", verifyUser, getUserByEmail);
router.get("/getNavigationInfo", verifyUser, getNavigationInfo);

export default router;
