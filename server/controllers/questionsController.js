import ProjectQuestion from "../models/ProjectQuestion.js";
import Project from "../models/Project.js";
import Phase from "../models/Phase.js";
import { QUESTION_TYPE } from "../utilities/constant.js";

/**
 * The function `getProjectLevelQuestions` retrieves project-specific questions based on project ID and
 * question type, checking if the questions have been submitted and handling errors appropriately.
 * @param req - req is the request object containing information about the HTTP request made by the
 * client, such as query parameters, headers, and body data. In this specific function, the query
 * parameters accessed from req are `projectId` and `type`. These parameters are used to retrieve
 * project-related questions based on the project ID
 * @param res - The `res` parameter in the `getProjectLevelQuestions` function is the response object
 * that will be used to send the response back to the client making the request. It is typically an
 * instance of the Express response object that allows you to send HTTP responses with data, status
 * codes, and headers.
 */
async function getProjectLevelQuestions(req, res) {
	try {
		const projectId = req.query.projectId;
		const questionsType = req.query.type;

		if (!projectId || !questionsType) {
			res.status(422).json({
				status: "error",
				message: "Query Parameters are not correct",
			});
		} else {
			const projectRecord = await Project.findOne({ _id: projectId });
			const wrapper = {};
			const isSubmitted = (questionsType == 'Functional' && projectRecord.isFunctionalInputProvided) || (questionsType == 'Technical' && projectRecord.isTechnicalInputProvided);
			if (!isSubmitted) {
				const questionsList = await ProjectQuestion.find({
					projectId: projectId,
					type: questionsType,
				})
					.select("_id question seqNumber answer type answerGivenBy")
					.sort({ seqNumber: 1 });
				wrapper.questionsList = questionsList;
			} else {
				wrapper.questionsList = [];
			}

			wrapper.isSubmitted = isSubmitted;
			res.json(wrapper);
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `getPhaseLevelQuestions` retrieves questions based on a phase ID, checking if the phase
 * is submitted or not, and handles errors accordingly.
 * @param req - The `req` parameter in the `getPhaseLevelQuestions` function stands for the request
 * object, which contains information about the HTTP request made to the server. This object typically
 * includes details such as the request method, request headers, request parameters, query parameters,
 * and more. In this specific function,
 * @param res - The `res` parameter in the `getPhaseLevelQuestions` function is the response object
 * that will be used to send a response back to the client making the request. It is typically an
 * instance of the Express response object that allows you to send HTTP responses with data, status
 * codes, and headers.
 */
async function getPhaseLevelQuestions(req, res) {
	try {
		const phaseId = req.query.phaseId;
		if (!phaseId) {
			res.status(422).json({
				status: "error",
				message: "Query Parameters are not correct",
			});
		} else {
			const phaseRecord = await Phase.findOne({ _id: phaseId });
			const wrapper = {};
			const isSubmitted = phaseRecord.status === 'Input Provided';

			if (!isSubmitted) {
				const questionsList = await ProjectQuestion.find({
					phaseId: phaseId,
				})
					.select("_id question seqNumber answer type answerGivenBy subtype")
					.sort({ seqNumber: 1 });
				wrapper.questionsList = questionsList;
			} else {
				wrapper.questionsList = [];
			}
			wrapper.isSubmitted = isSubmitted;
			res.json(wrapper);
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `updateAnswers` asynchronously saves answers in a database and sends a success message
 * or an error message based on the outcome.
 * @param req - The `req` parameter typically represents the HTTP request that is being made to the
 * server. It contains information such as the request headers, body, parameters, and user
 * authentication details. In the context of your `updateAnswers` function, `req` is likely an object
 * that contains the questions to be
 * @param res - The `res` parameter in the `updateAnswers` function is the response object that will be
 * used to send a response back to the client making the request. It is typically an instance of the
 * Express response object in Node.js applications. The response object allows you to send HTTP
 * responses with data such as
 */
async function updateAnswers(req, res) {
	try {
		const questions = req.body;
		await saveAnswersInDataBase(questions, req.user._id);
		res.status(200).json({
			status: "success",
			message: "Updated answers successfully",
		});
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

/**
 * The function `submitQuestions` handles the submission of questions and saves answers in a database,
 * updating project and phase statuses accordingly.
 * @param req - The `req` parameter in the `submitQuestions` function typically represents the HTTP
 * request object, which contains information about the incoming request from the client, such as the
 * request headers, parameters, body, and more. In this context, it seems like `req` is being used to
 * access the request
 * @param res - The `res` parameter in the `submitQuestions` function is the response object that will
 * be used to send the response back to the client making the request. It is typically used to set the
 * status code, headers, and send data back to the client in the form of JSON or other formats.
 */
async function submitQuestions(req, res) {
	try {
		const sumbmitDetails = req.body;
		const questions = sumbmitDetails.questions;
		await saveAnswersInDataBase(questions, req.user._id);
		if (
			sumbmitDetails.parentId &&
			(sumbmitDetails.type == QUESTION_TYPE.FUNCTIONAL ||
				sumbmitDetails.type == QUESTION_TYPE.TECHNICAL)
		) {
			const projectId = sumbmitDetails.parentId;
			const projectDetails = await Project.findOne({ _id: projectId });
			let setObj = {};
			if (sumbmitDetails.type == QUESTION_TYPE.FUNCTIONAL) {
				setObj.isFunctionalInputProvided = true;
				if (projectDetails.isTechnicalInputProvided) {
					setObj.status = "Input Provided";
				}
			} else if (sumbmitDetails.type == QUESTION_TYPE.TECHNICAL) {
				setObj.isTechnicalInputProvided = true;
				if (projectDetails.isFunctionalInputProvided) {
					setObj.status = "Input Provided";
				}
			}
			await Project.findOneAndUpdate({ _id: projectId }, setObj, { new: true });
		} else if (
			sumbmitDetails.parentId &&
			sumbmitDetails.type == QUESTION_TYPE.PHASE_LEVEL
		) {
			const phaseId = sumbmitDetails.parentId;
			await Phase.findOneAndUpdate(
				{ _id: phaseId },
				{ status: "Input Provided" },
				{ new: true }
			);
		}
		res.status(200).json({
			status: "success",
			message: "Updated answers successfully",
		});
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error sddsf " + err.message,
		});
	}
}

/**
 * The function `saveAnswersInDataBase` saves answers to questions in a database for a specific user.
 * @param questions - An array of objects containing question details, such as question id and answer
 * provided by the user.
 * @param userId - The `userId` parameter is the unique identifier of the user who is providing answers
 * to the questions.
 */
async function saveAnswersInDataBase(questions, userId) {
	let bulkOps = questions.map((question) => {
		return {
			updateOne: {
				filter: { _id: question.id },
				update: {
					answer: question.answer,
					answerGivenBy: userId,
				},
				upsert: false,
			},
		};
	});
	await ProjectQuestion.bulkWrite(bulkOps);
}

export {
	getProjectLevelQuestions,
	getPhaseLevelQuestions,
	updateAnswers,
	submitQuestions,
};
