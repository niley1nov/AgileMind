import { useEffect,memo,useState } from "react";
import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";
import { useParams, useNavigate } from 'react-router-dom';
import Table from "../components/Table";
import {PROJECT_STATUS_CREATED, PROJECT_STATUS_WAITING_FOR_INPUT, PROJECT_STATUS_INPUT_PROVIDED, PROJECT_SETUP_STATUS} from '../services/contstant';



export default function PhasePage(){
    const [popupMessage, setPopupMessage] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [phaseName, setPhaseName] = useState("");
    const [phaseStatus, setPhaseStatus] = useState("");
    const [epicList, setEpicList] = useState([]);
    const navigate = useNavigate();

    const heading = [
      { key: "epicName", label: "Epic Name" },
      { key: "status", label: "Epic Status" },
      { key: "totalStories", label: "# Stories" }
    ];

  

    const { id } = useParams();

    
    useEffect(function(){
      getEpicList();
    },[])


    async function getEpicList(){
      try{
        setShowSpinner(true);
        const response = await apiClientForAuthReq.get("/phase/getEpicList", {
          params: {phaseId : id},
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if(response.status =="200"){
            setPhaseName(response.data.phaseName);
            setPhaseStatus(response.data.phaseStatus);
        }
      }catch(error){
        setPopupMessage(error.message);
        setTimeout(function(){setPopupMessage("")},2000);
        navigate("/login");
        return [];
      }finally{
        setShowSpinner(false);
      }
    }




    return (
        <div className="px-20 text-white">
          <Spinner showSpinner={showSpinner}/>
          <PopupMessage message={popupMessage}></PopupMessage>
          <div className="flex flex-col w-full h-full">
            <div className="pt-8">
              <SearchBar />
            </div>
            <div className="pt-8">
              <ActionBar textToShow={phaseName}>
              </ActionBar>
            </div>
            <div className="pt-8">
                {PROJECT_SETUP_STATUS.has(phaseStatus) ? <PhasePageMessage phaseStatus={phaseStatus} phaseId={id} /> : <Table header={heading} rowList={epicList} />}
            </div>
          </div>
      </div>
    )
}


const PhasePageMessage = memo(function PhasePageMessage({phaseStatus, phaseId}) {

  const navigate = useNavigate();

  function redirectToQuestionPage(){
    navigate('/Questions/PhaseQuestions/'+phaseId);
  }

  if(phaseStatus === PROJECT_STATUS_CREATED){
    return (
      <div className="flex flex-col pt-16">
         <div className="place-self-center text-3xl font-bold mb-4">
         <span className="welcome-text-color">Welcome</span>
        </div>
        <div className="place-self-center mb-4">
          We are preparing few questions to get more insight about this phase
        </div>
        <div className="place-self-center mb-4">
          Please Wait...
        </div>
      </div>
    );

  }else if(phaseStatus === PROJECT_STATUS_WAITING_FOR_INPUT){
    return (
      <div className="flex flex-col pt-16">
        <div className="place-self-center mb-4">
          Let's complete phase related questions  
        </div>
        <div className=" flex place-self-center">
            <Button
            labelToShow="Questions"
            className="button-background-grad"
            onClick={redirectToQuestionPage}
            />
        </div>
      </div>
    );
  }else if(phaseStatus === PROJECT_STATUS_INPUT_PROVIDED){
    return (
      <div className="flex flex-col pt-16">
         <div className="place-self-center text-3xl font-bold mb-4">
         <span className="welcome-text-color">Welcome</span>
        </div>
        <div className="place-self-center mb-4">
          Thank you for providing your inputs. We are preparing structure for your Phase
        </div>
        <div className="place-self-center mb-4">
          Please Wait...
        </div>
      </div>
    );
  }
    
  });