import mongoose from "mongoose";
import Story from "../models/Story.js";
import User from "../models/User.js";

async function getStoryDetails(req,res){
    try{
        const storyId = req.query.storyId;
        const storyList = await Story.aggregate(
            [
                {
                    $match: { _id: new mongoose.Types.ObjectId(storyId) }
                },
                {
                    $lookup: {
                        from: "epics", 
                        localField: "epicId", 
                        foreignField: "_id", 
                        as: "epic" 
                    }
                },
                {
                    $unwind: "$epic" 
                }, 
                {
                    $lookup: {
                      from: "users",
                      localField: "devOwner",
                      foreignField: "_id",
                      as: "devUser"
                    }
                },
                {
                    $lookup: {
                      from: "users",
                      localField: "qaOwner",
                      foreignField: "_id",
                      as: "qaUser"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        storyName: 1,
                        description: 1,
                        tasks: 1,
                        status: 1,
                        confidence: 1,
                        moscow: 1,
                        storyPoint: 1,
                        remarks: 1,
                        epicName: "$epic.epicName",
                        devOwnerEmail: "$devUser.userEmail",
                        qaOwnerEmail: "$qaUser.userEmail"
                    }
                }
            ]

        );
        const storyData = storyList[0];
        const wrapper = {};
        const storyDetails = {};
        storyDetails.storyName = storyData.storyName;
        storyDetails.description = storyData.description;
        storyDetails.tasks = storyData.tasks;
        storyDetails.epicName = storyData.epicName;
        wrapper.storyDetails = storyDetails;
        const storyInputDetails = {};
        storyInputDetails.devOwnerEmail = storyData.devOwnerEmail.length>0 ? storyData.devOwnerEmail[0] : '';
        storyInputDetails.qaOwnerEmail = storyData.qaOwnerEmail.length>0 ? storyData.qaOwnerEmail[0] : '';
        storyInputDetails.storyStatus = storyData.status;
        storyInputDetails.confidence = storyData.confidence;
        storyInputDetails.moscow = storyData.moscow;
        storyInputDetails.storyPoint = storyData.storyPoint;
        storyInputDetails.reMarks = storyData.remarks;
        wrapper.storyInputDetails = storyInputDetails;
        res.json(wrapper);
    }catch (err) {
        console.log( "Internal Server Error " + err.message);
        res.status(500).json({
          status: "error",
          message: "Internal Server Error " + err.message,
        });
    }
}

async function updateStoryDetails(req, res){
    try{
        const storyDetails = req.body;
        const devOwner = storyDetails.devOwnerEmail ? await User.findOne({userEmail: storyDetails.devOwnerEmail}) : '';
        const qaOwner = storyDetails.qaOwnerEmail ? await User.findOne({userEmail: storyDetails.qaOwnerEmail}) : '';
        const updatedStory = await Story.findOneAndUpdate(
            {_id: storyDetails.storyId},
            {
                devOwner: (devOwner ? devOwner._id : null),
                qaOwner:  (qaOwner ? qaOwner._id : null),
                status: storyDetails.storyStatus,
                confidence: storyDetails.confidence,
                moscow: storyDetails.moscow,
                storyPoint: storyDetails.storyPoint,
                remarks: storyDetails.reMarks,
            }
        );
        res.status(200).json({
            status: "success",
            Id: updatedStory._Id,
        });
    }catch (err) {
        console.log( "Internal Server Error " + err.message);
        res.status(500).json({
          status: "error",
          message: "Internal Server Error " + err.message,
        });
    }
}


export {getStoryDetails, updateStoryDetails};