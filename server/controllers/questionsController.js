import ProjectQuestion from "../models/ProjectQuestion.js";
import Project from "../models/Project.js";

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

async function updateAnswers(req, res) {
  try {
    const questions = req.body;
    await saveAnswersInDataBase(questions,req.user._id);
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
    await saveAnswersInDataBase(questions,req.user._id);
    if(sumbmitDetails.parentId){
      if(sumbmitDetails.type == 'Functional'){
        let setObj= { $set: { isFunctionalInputProvided: true } };
        await Project.updateOne({ _id: sumbmitDetails.parentId }, setObj);
      }else if(sumbmitDetails.type == 'Technical'){
        let setObj= { $set: { isTechnicalInputProvided: true } };
        await Project.updateOne({ _id: sumbmitDetails.parentId }, setObj);
      }
    }
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

async function saveAnswersInDataBase(questions, userId){
  let bulkOps = questions.map(question => {
    return {
      updateOne: {
        filter: { _id: question.id },
        update: {
          answer: question.answer,
          answerGivenBy: userId,
        },
        upsert: false 
      }
    };
  });
  await ProjectQuestion.bulkWrite(bulkOps);
}

export { getProjectLevelQuestions, updateAnswers, submitQuestions };
