import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    storyName: { type: String, required: "Story Name is a required field" },
    epicId: { type: mongoose.Schema.Types.ObjectId, required: "Epic Id is a required field", ref: "epics"},
    description: {type: String},
    tasks: {type: String},
    devOwner: { type: mongoose.Schema.Types.ObjectId, ref: "users"},
    qaOwner: { type: mongoose.Schema.Types.ObjectId, ref: "users"},
    status: {
        type: String,
        enum: [
          "Planned",
          "Assigned",
          "In Progress",
          "Blocked",
          "Backlog",
          "Completed",
        ],
        default: "Planned",
    }
});

export default mongoose.model("stories", storySchema);
