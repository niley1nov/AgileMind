import jwt from "jsonwebtoken";
import config from "../config.js";
import User from "../models/User.js";
import {getProjectId} from "../utilities/commonUtil.js";
import ProjectAssignment from "../models/ProjectAssignment.js";

async function verifyUser(req, res, next) {
	try {
		const authHeader = req.headers["authorization"]; // get the Token from header
		if (!authHeader) return res.sendStatus(401); // if there is no header then send 401 status
		const token = authHeader && authHeader.split(' ')[1];
		jwt.verify(token, config.JWT_SECRET_TOKEN, async function (err, decoded) {
			if (err) {
				return res.status(401).json({
					message: "This session has expired. Please login",
				});
			}
			const { id } = decoded; // get user id from the decoded token
			const userData = await User.findById(id);
			req.user = userData; // put the data object into req.user
			next();
		});
	} catch (err) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: "Internal Server Error",
		});
	}
}

const authorizationMiddleware = function (objectType, allowRoles){
	return async function (req, res, next){
		try{
			let recordId = null;
			if(objectType === 'Story'){
				recordId = req.query.storyId || req.body.storyId;
			}else if(objectType === 'Epic'){
				recordId = req.query.epicId || req.body.epicId;
			}else if(objectType === 'Phase'){
				recordId = req.query.phaseId || req.body.phaseId;
			}else if(objectType === 'Project'){
				recordId = req.query.projectId || req.body.projectId;
			}

			const projectId = await getProjectId(objectType, recordId);
			const userId = req.user._id;
			if(projectId){
				console.log('>>PROJECT ID '+projectId);
				const projectAssignment = await ProjectAssignment.findOne({userId:userId, projectId: projectId});
				if(!projectAssignment || !allowRoles.includes(req.user.role)){
					return res.status(403).json({ message: "Access denied. You are not assigned to this object." });
				}
			}else{
				return res.status(400).json({ message: "Project didn\'t found" });
			}
			next();
		}catch (err) {
		res.status(500).json({
			status: "error",
			code: 500,
			message: "Internal Server Error",
		});
	}
	}
}

export { verifyUser, authorizationMiddleware};
