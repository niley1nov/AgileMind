import ProjectQuestion from "../models/ProjectQuestion.js";


async function getFunctionalChat(projectId){
    const questionList = await ProjectQuestion.find({projectId: projectId,type: 'Functional'});
    return questionList.map(function(pq){
        return {question: pq.question, answer: pq.answer};
    })
}

async function getTechnicalChat(projectId){
    const questionList = await ProjectQuestion.find({projectId: projectId,type: 'Technical'});
    return questionList.map(function(pq){
        return {question: pq.question, answer: pq.answer};
    })
}


export {getFunctionalChat, getTechnicalChat};