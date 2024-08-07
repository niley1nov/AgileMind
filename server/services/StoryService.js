import {
  getProjectDocumentContent,
  getPhaseDocumentContent,
} from "../utilities/documentUtil.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";
import Story from "../models/Story.js";
import Epic from "../models/Epic.js";
import AIService from "./AIService.js";
import mongoose from "mongoose";

async function reFectorStory(storyId, epicId) {
  //Get all the list of stories under the epic
  const epic = await Epic.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(epicId) },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "phaseId",
        as: "project",
      },
    },
    {
      $unwind: "$project",
    },
    {
      $project: {
        _id: 1,
        epicName: 1,
        epicData: 1,
        phaseId: 1,
        projectId: "$project._id",
        projectSummary: "$project.projectSummary",
      },
    },
  ]);
  const relatedStories = await Story.find({ epicId: epicId }).sort({
    seqNumber: 1,
  });
  const { epicData, storyToRefector, storyToRefectorSeq } =
    getStoryListAndStoryToRefector(relatedStories, epic, storyId);

  const projectTechDiscussionDocument = await getProjectDocumentContent(
    epic.projectId,
    DOCUMENT_TYPE.PROJECT_TECH_DOC
  );

  const phaseDiscussionDocument = await getPhaseDocumentContent(
    epic.phaseId,
    DOCUMENT_TYPE.PHASE_DISCUSSION_DOC
  );

  const phaseRelatedFunctionalDetails = JSON.parse(
    await getProjectDocumentContent(
      epic.projectId,
      DOCUMENT_TYPE.PHASE_FUN_STRUCT_DETAILED
    )
  );

  const service = new AIService();
  service.initJsonSession(epic.projectSummary);
  const newStories = await service.refactorStory(
    epicData,
    projectTechDiscussionDocument,
    phaseDiscussionDocument,
    phaseRelatedFunctionalDetails,
    storyToRefector
  );
  await updateStoriesUnderEpic(
    newStories,
    relatedStories.slice(storyToRefectorSeq),
    storyToRefectorSeq,
    epicId,
    storyId
  );
}

function getStoryListAndStoryToRefector(relatedStories, epic,storyId) {
  let storyToRefector = {};
  let storyToRefectorSeq = 0;
  const stories = relatedStories.map(function (story) {
    const storyForModel = {
      name: story.storyName,
      description: story.description,
      tasks: story.tasks,
      metadata: {
        story_points: story.storyPoint,
        confidence: story.confidence,
        MoSCoW: story.moscow,
        Remarks: story.remarks,
      },
    };
    if (story._id == storyId) {
      storyToRefector = storyForModel;
      storyToRefectorSeq = story.seqNumber;
    }
    return storyForModel;
  });

  const epicData = {};
  epicData.name = epic.epicName;
  epicData.data = epic.epicData;
  epicData.stories = stories;

  return { epicData, storyToRefector, storyToRefectorSeq };
}

async function updateStoriesUnderEpic(
  newStories,
  storiesToUpdate,
  storyToRefectorSeq,
  epicId,
  storyId
) {
  const newStoriesCount = newStories.length;
  const bulkOpsNew = newStories.map(function (newStory, index) {
    return {
      insertOne: {
        document: {
          storyName: newStory.name,
          epicId: epicId,
          description: newStory.description,
          tasks: newStory.tasks,
          storyPoint: newStory.metadata.story_points,
          confidence: newStory.metadata.confidence,
          moscow: newStory.metadata.MoSCoW,
          remarks: newStory.metadata.Remarks,
          seqNumber: storyToRefectorSeq + index,
        },
      },
    };
  });

  const bulkOpsExisting = storiesToUpdate.map(function (story, index) {
    return {
      updateOne: {
        filter: { _id: story._id },
        update: {
          $set: {
            seqNumber: story.seqNumber + newStoriesCount - 1,
          },
        },
        upsert: true,
      },
    };
  });

  const bulkOps = [...bulkOpsNew, ...bulkOpsExisting];
  const result = await Story.bulkWrite(bulkOps);
  const deleteResult = await Story.findByIdAndDelete(storyId);
}

export { reFectorStory };
