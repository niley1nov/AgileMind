import mongoose from "mongoose";


const documentSchema = new mongoose.Schema({
	projectId: { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
	phaseId: { type: mongoose.Schema.Types.ObjectId, ref: "phases" },
	docType: {
		type: String,
		enum: [
			"Project Functional Chat",
			"Project Technical Chat",
			"Project Functional Discussion Document",
			"Project Technical Discussion Document",
			"Project Functional Structure",
			"Project Functional Structure Detailed",
			"Project Technical Structure",
			"Phase Functional Structure Detailed",
			"Phase Discussion Document",
			"Phase Structure Text",
			"Phase Refined"
		],
		required: "status is a required field",
	},
	content: { type: String }
});

export default mongoose.model("documents", documentSchema);
