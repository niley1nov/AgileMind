import mongoose from "mongoose";
import { reFectorStory } from "../services/StoryService.js";

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
		enum: ["high", "medium", "low"],
	},
	moscow: {
		type: String,
		enum: ["Must Have", "Should Have", "Could Have", "Won't Have"],
	},
	remarks: {
		type: String
	},
	seqNumber: { type: Number, required: true, min: 1 },
	refectoringRequested: { type: Boolean, default: false }

});


let oldDocumentCache = {};

// Pre hook to capture the previous state of the document
storySchema.pre("findOneAndUpdate", async function (next) {
	const oldDoc = await this.model.findOne(this.getQuery());
	oldDocumentCache[this.getFilter()._id] = oldDoc;
	next();
});

//Post hook for update operation
storySchema.post("findOneAndUpdate", function (doc) {
	const oldDoc = oldDocumentCache[doc._id];
	if (
		doc.refectoringRequested &&
		!oldDoc.refectoringRequested

	) {
		//Write your logic of refectoring here
		reFectorStory(doc._id, doc.epicId);
	}
});

export default mongoose.model("stories", storySchema);
