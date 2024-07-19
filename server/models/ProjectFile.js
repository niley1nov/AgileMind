import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: "File Name is a required field" },
    data: { type: Buffer},
    projectId: { type: mongoose.Schema.Types.ObjectId, required: "Project Id is a required field", ref: "projects"},
    type: { type: String, required: "Type is a required field" },
    contentType: {type: String, required: "Content Type is a required field"}
  }
);

export default mongoose.model("projectFiles", projectFileSchema);
