import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {getUserByEmail} from '../controllers/userController.js';

const router = express.Router();
router.get("/getUserByEmail",verifyUser,getUserByEmail);

export default router;
