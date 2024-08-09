import express from "express";
import {
	verifyUser,
	authorizationMiddleware,
} from "../middlewares/verifyUser.js";
import {
	validateProjectDetails,
	validateProjectAssignmentDetails,
} from "../middlewares/validate.js";
import {
	createProject,
	getAssignedProjectList,
	createProjectAssignment,
	getProjectAssignments,
} from "../controllers/projectController.js";
import { ALL_ROLE, USER_ROLE } from "../utilities/constant.js";

const router = express.Router();

router.post(
	"/createProject",
	verifyUser,
	validateProjectDetails,
	createProject
);
router.get("/getAssignedProjects", verifyUser, getAssignedProjectList);
router.post(
	"/createProjectAssignment",
	verifyUser,
	authorizationMiddleware("Project", [USER_ROLE.MANAGER]),
	validateProjectAssignmentDetails,
	createProjectAssignment
);
router.get(
	"/getProjectAssignments",
	verifyUser,
	authorizationMiddleware("Project", ALL_ROLE),
	getProjectAssignments
);

export default router;
