import Project from "../models/Project.js";
import ProjectAssignment from "../models/ProjectAssignment.js";
import User from "../models/User.js";
import ProjectFile from "../models/ProjectFile.js";
import { formatDate } from "../utilities/formatUtil.js";
import mongoose from "mongoose";
import { USER_ROLE } from "../utilities/constant.js";

/**
 * The function `createProject` handles the creation of a new project, including saving project
 * details, creating project assignments, saving SRS file data, and returning a success or error
 * response.
 * @param req - The `req` parameter in the `createProject` function stands for the request object,
 * which contains information about the HTTP request that triggered the function. This object typically
 * includes details such as the request headers, request body, request method, URL, and user
 * authentication details.
 * @param res - The `res` parameter in the `createProject` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, headers, and send data back to the client in the form of JSON, HTML, or
 */
async function createProject(req, res) {
	try {
		const projectDetails = req.body;
		const newProject = new Project({
			projectName: projectDetails.projectName,
			projectDecription: projectDetails.projectDecription,
			startDate: projectDetails.startDate,
			releaseDate: projectDetails.releaseDate,
		});
		const savedProject = await newProject.save();
		await createProjectAssignmentRec(
			req.user._id,
			savedProject._id,
			projectDetails.startDate,
			projectDetails.releaseDate
		);
		const srsFileData = projectDetails.fileInfo;
		srsFileData.projectId = savedProject._id;
		srsFileData.type = "SRS";
		await saveSRSFile(srsFileData);
		res.status(200).json({
			status: "success",
			Id: savedProject._Id,
		});
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `getAssignedProjectList` retrieves a list of projects assigned to a user, including
 * project details and phases, and returns the list along with a flag indicating if the user is a
 * project manager.
 * @param req - The `req` parameter in the `getAssignedProjectList` function typically represents the
 * request object, which contains information about the HTTP request that triggered the function. This
 * object includes properties such as request headers, parameters, body, user information, and more.
 * @param res - The `res` parameter in the `getAssignedProjectList` function is the response object
 * that will be used to send the response back to the client making the request. In this function, the
 * response object is used to send the project list data or an error message in case of an error.
 * @returns The function `getAssignedProjectList` is returning a JSON response containing the list of
 * projects assigned to the user along with additional information. The response includes an array of
 * project objects with properties such as `_id`, `projectName`, `startDate`, `releaseDate`, `status`,
 * and `totalPhase`. Additionally, the response includes a boolean value `isProjectManager` indicating
 * whether the user has a
 */
async function getAssignedProjectList(req, res) {
	try {
		const assignments = await ProjectAssignment.find({ userId: req.user._id });
		const projectIds = assignments.map((assignment) => assignment.projectId);

		const projectList = await Project.aggregate(
			[
				{
					$match: {
						_id: { $in: projectIds }
					}
				},
				{
					$lookup: {
						from: 'phases', // The collection name in the database
						localField: '_id',
						foreignField: 'projectId',
						as: 'phases'
					}
				},
				{
					$project: {
						projectName: 1,
						startDate: 1,
						releaseDate: 1,
						status: 1,
						phaseCount: { $size: '$phases' }
					}
				}
			]
		);
		const projects = projectList.map(function (project) {
			let projectWrapper = {};
			projectWrapper._id = project._id;
			projectWrapper.projectName = project.projectName;
			projectWrapper.startDate = formatDate(project.startDate);
			projectWrapper.releaseDate = formatDate(project.releaseDate);
			projectWrapper.status = project.status;
			projectWrapper.totalPhase = project.phaseCount;
			return projectWrapper;
		});
		const projectRes = {projectList: projects, isProjectManager: (req.user.role == USER_ROLE.MANAGER)}
		res.json(projectRes);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});

	}
}

/**
 * The function `createProjectAssignment` handles creating project assignments for users, checking if
 * the user exists in the database, and returning appropriate responses based on the outcome.
 * @param req - The `req` parameter in the `createProjectAssignment` function typically represents the
 * HTTP request object, which contains information about the incoming request from the client, such as
 * the request headers, body, parameters, and more. In this specific function, `req` is used to access
 * the request body (`
 * @param res - The `res` parameter in the `createProjectAssignment` function is the response object
 * that will be used to send the response back to the client making the request. It is typically an
 * instance of the Express response object that allows you to send HTTP responses with status codes,
 * headers, and data back to
 */
async function createProjectAssignment(req, res) {
	try {
		const projectAssignDetails = req.body;
		const selectedUser = await User.findOne({
			userEmail: projectAssignDetails.userEmail,
			role: projectAssignDetails.userRole,
		});
		if (!selectedUser) {
			res.status(404).json({
				status: "failed",
				message: "This user is not present in our database",
			});
		} else {
			const newAssignment = await createProjectAssignmentRec(
				selectedUser._id,
				projectAssignDetails.projectId,
				projectAssignDetails.startDate,
				projectAssignDetails.endDate
			);
			if (newAssignment) {
				res.status(200).json({
					status: "success",
					Id: newAssignment._Id,
				});
			} else {
				res.status(403).json({
					status: "failed",
					message: "It seems you already have an assignment.",
				});
			}
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + JSON.stringify(err),
		});
	}
}

/**
 * The function `createProjectAssignmentRec` creates a new project assignment for a user with specified
 * project, start date, and end date if no existing assignment is found.
 * @param userId - The `userId` parameter in the `createProjectAssignmentRec` function represents the
 * unique identifier of the user who is being assigned to the project. This identifier is used to
 * associate the user with the project assignment record in the database.
 * @param projectId - projectId is the unique identifier for the project to which the user will be
 * assigned.
 * @param startDate - The `startDate` parameter in the `createProjectAssignmentRec` function represents
 * the date when the project assignment is scheduled to start for the user on the specified project. It
 * is the beginning date of the assignment period.
 * @param endDate - The `endDate` parameter in the `createProjectAssignmentRec` function represents the
 * date when the project assignment is scheduled to end for the specified user on the given project. It
 * is the date when the user's involvement in the project is expected to conclude.
 * @returns The `createProjectAssignmentRec` function returns either `null` if an existing assignment
 * is found for the given `userId` and `projectId`, or it returns the newly created `ProjectAssignment`
 * object if no existing assignment is found and a new assignment is successfully created and saved.
 */
async function createProjectAssignmentRec(
	userId,
	projectId,
	startDate,
	endDate
) {
	const existingAssignment = await ProjectAssignment.findOne({
		userId: userId,
		projectId: projectId,
	});
	if (existingAssignment) {
		return null;
	} else {
		const newProjectAssignment = new ProjectAssignment({
			userId: userId,
			projectId: projectId,
			startDate: startDate,
			endDate: endDate,
		});
		await newProjectAssignment.save();
		return newProjectAssignment;
	}
}

/**
 * The function `getProjectAssignments` retrieves project assignments with user details from MongoDB
 * based on the provided project ID.
 * @param req - The `req` parameter in the `getProjectAssignments` function typically represents the
 * HTTP request object, which contains information about the incoming request from the client, such as
 * request headers, parameters, body, and query parameters. In this specific function,
 * `req.query.projectId` is used to extract
 * @param res - The `res` parameter in the `getProjectAssignments` function is the response object that
 * will be used to send the response back to the client making the request. It is typically an instance
 * of the Express response object that allows you to send HTTP responses with data such as JSON, HTML,
 * or
 */
async function getProjectAssignments(req, res) {
	try {
		const projectId = req.query.projectId;
		const results = await ProjectAssignment.aggregate([
			{
				$match: {
					projectId: new mongoose.Types.ObjectId(projectId),
				},
			},
			{
				$lookup: {
					from: "users", // The collection name in MongoDB
					localField: "userId",
					foreignField: "_id",
					as: "userDetails",
				},
			},
			{
				$unwind: "$userDetails",
			},
			{
				$project: {
					_id: 0, // Exclude _id if you don't want it in the result
					firstName: "$userDetails.firstName",
					lastName: "$userDetails.lastName",
					email: "$userDetails.userEmail",
					role: "$userDetails.role",
					startDate: 1,
					endDate: 1,
				},
			},
		]);
		res.status(200).json(results);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `saveSRSFile` saves a file using an asynchronous operation.
 * @param fileToSave - The `fileToSave` parameter is the file that you want to save as a spaced
 * repetition system (SRS) file. It is passed to the `saveSRSFile` function to create a new
 * `ProjectFile` object and save it asynchronously.
 */
async function saveSRSFile(fileToSave) {
	const newFile = new ProjectFile(fileToSave);
	await newFile.save();
}

export {
	createProject,
	getAssignedProjectList,
	createProjectAssignment,
	getProjectAssignments,
};
