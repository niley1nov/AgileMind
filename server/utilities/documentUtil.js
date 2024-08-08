import Document from "../models/Document.js";


async function getProjectDocumentContent(projectId, docType) {
	const projDocument = await Document.findOne({ projectId: projectId, docType: docType });
	return projDocument ? projDocument.content : '';
}


async function getPhaseDocumentContent(phaseId, docType) {
	const projDocument = await Document.findOne({ phaseId: phaseId, docType: docType });
	return projDocument ? projDocument.content : '';
}


export { getProjectDocumentContent, getPhaseDocumentContent }