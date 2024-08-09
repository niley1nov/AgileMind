import express from "express";
import { verifyUser } from '../middlewares/verifyUser.js';
import { validateProjectDetails, validateProjectAssignmentDetails } from "../middlewares/validate.js";
import { createProject, getAssignedProjectList, createProjectAssignment, getProjectAssignments } from "../controllers/projectController.js";


const router = express.Router();

router.post("/createProject", verifyUser, validateProjectDetails, createProject);
router.get("/getAssignedProjects", verifyUser, getAssignedProjectList);
router.post("/createProjectAssignment", verifyUser, validateProjectAssignmentDetails, createProjectAssignment);
router.get("/getProjectAssignments", verifyUser, getProjectAssignments);




export default router;