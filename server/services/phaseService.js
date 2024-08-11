import AIService from "./AIService.js";
import { getPhaseChat } from "./projectQuestionService.js";
import Project from "../models/Project.js";
import Document from "../models/Document.js";
import { getProjectDocumentContent } from "../utilities/documentUtil.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";
import Epic from "../models/Epic.js";
import Story from "../models/Story.js";
import Phase from "../models/Phase.js";
import mongoose from "mongoose";



/**
 * The function `createPhaseStructure` processes various project and phase-related data to create and
 * refine phase structures, discussions, epics, stories, and documents.
 * @param phaseId - The `phaseId` parameter in the `createPhaseStructure` function represents the
 * unique identifier of the phase for which you are creating the phase structure. It is used to
 * identify and update the specific phase in the database.
 * @param projectId - projectId is the unique identifier of the project for which the phase structure
 * is being created. It is used to retrieve project-related information and documents needed for
 * creating the phase structure.
 * @param phaseSeqNum - The `phaseSeqNum` parameter in the `createPhaseStructure` function represents
 * the sequence number of the phase within the project. It is used to identify the specific phase
 * within the project's phases. For example, if a project has multiple phases like Phase 1, Phase 2,
 * Phase
 * @returns The `createPhaseStructure` function does not explicitly return anything as it is an
 * asynchronous function that performs various operations like creating phase discussion documents,
 * refining phase details, refining epics, creating stories under the phase, inserting documents in the
 * backend, and updating the phase status to "In Progress". The function performs these tasks based on
 * the input parameters `phaseId`, `projectId`, and `phaseSeqNum
 */
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
		phaseRelatedFunctionalDetails[phaseSeqNum-1],
		projectTechDiscussionDocument,
		phaseDiscussionDoc
	);

	//Get the final list of stories
	const refinedStoryList = await Promise.all(refinedEpic.epics.map(async function (epic) {
		return await service.storyJsonify(epic);
	})
	);

	const refiledStoryWithMetaDataList = await Promise.all(refinedStoryList.map(async function (epic) {
		return await service.initStoryMetadata(epic, projectTechDiscussionDocument, phaseDiscussionDoc, phaseRelatedFunctionalDetails[phaseSeqNum-1]);
	})
	);


	await createEpicStoryUnderPhase(service, phaseId, refiledStoryWithMetaDataList);

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



/**
 * The function `getPhaseRefinementHistory` retrieves phase refinement history data based on project
 * ID, phase sequence number, and project technical structure.
 * @param service - The `service` parameter in the `getPhaseRefinementHistory` function is likely a
 * service object or class instance that contains methods for preparing phase refinement history data.
 * It is used to call the `preparePhaseRefinementHistory` method to process and return the phase
 * refinement history based on the provided parameters
 * @param projectId - The `projectId` parameter is the unique identifier of the project for which you
 * want to retrieve the phase refinement history. It is used to query the database and fetch relevant
 * information about the project phases and associated documents.
 * @param phaseSeqNum - The `phaseSeqNum` parameter represents the sequence number of the phase for
 * which you want to retrieve refinement history. The function retrieves historical data related to
 * phases that occurred before the specified phase sequence number in a project.
 * @param projectTechStructure - The `projectTechStructure` parameter seems to represent the technical
 * structure of a project. It is used in the `getPhaseRefinementHistory` function to retrieve phase
 * refinement history based on the provided parameters.
 * @returns The function `getPhaseRefinementHistory` returns the result of calling
 * `service.preparePhaseRefinementHistory` with the `phases`, `phaseDiscussionDocuments`, and
 * `phaseStructureTexts` as arguments.
 */
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
									{ $lt: ["$seqNumber", phaseSeqNum.toString()] }, // replace specificNumber with the number you want
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

	const phaseDiscussionDocuments = [];
	const phaseStructureTexts = [];
	const phases = [];

	for (let i = 0; i < phaseSeqNum-1; i++) {
		phases.push(projectTechStructure[phaseSeqNum-1]);
		for (let doc of phaseList[0].phases[i].documents) {
			if (doc.docType === DOCUMENT_TYPE.PHASE_DISCUSSION_DOC) {
				phaseDiscussionDocuments.push(doc.content);
			} else if (doc.docType === DOCUMENT_TYPE.PHASE_STRUCT_TEXT) {
				phaseStructureTexts.push(doc.content);
			}
		}
	}

	return await service.preparePhaseRefinementHistory(
		phases,
		phaseDiscussionDocuments,
		phaseStructureTexts
	);
}


/**
 * The function `createEpicStoryUnderPhase` creates epic stories under a specific phase by inserting
 * epics and their associated stories into the database.
 * @param service - The `service` parameter in the `createEpicStoryUnderPhase` function is typically an
 * object that contains various methods or functions related to handling business logic or data
 * operations. It is used to interact with external services, databases, or perform calculations
 * required for creating epic stories under a specific phase.
 * @param phaseId - The `phaseId` parameter in the `createEpicStoryUnderPhase` function represents the
 * identifier of the phase under which the epic stories will be created. It is used to associate the
 * newly created epics and stories with a specific phase in the system.
 * @param refiledStoryWithMetaDataList - The `refiledStoryWithMetaDataList` parameter is an array
 * containing objects that represent epics. Each epic object contains the following properties:
 * @returns The `createEpicStoryUnderPhase` function is returning a Promise. This function first
 * creates a list of epics based on the `refiledStoryWithMetaDataList`, calculates dependencies for
 * each epic, inserts the epics into the database, and then creates a list of stories for each epic and
 * inserts them into the database as well. The function uses asynchronous operations with `await` and
 * `Promise
 */

async function createEpicStoryUnderPhase(service, phaseId, refiledStoryWithMetaDataList) {
	let storyList = [];

	//Create epic list to insert
	const epicList = await Promise.all(
		refiledStoryWithMetaDataList.map(async function (epic, index) {
			const dependencies = await service.calculateDependencies(epic);
			return {
				epicName: epic.name,
				phaseId: phaseId,
				seqNumber: index + 1,
				epicData: epic.data,
				storyDependencies: JSON.stringify(dependencies),
				notes: JSON.stringify(epic.notes)
			};
		}
		));

	const insertedEpics = await Epic.insertMany(epicList);

	//Create story list to insert
	for (let epicIndex = 0; epicIndex < insertedEpics.length; epicIndex++) {
		const epic = refiledStoryWithMetaDataList[epicIndex];
		const tempStoryList = epic.stories.map(function (story, index) {
			return {
				storyName: story.name,
				epicId: insertedEpics[epicIndex]._id,
				description: story.description,
				tasks: story.tasks,
				storyPoint: story.metadata.story_points,
				confidence: story.metadata.confidence,
				moscow: story.metadata.MoSCoW,
				remarks: story.metadata.Remarks,
				seqNumber: index + 1
			};
		});
		storyList = [...storyList, ...tempStoryList];
	}

	await Story.insertMany(storyList);
}

export { createPhaseStructure };
