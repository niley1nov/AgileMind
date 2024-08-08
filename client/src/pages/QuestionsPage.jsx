import { useParams, useNavigate, Link } from "react-router-dom";
import TextAreaInput from "../components/TextAreaInput";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import { QUESTION_FUNCTIONAL, QUESTION_TECHNICAL,QUESTION_PHASE } from "../services/contstant";

export default function QuestionsPage() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const { id, type } = useParams();
  const [questionList, setQuestionList] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const navigate = useNavigate();



  useEffect(function () {
    getQuestionList();
  }, []);

  async function getQuestionList() {
    try {
      setShowSpinner(true);
      let response = {};
      if(type == QUESTION_FUNCTIONAL || type == QUESTION_TECHNICAL){
        response = await apiClientForAuthReq.get(
          "/questions/getProjectLevelQuestions",
          {
            params: { projectId: id, type: type },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }else{
        response = await apiClientForAuthReq.get(
          "/questions/getPhaseLevelQuestions",
          {
            params: { phaseId: id },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      if (response.status == "200") {
        setQuestionList(response.data);
      }
    } catch (error) {
      setPopupMessage(error.message);
      setTimeout(function () {
        setPopupMessage("");
      }, 2000);
      navigate('/login');
    } finally {
      setShowSpinner(false);
    }
  }

  async function onFormSubmit(data) {
    try{
        setShowSpinner(true);
        const mappedData = getMappedQuestionAnswer(data);
        const payload = {};
        payload.parentId = id;
        payload.type = type;
        payload.questions = mappedData;
        const response = await apiClientForAuthReq.post("/questions/submitQuestions", payload, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if(response.status =="200"){
            const linkToNavigate = type == QUESTION_PHASE ? '/Phase/' : '/Project/';
            navigate(linkToNavigate+id);
        }
    }catch(e){
        setPopupMessage(e.message);
        setTimeout(function(){setPopupMessage("")},2000);
      }finally{
        setShowSpinner(false);
      }
  }

  function onSubmitButtonClick(){
    const form = document.getElementById('questionsForm');
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }

  async function onSaveButtonClick(){
    try{
        setShowSpinner(true);
        const formValues = getValues();
        const mappedData = getMappedQuestionAnswer(formValues);
        const response = await apiClientForAuthReq.post("/questions/updateQuestionAnswers", mappedData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if(response.status =="200"){
          const linkToNavigate = type == QUESTION_PHASE ? '/Phase/' : '/Project/';
            navigate(linkToNavigate+id);
        }
    }catch(e){
        setPopupMessage(e.message);
        setTimeout(function(){setPopupMessage("")},2000);
      }finally{
        setShowSpinner(false);
      }
  }

  function getMappedQuestionAnswer(data){
    return questionList.map(function(question,index){
        let result = {};
        result.id = question._id;
        result.answer = data[`question${index}`];
        return result;
    });
  }

  function onAnswerChanges(id, value){
    setQuestionList(questionList.map(function(q){
        return (q._id == id ? ({...q, answer: value}): q);
    }));
  }

  return (
    <div className="min-h-screen flex flex-col px-20 text-white">
        <Spinner showSpinner={showSpinner} />
        <PopupMessage message={popupMessage}></PopupMessage>
        <div className="w-full py-2 fixed right-0 top-0 bg-neutral-900 border-b border-gray-600">
            <center>
                <h1 className="text-2xl font-bold">{type} Questions</h1>
            </center>
        </div>
        <div className="flex-grow p-4 space-y-4 my-20">
            <form onSubmit={handleSubmit(onFormSubmit)} id="questionsForm">
                <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                  {questionList.map(function (q, index) {
                    return (
                      <TextAreaInput
                        key={q._id}
                        labelToShow={`Q${q.seqNumber}. `+q.question}
                        value={q.answer}
                        elementName={`question${index}`}
                        register={register(`question${index}`, { required: "Required field" })}
                        errorToShow={errors[`question${index}`]?.message} 
                        onInputChange={e=>onAnswerChanges(q._id, e.target.value)}
                        supportingText={q.subtype}
                      />
                    );
                  })}
                </div>
                <input type="submit" style={{ display: 'none' }} />
            </form>
        </div>
        <div className="w-full py-4 fixed bottom-0 right-0 bg-neutral-900 border-t border-gray-600">
            <div className="flex justify-center">
                <div className="flex space-x-4">
                    <Button
                        labelToShow="Save and Back"
                        className="button-background-grad"
                        onClick={onSaveButtonClick}
                    />
                    <Button
                        labelToShow="Submit"
                        className="button-background-grad"
                        onClick={onSubmitButtonClick}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}
