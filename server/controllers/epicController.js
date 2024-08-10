import mongoose from "mongoose";
import Epic from "../models/Epic.js";
import Story from "../models/Story.js";

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
		console.log("Internal Server Error " + err.message);
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}


async function getStoryDependencyData(req, res) {
	try {
		const epicId = req.query.epicId;
		const epic = await Epic.findOne({ _id: epicId });
		const wrapper = {};
		wrapper.epicName = epic.epicName;
		wrapper.storyDependencies = JSON.parse(epic.storyDependencies);
		res.json(wrapper);
	} catch (err) {
		console.log("Internal Server Error " + err.message);
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

export { getStoryList, getStoryDependencyData };