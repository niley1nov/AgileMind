import Project from "../models/Project.js";
import Phase from "../models/Phase.js";
import Epic from "../models/Epic.js";
import mongoose from "mongoose";



async function getPhaseList(req, res) {
    try {
      const projectId = req.query.projectId;
      const project = await Project.findOne({ _id: projectId });
      const phaseList = await Phase.aggregate(
        [
            {
                $match: {
                    projectId: new mongoose.Types.ObjectId(projectId),
                }
            },
            {
              $lookup: {
                from: 'epics', 
                localField: '_id',
                foreignField: 'phaseId',
                as: 'epics'
              }
            },
            {
                $project: {
                  _id: 1,
                  phaseName: 1,
                  status:  1,
                  totalEpics: { $size: '$epics' }
                }
            }
        ]
      );
      let wrapper = {};
      wrapper.projectName = project.projectName;
      wrapper.projectStatus = project.status;
      wrapper.phaseList = phaseList;
      res.json(wrapper);
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error " + err.message,
      });
    }
}


async function getEpicList(req, res){
    try {
        const phaseId = req.query.phaseId;
        const phase = await Phase.findOne({ _id: phaseId });
        const epicList = await Epic.aggregate(
          [
              {
                  $match: {
                      phaseId: new mongoose.Types.ObjectId(phaseId),
                  }
              },
              {
                $lookup: {
                  from: 'stories', 
                  localField: '_id',
                  foreignField: 'epicId',
                  as: 'stories'
                }
              },
              {
                  $project: {
                    _id: 1,
                    epicName: 1,
                    status: 'In Progress',
                    totalStories: { $size: '$stories' }
                  }
              }
          ]
        );
        let wrapper = {};
        wrapper.phaseName = phase.phaseName;
        wrapper.phaseStatus = phase.status;
        wrapper.epicList = epicList;
        res.json(wrapper);
      } catch (err) {
        res.status(500).json({
          status: "error",
          message: "Internal Server Error " + err.message,
        });
      }
}


export {getPhaseList, getEpicList};

