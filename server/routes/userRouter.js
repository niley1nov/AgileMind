import express from "express";
import { verifyUser } from '../middlewares/verifyUser.js';
import { getUserByEmail, getNavigationInfo, getUserInfo} from '../controllers/userController.js';

const router = express.Router();
router.get("/getUserByEmail", verifyUser, getUserByEmail);
router.get("/getNavigationInfo", verifyUser, getNavigationInfo);
router.get("/getUserInfo", verifyUser, getUserInfo);

export default router;
