import mongoose from "mongoose";

const epicSchema = new mongoose.Schema({
	epicName: { type: String, required: "Epic Name is a required field" },
	phaseId: { type: mongoose.Schema.Types.ObjectId, required: "Phase Id is a required field", ref: "phases" },
	seqNumber: { type: Number, required: true, min: 1 },
	epicData: { type: String },
	storyDependencies: { type: String },
	notes: { type: String }
});

export default mongoose.model("epics", epicSchema);
