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

// Pre hook to capture the previous state of the document
projectSchema.pre('findOneAndUpdate', async function(next) {
  this._update.oldDoc = await this.model.findOne(this.getQuery());
  next();
});

// Post hook for update operation
projectSchema.post('findOneAndUpdate', function(doc) {
  const oldDoc = this._update.oldDoc;

  if (oldDoc && oldDoc.status !== 'Approved' && doc.status === 'Approved') {
      // Run your custom logic here
      runYourLogic(doc);
  }
});


export default mongoose.model("projects", projectSchema);
