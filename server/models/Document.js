import mongoose from "mongoose";


const documentSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, required: "Project Id is a required field", ref: "projects"},
    docType: {
      type: String,
      enum: [
        "Project Functional Chat",
        "Project Technical Chat",
        "Project Functional Discussion Document",
        "Project Technical Discussion Document",
        "Project Functional Structure",
        "Project Functional Structure Detailed",
        "Project Technical Structure"
      ],
      required: "status is a required field",
    },
    content: { type: String }
  });

export default mongoose.model("documents", documentSchema);
