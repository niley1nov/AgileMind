import mongoose from "mongoose";
import { createProjectDocuments } from "../services/projectService.js";

const projectSchema = new mongoose.Schema({
	projectName: { type: String, required: "Project Name is a required field" },
	projectDecription: { type: String },
	startDate: { type: Date, required: "Start Date is a required field" },
	releaseDate: { type: Date, required: "Release Date is a required field" },
	status: {
		type: String,
		enum: [
			"Created",
			"Waiting for Input",
			"Input Provided",
			"In Progress",
			"Completed",
		],
		required: "status is a required field",
		default: "Created",
	},
	projectSummary: { type: String },
	isFunctionalInputProvided: { type: Boolean, default: false },
	isTechnicalInputProvided: { type: Boolean, default: false },
});

let oldDocumentCache = {};

// Pre hook to capture the previous state of the document
projectSchema.pre("findOneAndUpdate", async function (next) {
	const oldDoc = await this.model.findOne(this.getQuery());
	oldDocumentCache[this.getFilter()._id] = oldDoc;
	console.log('>>> In PRE UPDATE PROJECT');
	next();
});

//Post hook for update operation
projectSchema.post("findOneAndUpdate", function (doc) {
	const oldDoc = oldDocumentCache[doc._id];
	console.log('>>> In POST UPDATE PROJECT');
	if (
		doc.status == 'Input Provided' &&
		oldDoc.status !== 'Input Provided'

	) {
		console.log('>>> POST IF');
		createProjectDocuments(doc._id, doc.projectSummary);
	}
});

export default mongoose.model("projects", projectSchema);
