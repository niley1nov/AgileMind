import ProjectQuestion from "../models/ProjectQuestion.js";
import Project from "../models/Project.js";
import Phase from "../models/Phase.js";
import { QUESTION_TYPE } from "../utilities/constant.js";

async function getProjectLevelAnswers(req, res) {
	try {
		const projectId = req.query.projectId;
		const questionsType = req.query.type;

		if (!projectId || !questionsType) {
			res.status(422).json({
				status: "error",
				message: "Query Parameters are not correct",
			});
		} else {
			const questionsList = await ProjectQuestion.find({
				projectId: projectId,
				type: questionsType,
			})
				.select("_id question seqNumber answer type answerGivenBy")
				.sort({ seqNumber: 1 });
			res.json(questionsList);
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

async function getPhaseLevelAnswers(req, res) {
	try {
		const phaseId = req.query.phaseId;

		if (!phaseId) {
			res.status(422).json({
				status: "error",
				message: "Query Parameters are not correct",
			});
		} else {
			const questionsList = await ProjectQuestion.find({
				phaseId: phaseId,
			})
				.select("_id question seqNumber answer type answerGivenBy")
				.sort({ seqNumber: 1 });
			res.json(questionsList);
		}
	} catch (err) {
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

export {
	getProjectLevelAnswers,
	getPhaseLevelAnswers
};
