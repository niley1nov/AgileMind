import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema({
  phaseName: { type: String, required: "Project Name is a required field" },
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
  projectId: { type: mongoose.Schema.Types.ObjectId, required: "Project Id is a required field", ref: "projects"},
});

export default mongoose.model("phases", phaseSchema);
