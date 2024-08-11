import mongoose from "mongoose";
import Story from "../models/Story.js";
import User from "../models/User.js";

/**
 * The function `getStoryDetails` retrieves details of a story including epic, owners, status, and
 * other information and returns them in a JSON response.
 * @param req - req is the request object that contains information about the HTTP request made to the
 * server. It includes details such as query parameters, body content, headers, and more. In the
 * provided code snippet, req.query.storyId is used to extract the storyId parameter from the query
 * string of the request URL.
 * @param res - The `res` parameter in the `getStoryDetails` function is the response object that will
 * be used to send the response back to the client making the request. In this case, the response will
 * be in JSON format containing the details of a specific story along with additional information like
 * the epic name,
 */
async function getStoryDetails(req, res) {
	try {
		const storyId = req.query.storyId;
		const storyList = await Story.aggregate(
			[
				{
					$match: { _id: new mongoose.Types.ObjectId(storyId) }
				},
				{
					$lookup: {
						from: "epics",
						localField: "epicId",
						foreignField: "_id",
						as: "epic"
					}
				},
				{
					$unwind: "$epic"
				},
				{
					$lookup: {
						from: "users",
						localField: "devOwner",
						foreignField: "_id",
						as: "devUser"
					}
				},
				{
					$lookup: {
						from: "users",
						localField: "qaOwner",
						foreignField: "_id",
						as: "qaUser"
					}
				},
				{
					$project: {
						_id: 1,
						storyName: 1,
						description: 1,
						tasks: 1,
						status: 1,
						confidence: 1,
						moscow: 1,
						storyPoint: 1,
						remarks: 1,
						epicName: "$epic.epicName",
						devOwnerEmail: "$devUser.userEmail",
						qaOwnerEmail: "$qaUser.userEmail"
					}
				}
			]

		);
		const storyData = storyList[0];
		const wrapper = {};
		const storyDetails = {};
		storyDetails.storyName = storyData.storyName;
		storyDetails.description = storyData.description;
		storyDetails.tasks = storyData.tasks;
		storyDetails.epicName = storyData.epicName;
		wrapper.storyDetails = storyDetails;
		const storyInputDetails = {};
		storyInputDetails.devOwnerEmail = storyData.devOwnerEmail.length > 0 ? storyData.devOwnerEmail[0] : '';
		storyInputDetails.qaOwnerEmail = storyData.qaOwnerEmail.length > 0 ? storyData.qaOwnerEmail[0] : '';
		storyInputDetails.storyStatus = storyData.status;
		storyInputDetails.confidence = storyData.confidence;
		storyInputDetails.moscow = storyData.moscow;
		storyInputDetails.storyPoint = storyData.storyPoint;
		storyInputDetails.reMarks = storyData.remarks;
		wrapper.storyInputDetails = storyInputDetails;
		res.json(wrapper);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `updateStoryDetails` updates the details of a story in a database based on the provided
 * request body and returns the updated story.
 * @param req - The `req` parameter in the `updateStoryDetails` function typically represents the HTTP
 * request object, which contains information about the incoming request from the client, such as the
 * request headers, parameters, body, and more. In this specific function, `req` is used to access the
 * request body (`
 * @param res - The `res` parameter in the `updateStoryDetails` function is the response object that
 * will be used to send a response back to the client making the request. It is typically used to send
 * HTTP responses with status codes, headers, and data back to the client. In the provided code
 * snippet,
 */
async function updateStoryDetails(req, res) {
	try {
		const storyDetails = req.body;
		const devOwner = storyDetails.devOwnerEmail ? await User.findOne({ userEmail: storyDetails.devOwnerEmail }) : '';
		const qaOwner = storyDetails.qaOwnerEmail ? await User.findOne({ userEmail: storyDetails.qaOwnerEmail }) : '';
		const updatedStory = await Story.findOneAndUpdate(
			{ _id: storyDetails.storyId },
			{
				devOwner: (devOwner ? devOwner._id : null),
				qaOwner: (qaOwner ? qaOwner._id : null),
				status: storyDetails.storyStatus,
				confidence: storyDetails.confidence,
				moscow: storyDetails.moscow,
				storyPoint: storyDetails.storyPoint,
				remarks: storyDetails.reMarks,
			},
			{ new: true }
		);
		res.status(200).json({
			status: "success",
			updatedStory: updatedStory,
		});
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `requestForStoryRefectoring` updates a story in a database to mark refactoring as
 * requested and returns the updated story details in a JSON response.
 * @param req - The `req` parameter in the `requestForStoryRefactoring` function is typically the
 * request object representing the HTTP request made to the server. It contains information about the
 * request such as the request headers, body, parameters, and other details sent by the client. In this
 * specific function, `req
 * @param res - The `res` parameter in the `requestForStoryRefectoring` function is the response object
 * that will be sent back to the client making the request. It is used to send the HTTP response with
 * the status code and data.
 */
async function requestForStoryRefectoring(req, res) {
	try {
		const storyDetail = req.body;
		const updatedStory = await Story.findOneAndUpdate(
			{ _id: storyDetail.storyId, refectoringRequested: false },
			{ refectoringRequested: true },
			{ new: true }
		);
		res.status(200).json({
			status: "success",
			Id: updatedStory._Id,
			epicId: updatedStory.epicId
		});

	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}


export { getStoryDetails, updateStoryDetails, requestForStoryRefectoring };