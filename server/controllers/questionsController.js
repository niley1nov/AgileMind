import ProjectQuestion from "../models/ProjectQuestion.js";
import Project from "../models/Project.js";
import Phase from "../models/Phase.js";
import { QUESTION_TYPE } from "../utilities/constant.js";

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
			const projectRecord = await Project.findOne({_id: projectId});
			const wrapper = {};
			const isSubmitted = (questionsType == 'Functional' && projectRecord.isFunctionalInputProvided) || (questionsType == 'Technical' && projectRecord.isTechnicalInputProvided);
			if(!isSubmitted){
				const questionsList = await ProjectQuestion.find({
					projectId: projectId,
					type: questionsType,
				})
					.select("_id question seqNumber answer type answerGivenBy")
					.sort({ seqNumber: 1 });
				wrapper.questionsList = questionsList;
			}else{
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

async function getPhaseLevelQuestions(req, res) {
	try {
		const phaseId = req.query.phaseId;		
		if (!phaseId) {
			res.status(422).json({
				status: "error",
				message: "Query Parameters are not correct",
			});
		} else {
			const phaseRecord = await Phase.findOne({_id: phaseId});
			const wrapper = {};
			const isSubmitted = phaseRecord.status === 'Input Provided';

			if(!isSubmitted){
				const questionsList = await ProjectQuestion.find({
					phaseId: phaseId,
				})
					.select("_id question seqNumber answer type answerGivenBy subtype")
					.sort({ seqNumber: 1 });
					wrapper.questionsList = questionsList;
			}else{
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
