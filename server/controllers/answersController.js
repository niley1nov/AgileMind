import ProjectQuestion from "../models/ProjectQuestion.js";
import { getProjectDocumentContent } from "../utilities/documentUtil.js";
import { DOCUMENT_TYPE,QUESTION_TYPE } from "../utilities/constant.js";
import answerService from "../helper/answerService.js";
import Phase from "../models/Phase.js";
import ProjectFile from "../models/ProjectFile.js";
import techService from "../helper/techService.js";
import businessService from "../helper/businessService.js";

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
			const srsFile = await ProjectFile.findOne({projectId: projectId});
			const srs = srsFile.data.toString('utf-8');
			const questionsList = await ProjectQuestion.find({
				projectId: projectId,
				type: questionsType,
			})
				.select("_id question seqNumber answer type answerGivenBy")
				.sort({ seqNumber: 1 });
			const service = questionsType == QUESTION_TYPE.FUNCTIONAL ? new businessService(srs) : new techService(srs);
			const answerList = await Promise.all(questionsList.map(async function(q){
				const answer = await service.chat(q.question);
				return answer;
			}));
			res.json(answerList);
		}
	} catch (err) {
		console.log('>>> '+err.message);
		res.status(500).json({
			status: "error",
			message: "Internal Server Error " + err.message,
		});
	}
}

async function getPhaseLevelAnswers(req, res) {
	try {
		const phaseId = req.query.phaseId;
		const phaseRecord = await Phase.findOne({ _id: phaseId });
		const projectId = phaseRecord.projectId;

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
			const service = new answerService(
				projectFunStructureDetailed,
				projectTechStructure
			);
			const answersList = [];
			for (let question of questionsList) {
				const answer = await service.chat(question.question);
				answersList.push(answer);
			}
			res.json(answersList);
		}
	} catch (err) {
		console.log(err);
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
