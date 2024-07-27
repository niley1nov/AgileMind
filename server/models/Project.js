import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: "Project Name is a required field" },
  projectDecription: { type: String },
  startDate: { type: Date, required: "Start Date is a required field" },
  releaseDate: { type: Date, required: "Release Date is a required field" },
  status: {
    type: String,
    enum: ["Created", "Waiting for Input","Input Provided", "In Progress", "Completed"],
    required: "status is a required field",
    default: "Created"
  },
  projectSummary: { type: String },
  isFunctionalInputProvided: {type: Boolean, default: false},
  isTechnicalInputProvided: {type: Boolean, default: false}

});

export default mongoose.model("projects", projectSchema);
