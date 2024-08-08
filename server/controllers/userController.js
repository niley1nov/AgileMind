import User from '../models/User.js';
import Story from '../models/Story.js';
import Epic from '../models/Epic.js';
import Phase from '../models/Phase.js';
import Project from '../models/Project.js';

async function getUserByEmail(req, res){
    try{
        const userDetails = req.query;
        const users = await User.find(
            { userEmail: new RegExp(userDetails.userEmail, 'i'), role: userDetails.userRole},
            '_id userEmail' 
          );
          res.json(users);
    }catch(err){
        es.status(500).json({
            status: "error",
            message: "Internal Server Error "+ err.message,
        });
    }
}


async function getNavigationInfo(req, res){
    try{
       let recordId = req.query.id;
       let pageName = req.query.pageName;
       const navigationList = [];
        if(pageName == 'Story'){
            const storyData = await Story.findOne({_id: recordId});
            navigationList.unshift({label: 'Story: '+storyData.storyName, link: null });
            recordId = storyData.epicId;
            pageName = 'Epic';
        }

        if(pageName == 'Epic'){
            const epicData = await Epic.findOne({_id: recordId});
            navigationList.unshift({label: 'Epic: '+epicData.epicName, link: `/Epic/${recordId}` });
            recordId = epicData.phaseId;
            pageName = 'Phase';
        }

        if(pageName == 'Phase'){
            const phaseData = await Phase.findOne({_id: recordId});
            navigationList.unshift({label: phaseData.phaseName, link: `/Phase/${recordId}` });
            recordId = phaseData.projectId;
            pageName = 'Project';
        }

        if(pageName == 'Project'){
            const projectData = await Project.findOne({_id: recordId});
            navigationList.unshift({label: 'Project: '+projectData.projectName, link: `/Project/${recordId}` });
            navigationList.unshift({label: 'Dashboard', link: '/'});
        }
        res.json(navigationList);
    }catch(err){
        res.status(500).json({
            status: "error",
            message: "Internal Server Error "+ err.message,
        });
    }
}


export {getUserByEmail,getNavigationInfo};