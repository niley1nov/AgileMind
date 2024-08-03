import AIService from "./AIService.js";
import {
  getFunctionalChat,
  getTechnicalChat,
} from "./projectQuestionService.js";
import Project from "../models/Project.js";
import ProjectQuestion from "../models/ProjectQuestion.js";
import ProjectFile from "../models/ProjectFile.js";
import Document from "../models/Document.js";
import Phase from "../models/Phase.js";
import { DOCUMENT_TYPE } from "../utilities/constant.js";

async function updateProjectSummaryAndProjectQuestions(projectId, srsText) {
  const service = new AIService();
  const projectSummary = await service.getProjectSummary(srsText);
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

async function createProjectDocuments(projectId, projSummary) {
  const functionalChat = await getFunctionalChat(projectId);
  const technicalChat = await getTechnicalChat(projectId);
  const projectFile = await ProjectFile.findOne({ projectId: projectId });
  const projectSRS = projectFile.data.toString("utf-8");
  const service = new AIService(projSummary);
  const projectDocument = await service.documentProjectDiscussion(
    projectSRS,
    JSON.stringify(functionalChat),
    JSON.stringify(technicalChat)
  );
  console.log('>>> projectDoc '+JSON.stringify(projectDocument));
  const {projectFunStructure,projectFunStructureDetailed} = await service.generateFunctionalStructure(
    projectSRS,
    projectDocument.projectFunDiscussionDocument
  );
  const projectTechnicalStructure = await service.generateTechnicalStructure(
    projectSRS,
    projectDocument.projectFunDiscussionDocument,
    projectFunStructureDetailed
  );
  const documentList = [
    {
      content: JSON.stringify(functionalChat),
      docType: DOCUMENT_TYPE.PROJECT_FUN_CHAT,
      projectId: projectId
    },
    {
      content: JSON.stringify(technicalChat),
      docType: DOCUMENT_TYPE.PROJECT_TECH_CHAT,
      projectId: projectId
    },
    {
      content: projectDocument.projectFunDiscussionDocument,
      docType: DOCUMENT_TYPE.PROJECT_FUN_DOC,
      projectId: projectId
    },
    {
      content: projectDocument.projectTechDiscussionDocument,
      docType: DOCUMENT_TYPE.PROJECT_TECH_DOC,
      projectId: projectId
    },
    {
      content: JSON.stringify(projectFunStructure),
      docType: DOCUMENT_TYPE.PROJECT_FUN_STRUCT,
      projectId: projectId
    },
    {
      content: JSON.stringify(projectFunStructureDetailed),
      docType: DOCUMENT_TYPE.PROJECT_FUN_STRUCT_DETAILED,
      projectId: projectId
    },
    {
      content: JSON.stringify(projectTechnicalStructure),
      docType: DOCUMENT_TYPE.PROJECT_TECH_STRUCT,
      projectId: projectId
    }
  ];
  await Document.insertMany(documentList);
  console.log('>>>>Document Inserted');
  await createPhaseRecords(projectId, projectTechnicalStructure);
  console.log('>>>>Phase Inserted');
}


async function createPhaseRecords(projectId, technicalStructure){
  const phaseList = technicalStructure.map(function(record){
    return {phaseName: record.phase, projectId: projectId};
  });
  await Phase.insertMany(phaseList);
  await Project.findOneAndUpdate({ _id: projectId }, {status: "In Progress"}, { new: true });
}

export { updateProjectSummaryAndProjectQuestions, createProjectDocuments };
