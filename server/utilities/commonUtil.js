import Story from "../models/Story.js";
import Epic from "../models/Epic.js";
import Phase from "../models/Phase.js";

async function getProjectId(objectType, recordId){
    switch(objectType){
        case 'Story':
            const story = await Story.findOne({_id: recordId});
            if(story && story.epicId){
                const epic = await Epic.findOne({_id: story.epicId});
                if(epic && epic.phaseId){
                    const phase = await Phase.findOne({_id: epic.phaseId});
                    return phase ? phase.projectId : null;
                }

            }
            return null;

        case 'Epic':
            const epicForEpic = await Epic.findOne({_id: recordId});
            if(epicForEpic && epicForEpic.phaseId){
                const phaseForEpic = await Phase.findOne({_id: epicForEpic.phaseId});
                return phaseForEpic ? phaseForEpic.projectId : null;
            }
            return null;

        case 'Phase':
            const phaseForPhase = await Phase.findOne({_id: recordId});
            return phaseForPhase ? phaseForPhase.projectId : null;


        case 'Project':
            return recordId;

        default:
            return null;
            
    }
}

export {getProjectId};