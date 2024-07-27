import mongoose from "mongoose";

const projectQuestionSchema = new mongoose.Schema({
  question: { type: String, required: "Question is a required field" },
  seqNumber: {type: Number, required: true, min: 1},
  answer: { type: String },
  answerGivenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users'  },
  type: {
    type: String,
    enum: ["Technical","Functional"],
    required: "type is a required field"
  },
  subtype: {type: String},
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects'}
});

export default mongoose.model("projectQuestions", projectQuestionSchema);