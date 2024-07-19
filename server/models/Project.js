import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: "Project Name is a required field" },
    projectDecription: { type: String},
    startDate: { type: Date, required: "Start Date is a required field" },
    releaseDate: { type: Date, required: "Release Date is a required field" },
  }
);

export default mongoose.model("projects", projectSchema);
