import AIService from "./AIService.js";
import { getPhaseChat } from "./projectQuestionService.js";
import Project from "../models/Project.js";
import Document from "../models/Document.js";
import { getProjectDocumentContent } from "../utilities/documentUtil.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";
import Epic from "../models/Epic.js";
import Story from "../models/Story.js";

async function createPhaseStructure(phaseId, projectId, phaseSeqNum) {
    const currPhaseChat = await getPhaseChat(phaseId);
    const project = await Project.findOne({ _id: projectId });
    const projectSummary = project.projectSummary;
    const projectTechStructure = JSON.parse(
        await getProjectDocumentContent(
        projectId,
        DOCUMENT_TYPE.PROJECT_TECH_STRUCT
        )
    );
    const projectFunStructureDetailed = JSON.parse(
        await getProjectDocumentContent(
        projectId,
        DOCUMENT_TYPE.PROJECT_FUN_STRUCT_DETAILED
        )
    );
    const projectFunStructure = JSON.parse(
        await getProjectDocumentContent(projectId, DOCUMENT_TYPE.PROJECT_FUN_STRUCT)
    );

    const projectTechDiscussionDocument = await getProjectDocumentContent(
        projectId,
        DOCUMENT_TYPE.PROJECT_TECH_DOC
    );

    const phaseRelatedFunctionalDetails = JSON.parse(
        await getProjectDocumentContent(
        projectId,
        DOCUMENT_TYPE.PHASE_FUN_STRUCT_DETAILED
        )
    );

    //Start AI Service class to run AI logic
    const service = new AIService();
    service.initJsonSession(projectSummary);

    //Create Phase Discsussion document
    const phaseDiscussionDoc = await service.documentPhaseDiscussion(
        projectSummary,
        projectTechStructure[phaseSeqNum - 1],
        currPhaseChat
    );

    //Create Phase Refinement History for the previous phases
    const phaseRefinementHistory = await getPhaseRefinementHistory(
        service,
        projectId,
        phaseSeqNum,
        projectTechStructure
    );

    console.log('>>> phaseRefinementHistory '+JSON.stringify(phaseRefinementHistory));

    //Refine the Phase details
    const { phaseStructureText, phaseStructureJSON } = await service.refinePhase(
        projectFunStructureDetailed,
        projectTechDiscussionDocument,
        projectTechStructure[phaseSeqNum - 1],
        phaseDiscussionDoc,
        phaseRefinementHistory
    );

    //Refine each epic present in the phase
    const refinedEpic = await service.refineEpic(
        phaseStructureJSON,
        projectFunStructure,
        phaseRelatedFunctionalDetails,
        projectTechDiscussionDocument,
        phaseDiscussionDoc
    );

    console.log('>>> refinedEpic '+JSON.stringify(refinedEpic));

    //Get the final list of stories
    const refinedStoryList = await Promise.all(refinedEpic.epics.map(async function (epic) {
            return await service.storyJsonify(epic);
        })
    );

    console.log('>>> refinedStoryList '+JSON.stringify(refinedStoryList));

    await createEpicStoryUnderPhase(phaseId, refinedStoryList);

    console.log('>>> Created All the data ');

    const documentList = [
        {
        content: phaseDiscussionDoc,
        docType: DOCUMENT_TYPE.PHASE_DISCUSSION_DOC,
        phaseId: phaseId,
        },
        {
        content: phaseStructureText,
        docType: DOCUMENT_TYPE.PHASE_STRUCT_TEXT,
        phaseId: phaseId,
        },
        {
        content: JSON.stringify(phaseStructureJSON),
        docType: DOCUMENT_TYPE.PHASE_REFINED,
        phaseId: phaseId,
        },
    ];

    //Insert document in the backend
    await Document.insertMany(documentList);

    //Update the Phase status to In Progress
    await Phase.findOneAndUpdate(
        { _id: phaseId },
        { status: "In Progress" },
        { new: true }
    );
}

async function getPhaseRefinementHistory(
  service,
  projectId,
  phaseSeqNum,
  projectTechStructure
) {
    if (phaseSeqNum == 1) {
        return [];
    }

    const phaseList = await Project.aggregate([
        {
        $match: {
            _id: new mongoose.Types.ObjectId(projectId),
        }, // replace with your specific project ID
        },
        {
        $lookup: {
            from: "phases",
            let: { projectId: "$_id" },
            pipeline: [
            {
                $match: {
                $expr: {
                    $and: [
                    {
                        $eq: ["$projectId", "$$projectId"],
                    },
                    { $lt: ["$seqNumber", phaseSeqNum] }, // replace specificNumber with the number you want
                    ],
                },
                },
            },
            {
                $sort: { seqNumber: 1 }, // Sort phases by seqNumber in ascending order
            },
            {
                $lookup: {
                from: "documents",
                let: { phaseId: "$_id" },
                pipeline: [
                    {
                    $match: {
                        $expr: {
                        $and: [
                            {
                            $eq: ["$phaseId", "$$phaseId"],
                            },
                            {
                            $in: [
                                "$docType",
                                [
                                DOCUMENT_TYPE.PHASE_DISCUSSION_DOC,
                                DOCUMENT_TYPE.PHASE_STRUCT_TEXT,
                                ],
                            ],
                            },
                        ],
                        },
                    },
                    },
                ],
                as: "documents",
                },
            },
            ],
            as: "phases",
        },
        },
        {
        $project: {
            phases: {
            _id: 1,
            phaseName: 1, // replace with your phase fields
            seqNumber: 1, // include seqNumber if needed
            documents: 1,
            },
        },
        },
    ]);

    const phases = [];
    const phaseDiscussionDocuments = [];
    const phaseStructureTexts = [];

    for (let i = 0; i < phaseList.phases.length; i++) {
        phases = projectTechStructure[i];
        for (let doc of phaseList.phases[i]) {
        if (doc.docType === DOCUMENT_TYPE.PHASE_DISCUSSION_DOC) {
            phaseDiscussionDocuments.push(doc.content);
        } else if (doc.docType === DOCUMENT_TYPE.PHASE_STRUCT_TEXT) {
            phaseStructureTexts.push(doc.content);
        }
        }
    }

    console.log('>>> phaseDiscussionDocuments '+JSON.stringify(phaseDiscussionDocuments));
    console.log('>>> phaseDiscussionDocuments '+JSON.stringify(phaseDiscussionDocuments));

    return service.preparePhaseRefinementHistory(
        phases,
        phaseDiscussionDocuments,
        phaseStructureTexts
    );
}

async function createEpicStoryUnderPhase(phaseId, refinedStoryList) {
    let storyList = [];
    let taskList = [];

    //Create epic list to insert
    const epicList = refinedStoryList.map(function (epic, index) {
        return {
        epicName: epic.name,
        phaseId: phaseId,
        seqNumber: index + 1,
        epicData: epic.data,
        };
    });
    const insertedEpics = await Epic.insertMany(epicList);

    //Create story list to insert
    for (let epicIndex = 0; epicIndex < insertedEpics.length; epicIndex++) {
        const epic = refinedStoryList[epicIndex];
        const tempStoryList = epic.stories.map(function (story) {
        return {
            storyName: story.name,
            epicId: insertedEpics[epicIndex]._id,
            description: story.description,
            tasks: story.tasks
        };
        });
        storyList = [...storyList, ...tempStoryList];
    }

    await Story.insertMany(storyList);
}

export { createPhaseStructure };