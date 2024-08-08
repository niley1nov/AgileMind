import mongoose from "mongoose";

const projectAssignmentSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, required: "UserId is a required field", ref: 'users' },
		projectId: { type: mongoose.Schema.Types.ObjectId, required: "ProjectId is a required field", ref: 'projects' },
		startDate: { type: Date, required: "Start Date is a required field" },
		endDate: { type: Date, required: "End Date is a required field" },
	}
);

export default mongoose.model("projectAssignments", projectAssignmentSchema);
