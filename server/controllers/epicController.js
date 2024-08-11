import mongoose from "mongoose";
import Epic from "../models/Epic.js";
import Story from "../models/Story.js";

/**
 * The function `getStoryList` retrieves a list of stories associated with a specific epic, including
 * details like story name, status, and assigned owners.
 * @param req - The `req` parameter in the `getStoryList` function stands for the request object, which
 * contains information about the HTTP request that triggered the function. This object typically
 * includes details such as request headers, query parameters, body content, and more. In this specific
 * function, the `req` object
 * @param res - The `res` parameter in the `getStoryList` function is the response object that will be
 * used to send the response back to the client making the request. In this case, it is used to send a
 * JSON response containing the epic name and the list of stories retrieved based on the epicId
 */
async function getStoryList(req, res) {
	try {
		const epicId = req.query.epicId;
		const epic = await Epic.findOne({ _id: epicId });
		const storyList = await Story.aggregate(
			[
				{
					$match: {
						epicId: new mongoose.Types.ObjectId(epicId),
					}
				},
				{
					$sort: { seqNumber: 1 },
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
						status: 1,
						devOwner: {
							$ifNull: [
							  { $arrayElemAt: ["$devUser.firstName", 0] },
							  "Not Yet Assigned"
							]
						},
						qaOwner: {
							$ifNull: [
							  { $arrayElemAt: ["$qaUser.firstName", 0] },
							  "Not Yet Assigned"
							]
						}
					}
				}
			]
		);
		let wrapper = {};
		wrapper.epicName = epic.epicName;
		wrapper.storyList = storyList;
		res.json(wrapper);


	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}


/**
 * The function `getStoryDependencyData` retrieves story dependency data for a given epic ID and sends
 * it as a JSON response.
 * @param req - The `req` parameter in the `getStoryDependencyData` function typically represents the
 * request object in a Node.js application. It contains information about the HTTP request that
 * triggered the function, such as request headers, query parameters, body content, and more. In this
 * specific function, `req.query.ep
 * @param res - The `res` parameter in the `getStoryDependencyData` function is the response object
 * that will be used to send a response back to the client making the request. It is typically an
 * instance of the Express response object in Node.js applications. The `res.json()` method is used to
 * send a
 */
async function getStoryDependencyData(req, res) {
	try {
		const epicId = req.query.epicId;
		const epic = await Epic.findOne({ _id: epicId });
		const wrapper = {};
		wrapper.epicName = epic.epicName;
		wrapper.storyDependencies = JSON.parse(epic.storyDependencies);
		res.json(wrapper);
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

export { getStoryList, getStoryDependencyData };