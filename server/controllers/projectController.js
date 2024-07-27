import Project from "../models/Project.js";
import ProjectAssignment from "../models/ProjectAssignment.js";
import ProjectQuestion from "../models/ProjectQuestion.js";
import User from "../models/User.js";
import ProjectFile from "../models/ProjectFile.js";
import { formatDate } from "../utilities/formatUtil.js";
import AIService from "../services/AIService.js";
import mongoose from "mongoose";

async function createProject(req, res) {
  try {
    const projectDetails = req.body;
    const newProject = new Project({
      projectName: projectDetails.projectName,
      projectDecription: projectDetails.projectDecription,
      startDate: projectDetails.startDate,
      releaseDate: projectDetails.releaseDate,
    });
    const savedProject = await newProject.save();
    await createProjectAssignmentRec(
      req.user._id,
      savedProject._id,
      projectDetails.startDate,
      projectDetails.releaseDate
    );
    const srsFileData = projectDetails.fileInfo;
    srsFileData.projectId = savedProject._id;
    srsFileData.type = "SRS";
    await saveSRSFile(srsFileData);
    res.status(200).json({
      status: "success",
      Id: savedProject._Id,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error " + err.message,
    });
  }
}

async function getAssignedProjectList(req, res) {
  try {
    const assignments = await ProjectAssignment.find({ userId: req.user._id });
    const projectIds = assignments.map((assignment) => assignment.projectId);
    const projects = await Project.find({ _id: { $in: projectIds } });
    const projectRes = projects.map(function (project) {
      let projectWrapper = {};
      projectWrapper._id = project._id;
      projectWrapper.projectName = project.projectName;
      projectWrapper.startDate = formatDate(project.startDate);
      projectWrapper.releaseDate = formatDate(project.releaseDate);
      (projectWrapper.status = project.status),
        (projectWrapper.totalPhase = "0");
      return projectWrapper;
    });
    res.json(projectRes);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error " + err.message,
    });
  }
}

async function createProjectAssignment(req, res) {
  try {
    const projectAssignDetails = req.body;
    const selectedUser = await User.findOne({
      userEmail: projectAssignDetails.userEmail,
      role: projectAssignDetails.userRole,
    });
    if (!selectedUser) {
      res.status(404).json({
        status: "failed",
        message: "This user is not present in our database",
      });
    } else {
      const newAssignment = await createProjectAssignmentRec(
        selectedUser._id,
        projectAssignDetails.projectId,
        projectAssignDetails.startDate,
        projectAssignDetails.endDate
      );
      if (newAssignment) {
        res.status(200).json({
          status: "success",
          Id: newAssignment._Id,
        });
      } else {
        res.status(403).json({
          status: "failed",
          message: "It seems you already have an assignment.",
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error " + JSON.stringify(err),
    });
  }
}

async function createProjectAssignmentRec(
  userId,
  projectId,
  startDate,
  endDate
) {
  const existingAssignment = await ProjectAssignment.findOne({
    userId: userId,
    projectId: projectId,
  });
  if (existingAssignment) {
    return null;
  } else {
    const newProjectAssignment = new ProjectAssignment({
      userId: userId,
      projectId: projectId,
      startDate: startDate,
      endDate: endDate,
    });
    await newProjectAssignment.save();
    return newProjectAssignment;
  }
}

async function getPhaseList(req, res) {
  try {
    const projectId = req.query.projectId;
    const project = await Project.findOne({ _id: projectId });
    let wrapper = {};
    wrapper.projectName = project.projectName;
    wrapper.projectStatus = project.status;
    res.json(wrapper);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error " + err.message,
    });
  }
}

async function getProjectAssignments(req, res) {
  try {
    const projectId = req.query.projectId;
    const results = await ProjectAssignment.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "users", // The collection name in MongoDB
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0, // Exclude _id if you don't want it in the result
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.userEmail",
          role: "$userDetails.role",
          startDate: 1,
          endDate: 1,
        },
      },
    ]);
    console.log('>>> '+results);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error " + err.message,
    });
  }
}

async function saveSRSFile(fileToSave) {
  const newFile = new ProjectFile(fileToSave);
  await newFile.save();
}

async function updateProjectSummary(projectId, srsText) {
  const service = new AIService();
  const projectSummary = await service.getProjectSummary(srsText);
  const projectQuestions = JSON.parse(
    await service.getProjectLevelQuestions(srsText)
  );

  const functionalQuestions = projectQuestions["functional"].map(function (
    question,
    index
  ) {
    return new ProjectQuestion({
      seqNumber: index + 1,
      question: question,
      projectId: projectId,
      type: "Functional",
    });
  });

  const technicalQuestions = projectQuestions["technical"].map(function (
    question,
    index
  ) {
    return new ProjectQuestion({
      seqNumber: index + 1,
      question: question,
      projectId: projectId,
      type: "Technical",
    });
  });
  await ProjectQuestion.insertMany([
    ...functionalQuestions,
    ...technicalQuestions,
  ]);
  await Project.updateOne(
    { _id: projectId },
    { projectSummary: projectSummary, status: "Waiting for Input" }
  );
}

export {
  createProject,
  getAssignedProjectList,
  createProjectAssignment,
  updateProjectSummary,
  getPhaseList,
  getProjectAssignments,
};
