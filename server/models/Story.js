import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
	storyName: { type: String, required: "Story Name is a required field" },
	epicId: {
		type: mongoose.Schema.Types.ObjectId,
		required: "Epic Id is a required field",
		ref: "epics",
	},
	description: { type: String },
	tasks: { type: String },
	devOwner: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	qaOwner: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
	status: {
		type: String,
		enum: [
			"Planned",
			"Assigned",
			"In Progress",
			"Blocked",
			"Backlog",
			"Completed",
		],
		default: "Planned",
	},
	storyPoint: { type: Number },
	confidence: {
		type: String,
		enum: ["High", "Medium","Low"],
	},
	moscow: {
		type: String,
		enum: ["Must Have", "Should Have", "Could Have", "Won't Have"],
	},
	remarks: {
		type: String
	}
});

export default mongoose.model("stories", storySchema);
