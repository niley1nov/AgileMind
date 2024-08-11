import AIService from "./AIService.js";
import {
	getFunctionalChat,
	getTechnicalChat,
	createPhaseLevelQuestions,
} from "./projectQuestionService.js";
import Project from "../models/Project.js";
import ProjectQuestion from "../models/ProjectQuestion.js";
import ProjectFile from "../models/ProjectFile.js";
import Document from "../models/Document.js";
import Phase from "../models/Phase.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";

/**
 * This function updates the project summary and project questions for a given project based on the
 * provided SRS text.
 * @param projectId - The `projectId` parameter is the unique identifier of the project for which you
 * want to update the project summary and project questions. It is used to identify the specific
 * project in the database and make the necessary updates based on the provided information.
 * @param srsText - The `srsText` parameter in the `updateProjectSummaryAndProjectQuestions` function
 * represents the software requirements specification text that will be used to generate the project
 * summary and project questions for a specific project identified by the `projectId`. This text
 * contains detailed information about the requirements and specifications of the software project
 * @returns The `updateProjectSummaryAndProjectQuestions` function is an asynchronous function that
 * updates the project summary and project questions based on the provided `projectId` and `srsText`.
 * Here is a summary of what is being returned:
 */
async function updateProjectSummaryAndProjectQuestions(projectId, srsText) {
	const service = new AIService();
	const projectSummary = await service.getProjectSummary(srsText);
	service.initJsonSession(projectSummary);
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

/**
 * The function `createProjectDocuments` generates various project documents based on project data and
 * saves them in the database.
 * @param projectId - The `projectId` parameter is used to identify the specific project for which the
 * documents are being created. It serves as a unique identifier for the project within the system.
 * @param projSummary - The `projSummary` parameter in the `createProjectDocuments` function likely
 * contains a summary or key information about the project. This information is used to initialize an
 * `AIService` object and is passed to various methods within the function for document generation and
 * processing related to the project.
 */
async function createProjectDocuments(projectId, projSummary) {
	const functionalChat = await getFunctionalChat(projectId);
	const technicalChat = await getTechnicalChat(projectId);
	const projectFile = await ProjectFile.findOne({ projectId: projectId });
	const projectSRS = projectFile.data.toString("utf-8");
	const service = new AIService(projSummary);
	service.initJsonSession(projSummary);
	//Getting project discussion document Functional and Technical both
	const projectDocument = await service.documentProjectDiscussion(
		projectSRS,
		JSON.stringify(functionalChat),
		JSON.stringify(technicalChat)
	);

	//Get Functional Structure and Functional Structure Details
	const { projectFunStructure, projectFunStructureDetailed } =
		await service.generateFunctionalStructure(
			projectSRS,
			projectDocument.projectFunDiscussionDocument
		);

	//Get Technical Structure Details
	const projectTechnicalStructure = await service.generateTechnicalStructure(
		projectSRS,
		projectDocument.projectFunDiscussionDocument,
		projectFunStructureDetailed
	);

	const phaseRelatedFunctionalDetails = await service.filterPhaseInformation(
		projectFunStructureDetailed,
		projectTechnicalStructure
	);

	//Create list for all documents given by Gemini AI
	const documentList = [
		{
			content: JSON.stringify(functionalChat),
			docType: DOCUMENT_TYPE.PROJECT_FUN_CHAT,
			projectId: projectId,
		},
		{
			content: JSON.stringify(technicalChat),
			docType: DOCUMENT_TYPE.PROJECT_TECH_CHAT,
			projectId: projectId,
		},
		{
			content: projectDocument.projectFunDiscussionDocument,
			docType: DOCUMENT_TYPE.PROJECT_FUN_DOC,
			projectId: projectId,
		},
		{
			content: projectDocument.projectTechDiscussionDocument,
			docType: DOCUMENT_TYPE.PROJECT_TECH_DOC,
			projectId: projectId,
		},
		{
			content: JSON.stringify(projectFunStructure),
			docType: DOCUMENT_TYPE.PROJECT_FUN_STRUCT,
			projectId: projectId,
		},
		{
			content: JSON.stringify(projectFunStructureDetailed),
			docType: DOCUMENT_TYPE.PROJECT_FUN_STRUCT_DETAILED,
			projectId: projectId,
		},
		{
			content: JSON.stringify(projectTechnicalStructure),
			docType: DOCUMENT_TYPE.PROJECT_TECH_STRUCT,
			projectId: projectId,
		},
		{
			content: JSON.stringify(phaseRelatedFunctionalDetails),
			docType: DOCUMENT_TYPE.PHASE_FUN_STRUCT_DETAILED,
			projectId: projectId,
		},
	];

	//Save all document in the database
	await Document.insertMany(documentList);
	const insertedPhaseList = await createPhaseRecords(
		projectId,
		projectTechnicalStructure
	);
	const phaseLevelQuestionList = await service.getPhaseLevelQuestions(
		projectFunStructureDetailed,
		projectTechnicalStructure
	);
	await createPhaseLevelQuestions(insertedPhaseList, phaseLevelQuestionList);
}


/**
 * The function `createPhaseRecords` creates phase records for a project and updates the project status
 * to "In Progress".
 * @param projectId - The `projectId` parameter is the unique identifier of the project for which you
 * want to create phase records.
 * @param technicalStructure - The `technicalStructure` parameter is an array of objects that contains
 * information about different phases of a project. Each object in the array has a `phase` property
 * that represents the name of the phase.
 * @returns The function `createPhaseRecords` returns the list of inserted phase records after
 * inserting them into the database.
 */
async function createPhaseRecords(projectId, technicalStructure) {
	const phaseList = technicalStructure.map(function (record, index) {
		return {
			phaseName: record.phase,
			projectId: projectId,
			seqNumber: index + 1,
		};
	});
	const insertedPhaseList = await Phase.insertMany(phaseList);
	await Project.findOneAndUpdate(
		{ _id: projectId },
		{ status: "In Progress" },
		{ new: true }
	);
	return insertedPhaseList;
}

export { updateProjectSummaryAndProjectQuestions, createProjectDocuments };
