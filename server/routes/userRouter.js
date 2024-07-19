import express from "express";
import {validateSearchUserPayload} from '../middlewares/validate.js'
import {verifyUser} from '../middlewares/verifyUser.js';
import {getUserByEmail} from '../controllers/userController.js';

const router = express.Router();
router.get("/getUserByEmail",verifyUser,validateSearchUserPayload,getUserByEmail);

export default router;
