import Story from "../models/Story.js";
import Epic from "../models/Epic.js";
import Phase from "../models/Phase.js";

/**
 * The function `getProjectId` retrieves the project ID based on the objectType and recordId provided,
 * handling different object types such as Story, Epic, Phase, and Project.
 * @param objectType - The `objectType` parameter in the `getProjectId` function represents the type of
 * object for which you want to retrieve the project ID. It can be one of the following values:
 * 'Story', 'Epic', 'Phase', or 'Project'. The function then fetches the project ID
 * @param recordId - The `recordId` parameter is the unique identifier of the record for which you want
 * to retrieve the project ID. It could be the ID of a Story, Epic, Phase, or Project depending on the
 * `objectType` specified when calling the `getProjectId` function.
 * @returns The `getProjectId` function returns the project ID based on the objectType and recordId
 * provided. The function handles different cases based on the input `objectType`:
 */
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