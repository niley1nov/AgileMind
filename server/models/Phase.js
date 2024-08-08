import mongoose from "mongoose";
import {createPhaseStructure} from "../services/phaseService.js";

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
  seqNumber: {type: Number, required: true, min: 1},
});


let oldDocumentCache = {};

// Pre hook to capture the previous state of the document
phaseSchema.pre("findOneAndUpdate", async function (next) {
  const oldDoc = await this.model.findOne(this.getQuery());
  oldDocumentCache[this.getFilter()._id] = oldDoc;
  console.log('>>> In PRE UPDATE PHASE');
  next();
});

//Post hook for update operation
phaseSchema.post("findOneAndUpdate", function (doc) {
  const oldDoc = oldDocumentCache[doc._id];
  console.log('>>> In POST UPDATE PHASE');
  if (
    doc.status == 'Input Provided' &&
    oldDoc.status !== 'Input Provided'
    
  ){
    console.log('>>> In POST UPDATE PHASE IF');
    createPhaseStructure(doc._id, doc.projectId, doc.seqNumber);
  }
});

export default mongoose.model("phases", phaseSchema);
