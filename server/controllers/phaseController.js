import Project from "../models/Project.js";
import Phase from "../models/Phase.js";
import Epic from "../models/Epic.js";
import mongoose from "mongoose";
import { USER_ROLE } from "../utilities/constant.js";


/**
 * The function `getPhaseList` retrieves a list of phases for a project along with related epics and
 * project details, handling errors if any.
 * @param req - The `req` parameter in the `getPhaseList` function stands for the request object, which
 * contains information about the HTTP request made to the server. It includes details such as the
 * request method, request URL, request headers, request body, query parameters, and more.
 * @param res - The `res` parameter in the `getPhaseList` function is the response object that will be
 * used to send a response back to the client making the request. In this function, the response will
 * be in JSON format and will include information about the project, its phases, and some additional
 * details.
 */
async function getPhaseList(req, res) {
	try {
		const projectId = req.query.projectId;
		const project = await Project.findOne({ _id: projectId });
		const phaseList = await Phase.aggregate(
			[
				{
					$match: {
						projectId: new mongoose.Types.ObjectId(projectId),
					}
				},
				{
					$sort: { seqNumber: 1 },
				},
				{
					$lookup: {
						from: 'epics',
						localField: '_id',
						foreignField: 'phaseId',
						as: 'epics'
					}
				},
				{
					$project: {
						_id: 1,
						phaseName: 1,
						status: 1,
						totalEpics: { $size: '$epics' }
					}
				}
			]
		);
		let wrapper = {};
		wrapper.projectName = project.projectName;
		wrapper.projectStatus = project.status;
		wrapper.phaseList = phaseList;
		wrapper.isProjectManager = (req.user.role == USER_ROLE.MANAGER);
		res.json(wrapper);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}


/**
 * The function `getEpicList` retrieves a list of epics associated with a specific phase, including
 * their details and related stories, and returns them in a JSON response along with the phase's name
 * and status.
 * @param req - The `req` parameter in the `getEpicList` function stands for the request object, which
 * contains information about the HTTP request that triggered the function. This object typically
 * includes details such as request headers, query parameters, request body, and more.
 * @param res - The `res` parameter in the `getEpicList` function is the response object that will be
 * used to send the response back to the client making the request. In this case, it is used to send a
 * JSON response containing the epic list along with some additional information like the phase name
 * and
 */
async function getEpicList(req, res) {
	try {
		const phaseId = req.query.phaseId;
		const phase = await Phase.findOne({ _id: phaseId });
		const epicList = await Epic.aggregate(
			[
				{
					$match: {
						phaseId: new mongoose.Types.ObjectId(phaseId),
					}
				},
				{
					$sort: { seqNumber: 1 },
				},
				{
					$lookup: {
						from: 'stories',
						localField: '_id',
						foreignField: 'epicId',
						as: 'stories'
					}
				},
				{
					$project: {
						_id: 1,
						epicName: 1,
						status: 'In Progress',
						totalStories: { $size: '$stories' }
					}
				}
			]
		);
		let wrapper = {};
		wrapper.phaseName = phase.phaseName;
		wrapper.phaseStatus = phase.status;
		wrapper.epicList = epicList;
		res.json(wrapper);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}


export { getPhaseList, getEpicList };

