import Document from "../models/Document.js";

/**
 * The function `getProjectDocumentContent` retrieves the content of a project document based on the
 * project ID and document type.
 * @param projectId - The `projectId` parameter is a unique identifier for a project. It is used to
 * specify which project the document belongs to when retrieving the document content.
 * @param docType - The `docType` parameter refers to the type of document you want to retrieve for a
 * specific project.
 * @returns The function `getProjectDocumentContent` returns the content of the project document with
 * the specified `projectId` and `docType`. If a document is found in the database matching the
 * criteria, it returns the content of that document. Otherwise, it returns an empty string.
 */
async function getProjectDocumentContent(projectId, docType) {
	const projDocument = await Document.findOne({ projectId: projectId, docType: docType });
	return projDocument ? projDocument.content : '';
}


/**
 * The function `getPhaseDocumentContent` retrieves the content of a document based on the provided
 * phase ID and document type.
 * @param phaseId - The `phaseId` parameter is used to specify the ID of the phase for which you want
 * to retrieve the document content.
 * @param docType - The `docType` parameter specifies the type of document you are looking for in the
 * database. It helps to filter and retrieve the specific document content based on its type.
 * @returns The content of the project document with the specified phaseId and docType is being
 * returned, or an empty string if no document is found.
 */
async function getPhaseDocumentContent(phaseId, docType) {
	const projDocument = await Document.findOne({ phaseId: phaseId, docType: docType });
	return projDocument ? projDocument.content : '';
}

export { getProjectDocumentContent, getPhaseDocumentContent }