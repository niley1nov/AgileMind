import ProjectQuestion from "../models/ProjectQuestion.js";
import Phase from "../models/Phase.js";

/**
 * The function `getFunctionalChat` retrieves a list of functional questions and answers for a specific
 * project.
 * @param projectId - projectId is the unique identifier of the project for which you want to retrieve
 * functional chat data. This function retrieves a list of functional questions and their corresponding
 * answers from the database for the specified project.
 * @returns An array of objects containing the question and answer properties from the ProjectQuestion
 * documents that match the given projectId and have a type of 'Functional'.
 */
async function getFunctionalChat(projectId) {
	const questionList = await ProjectQuestion.find({ projectId: projectId, type: 'Functional' });
	return questionList.map(function (pq) {
		return { question: pq.question, answer: pq.answer };
	})
}

/**
 * The function `getTechnicalChat` retrieves technical questions and answers for a specific project.
 * @param projectId - projectId is the unique identifier of the project for which you want to retrieve
 * technical chat questions and answers. The function `getTechnicalChat` uses this projectId to find
 * all technical questions related to that specific project.
 * @returns An array of objects containing the questions and answers from the technical questions
 * related to the specified project ID.
 */
async function getTechnicalChat(projectId) {
	const questionList = await ProjectQuestion.find({ projectId: projectId, type: 'Technical' });
	return questionList.map(function (pq) {
		return { question: pq.question, answer: pq.answer };
	})
}


/**
 * The function `getPhaseChat` retrieves questions and answers related to a specific phase from a
 * database.
 * @param phaseId - Thank you for providing the code snippet. Could you please clarify what the
 * `phaseId` represents or provide an example value for it?
 * @returns An array of objects containing the question and answer properties from the ProjectQuestion
 * documents that match the provided phaseId and have a type of 'Phase'.
 */
async function getPhaseChat(phaseId) {
	const questionList = await ProjectQuestion.find({ phaseId: phaseId, type: 'Phase' });
	return questionList.map(function (pq) {
		return { question: pq.question, answer: pq.answer };
	})
}

/**
 * The function `createPhaseLevelQuestions` creates project questions for each phase and updates the
 * status of the phases to 'Waiting for Input'.
 * @param phaseList - The `phaseList` parameter is an array containing objects representing different
 * phases in a project. Each object in the array contains information about a specific phase, such as
 * its `_id` (phase ID) and other properties.
 * @param phaseLevelQuestionList - The `phaseLevelQuestionList` parameter is an array of arrays where
 * each inner array contains questions for a specific phase level. Each inner array corresponds to a
 * phase and contains objects with question details like question text and roles associated with the
 * question.
 * @returns The function `createPhaseLevelQuestions` is returning a Promise because it is an async
 * function. The Promise will resolve with the result of the function once all asynchronous operations
 * inside the function have completed.
 */
async function createPhaseLevelQuestions(phaseList, phaseLevelQuestionList) {
	if (phaseList.length != phaseLevelQuestionList.length) {
		throw "Some error occur due to Phase size is not equal to question list";
	}

	let allPhaseQuestions = [];
	let phaseIds = [];
	for (let i = 0; i < phaseList.length; i++) {
		const phase = phaseList[i];
		const questionList = phaseLevelQuestionList[i].map(function (q, index) {
			return new ProjectQuestion({
				seqNumber: index + 1,
				question: q.question,
				phaseId: phase._id,
				type: "Phase",
				subtype: q.roles.join(',')
			});
		});
		allPhaseQuestions = [...allPhaseQuestions, ...questionList];
		phaseIds.push(phase._id);

	}

	await ProjectQuestion.insertMany(allPhaseQuestions);
	await Phase.updateMany(
		{ _id: { $in: phaseIds } },
		{ $set: { status: 'Waiting for Input' } }
	);
}


export { getFunctionalChat, getTechnicalChat, getPhaseChat, createPhaseLevelQuestions };