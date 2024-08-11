import {
	getProjectDocumentContent,
	getPhaseDocumentContent,
} from "../utilities/documentUtil.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";
import Story from "../models/Story.js";
import Epic from "../models/Epic.js";
import AIService from "./AIService.js";
import mongoose from "mongoose";
import Phase from "../models/Phase.js";

/**
 * The function `reFectorStory` retrieves information related to an epic, refactors stories, and
 * updates the dependency graph for the epic.
 * @param storyId - The `storyId` parameter represents the ID of the specific story that you want to
 * refactor within the given epic.
 * @param epicId - The `epicId` parameter is used to identify a specific epic within a project
 * management system. It is typically a unique identifier associated with an epic that contains a
 * collection of related stories or tasks that contribute to a larger project goal. In the provided
 * code snippet, the `epicId` is
 */
async function reFectorStory(storyId, epicId) {
	//Get all the list of stories under the epic
	const epicList = await Epic.aggregate([
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
				notes: 1,
				projectId: "$project._id",
				projectSummary: "$project.projectSummary",
			},
		},
	]);

	const epic = epicList[0];

	const phaseRecord = await Phase.findOne({_id: epic.phaseId });


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
		phaseRelatedFunctionalDetails[phaseRecord.seqNumber-1],
		storyToRefector
	);

	await updateStoriesUnderEpic(
		newStories,
		relatedStories.slice(storyToRefectorSeq),
		storyToRefectorSeq,
		epicId,
		storyId
	);

	await updateDependencyGraphOnEpic(service, epic);
}

/**
 * The function `getStoryListAndStoryToRefector` processes related stories, an epic, and a story ID to
 * return an object containing epic data, a specific story for refactoring, and its sequence number.
 * @param relatedStories - The `getStoryListAndStoryToRefector` function takes three parameters:
 * `relatedStories`, `epic`, and `storyId`.
 * @param epic - The `epic` parameter in the `getStoryListAndStoryToRefector` function represents an
 * epic object containing information about an epic in a software development project. It includes
 * properties such as `epicName`, `epicData`, and `notes`. The `epicName` property
 * @param storyId - The `storyId` parameter is used to identify a specific story within the list of
 * related stories. If the `storyId` matches the `_id` of a story in the `relatedStories` array, that
 * particular story will be assigned to the `storyToRefector` object along with its
 * @returns The function `getStoryListAndStoryToRefector` returns an object with three properties:
 * 1. `epicData`: An object containing information about the epic, including the epic name, epic data,
 * notes (parsed from JSON), and an array of related stories.
 * 2. `storyToRefector`: An object representing a specific story that matches the provided `storyId`,
 * with properties such
 */
function getStoryListAndStoryToRefector(relatedStories, epic, storyId) {
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
		if (storyId != null && story._id.toString() == storyId.toString()) {
			storyToRefector = storyForModel;
			storyToRefectorSeq = story.seqNumber;
		}
		return storyForModel;
	});

	const epicData = {};
	epicData.name = epic.epicName;
	epicData.data = epic.epicData;
	epicData.notes = JSON.parse(epic.notes);
	epicData.stories = stories;

	return { epicData, storyToRefector, storyToRefectorSeq };
}

/**
 * The function `updateStoriesUnderEpic` updates stories under a specific epic by inserting new stories
 * and updating existing ones based on provided data.
 * @param newStories - The `newStories` parameter is an array containing new story objects that need to
 * be added or updated under a specific epic. Each story object should have properties like `name`,
 * `description`, `tasks`, `metadata` (containing properties like `story_points`, `confidence`, `MoSCo
 * @param storiesToUpdate - The `storiesToUpdate` parameter in the `updateStoriesUnderEpic` function is
 * an array containing existing stories that need to be updated under a specific epic. Each story in
 * this array represents a story that already exists and needs to be modified with new information.
 * @param storyToRefectorSeq - The `storyToRefectorSeq` parameter in the `updateStoriesUnderEpic`
 * function represents the sequence number that needs to be assigned to the new stories being added
 * under the epic. This sequence number is used to maintain the order of the stories within the epic.
 * Each new story will have a
 * @param epicId - The `epicId` parameter in the `updateStoriesUnderEpic` function represents the
 * unique identifier of the epic under which the stories are being updated or added. It is used to
 * associate the new stories with the specific epic in the database.
 * @param storyId - The `storyId` parameter in the `updateStoriesUnderEpic` function represents the
 * unique identifier of the story that will be deleted after updating the stories under the epic. This
 * ID is used to find and delete the specific story from the database once the bulk write operation for
 * updating and inserting new stories
 * @returns The `updateStoriesUnderEpic` function is an asynchronous function that updates stories
 * under a specific epic in a database. It takes in parameters such as new stories to add, existing
 * stories to update, a sequence number for refactoring, the epic ID, and the story ID to delete.
 */
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
	await Story.bulkWrite(bulkOps);
	await Story.findByIdAndDelete(storyId);
}

/**
 * The function `updateDependencyGraphOnEpic` updates the story dependencies for a given epic based on
 * the updated stories associated with that epic.
 * @param service - The `service` parameter is an object that contains methods related to managing
 * dependencies and performing calculations for the given epic.
 * @param epic - The `epic` parameter is an object representing an epic in your system. It likely
 * contains information about the epic, such as its ID, title, description, and any other relevant data
 * related to the epic.
 */
async function updateDependencyGraphOnEpic(service, epic) {
	const updatedStories = await Story.find({ epicId: epic._id }).sort({
		seqNumber: 1,
	});
	const { epicData } = getStoryListAndStoryToRefector(updatedStories, epic, null);
	const dependencies = await service.calculateDependencies(epicData);
	await Epic.findOneAndUpdate({ _id: epic._id }, { storyDependencies: JSON.stringify(dependencies) });
}

export { reFectorStory }; 