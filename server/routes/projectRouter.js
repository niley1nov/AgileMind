import express from "express";
import {verifyUser} from '../middlewares/verifyUser.js';
import {validateProjectDetails} from "../middlewares/validate.js";
import {createProject,getAssignedProjectList} from "../controllers/projectController.js";


const router = express.Router();

router.post("/createProject",verifyUser, validateProjectDetails, createProject);
router.get("/getAssignedProjects",verifyUser, getAssignedProjectList);


export default router;