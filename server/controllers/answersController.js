import ProjectQuestion from "../models/ProjectQuestion.js";
import { getProjectDocumentContent } from "../utilities/documentUtil.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";
import answerService from "../helper/answerService.js";

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
		const projectId = req.query.projectId;
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
			
			const doc =	await getProjectDocumentContent(
					projectId,
					DOCUMENT_TYPE.PROJECT_TECH_STRUCT
				);
			console.log(doc);
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
			for(let question of questionsList) {
				const answer = JSON.parse(await service.chat(question.question));
				answersList.push(answer);
			}
			console.log(answersList);
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
