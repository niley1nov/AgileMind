import express from "express";
import {
  validateRegistrationDetails,
  validateLoginDetails,
} from "../middlewares/validate.js";
import { RegisterUser, loginUser } from "../controllers/auth.js";
const router = express.Router();

router.post("/register", validateRegistrationDetails, RegisterUser);

router.post("/login", validateLoginDetails, loginUser);

export default router;
