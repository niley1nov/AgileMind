import ProjectQuestion from "../models/ProjectQuestion.js";
import Phase from "../models/Phase.js";



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

async function createPhaseLevelQuestions(phaseList, phaseLevelQuestionList){
    if(phaseList.length != phaseLevelQuestionList.length){
        throw "Some error occur due to Phase size is not equal to question list";
    }

    let allPhaseQuestions = [];
    let phaseIds = [];
    for(let i=0;i<phaseList.length; i++){
        const phase = phaseList[i];
        const questionList = phaseLevelQuestionList[i].map(function(q,index){
            return new ProjectQuestion({
                seqNumber: index + 1,
                question: q.question,
                phaseId: phase._id,
                type: "Phase Level Question",
                subtype: q.roles.join(',')
              });
        });
        allPhaseQuestions = [...allPhaseQuestions, ...questionList];
        phaseIds.push(phase._id);
       
    }

    await ProjectQuestion.insertMany(allPhaseQuestions);
    await Phase.updateMany(
        { _id: { $in: phaseIds } },
        { $set: { status: 'Waiting for Input' } }
    );
}


export {getFunctionalChat, getTechnicalChat, createPhaseLevelQuestions};