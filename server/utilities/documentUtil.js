import Document from "../models/Document.js";


async function getProjectDocumentContent(projectId, docType){
    const projDocument = await Document.findOne({projectId: projectId, docType: docType}); 
    return projDocument ? projDocument.content : '';
}


export {getProjectDocumentContent}