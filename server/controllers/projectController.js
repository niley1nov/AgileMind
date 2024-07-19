import Project from '../models/Project.js';
import ProjectAssignment from '../models/ProjectAssignment.js';
import ProjectFile from '../models/ProjectFile.js';
import {formatDate} from '../utilities/formatUtil.js';



async function createProject(req, res){
    try{
        const projectDetails = req.body;
        const newProject = new Project({
            projectName: projectDetails.projectName,
            projectDecription: projectDetails.projectDecription,
            startDate: projectDetails.startDate,
            releaseDate: projectDetails.releaseDate
        });
        const savedProject = await newProject.save();
        await createProjectAssignmentRec(req.user._id,savedProject._id,projectDetails.startDate,projectDetails.releaseDate);
        const srsFileData = projectDetails.fileInfo;
        srsFileData.projectId = savedProject._id;
        srsFileData.type = 'SRS';
        await saveSRSFile(srsFileData);
        res.status(200).json({
            status: "success",
            Id: savedProject._Id,
        });
    }catch(err){
        res.status(500).json({
            status: "error",
            message: "Internal Server Error "+ err.message,
        });
    }
}


async function createProjectAssignmentRec(userId, projectId, startDate, endDate){
    try{
        const existingAssignment = await ProjectAssignment.findOne({ userId: userId, projectId: projectId});
        if (existingAssignment) {
            res.status(403).json({
              status: "failed",
              message: "It seems you already have an assignment.",
            });
        } else{
            const newProjectAssignment = new ProjectAssignment({
                userId: userId,
                projectId: projectId,
                startDate: startDate,
                endDate: endDate
            });
            await newProjectAssignment.save();
        }  
    }catch(err){
        res.status(500).json({
            status: "error",
            message: "Internal Server Error "+ JSON.stringify(err),
        });
    }
}


async function getAssignedProjectList(req,res){
    try{
        const assignments = await ProjectAssignment.find({userId: req.user._id});
        const projectIds = assignments.map(assignment => assignment.projectId);
        const projects = await Project.find({ _id: { $in: projectIds } });
        const projectRes = projects.map(function (project){
            let projectWrapper = {};
            projectWrapper._id = project._id;
            projectWrapper.projectName = project.projectName;
            projectWrapper.startDate = formatDate(project.startDate);
            projectWrapper.releaseDate = formatDate(project.releaseDate);
            return projectWrapper;
        });
        res.json(projectRes);
    }catch(err){
        res.status(500).json({
            status: "error",
            message: "Internal Server Error "+err.message,
        });
    }
}


async function saveSRSFile(fileToSave){
    try{
        const newFile = new ProjectFile(fileToSave);
        await newFile.save();
    }catch(err){
        res.status(500).json({
            status: "error",
            message: "Internal Server Error "+JSON.stringify(err),
        });
    }
}

export {createProject,getAssignedProjectList}