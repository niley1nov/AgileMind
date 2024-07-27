import { useEffect,memo,useState,useCallback } from "react";
import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import Button from "../components/Button";
import AssignMemberModal from "../components/AssignMemberModal";
import ViewAssignmentModal from "../components/ViewAssignmentModal";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";
import { useParams, useNavigate } from 'react-router-dom';
import {PROJECT_STATUS_CREATED, PROJECT_STATUS_WAITING_FOR_INPUT, PROJECT_STATUS_INPUT_PROVIDED, PROJECT_SETUP_STATUS} from '../services/contstant';



export default function ProjectPage(){
    const [openAssignUserModal, setOpenAssignUserModal] = useState(false);
    const [openViewAssignmentModal, setOpenViewAssignmentModal] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectStatus, setProjectStatus] = useState("");
    const navigate = useNavigate();

  

    const { id } = useParams();

    
    useEffect(function(){
      getPhaseList();
    },[])


    const openAssignmentModal = useCallback(function () {
        setOpenAssignUserModal(true);
      }, []);
    
    const closeAssignmentModal = useCallback(function () {
      setOpenAssignUserModal(false);
    }, []);

    const openViewAssignment = useCallback(function () {
      setOpenViewAssignmentModal(true);
    }, []);
  
  const closeViewAssignment = useCallback(function () {
    setOpenViewAssignmentModal(false);
  }, []);

    async function getPhaseList(){
      try{
        setShowSpinner(true);
        const response = await apiClientForAuthReq.get("/project/getPhaseList", {
          params: {projectId : id},
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if(response.status =="200"){
          setProjectName(response.data.projectName);
          setProjectStatus(response.data.projectStatus);
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
          <AssignMemberModal showModal={openAssignUserModal} onClose={closeAssignmentModal}/>
          <ViewAssignmentModal showModal={openViewAssignmentModal} onClose={closeViewAssignment}/>
          <div className="flex flex-col w-full h-full">
            <div className="pt-8">
              <SearchBar />
            </div>
            <div className="pt-8">
              <ActionBar textToShow={projectName}>
                  <Button
                      labelToShow="Add Members"
                      className="button-background-grad"
                      onClick={openAssignmentModal}
                  />
                  <Button
                      labelToShow="View Members"
                      className="button-background-grad"
                      onClick={openViewAssignment}
                  />
              </ActionBar>
            </div>
            <div className="pt-8">
                {PROJECT_SETUP_STATUS.has(projectStatus) ? <ProjectMessage projectStatus={projectStatus} projectId={id} /> : ''}
            </div>
          </div>
      </div>
    )
}


const ProjectMessage = memo(function ProjectMessage({projectStatus, projectId}) {

  const navigate = useNavigate();

  function redirectToFunQuestionPage(){
    navigate('/Questions/Functional/'+projectId);
  }

  function redirectToTechQuestionPage(){
    navigate('/Questions/Technical/'+projectId);
  }

  if(projectStatus === PROJECT_STATUS_CREATED){
    return (
      <div className="flex flex-col pt-16">
         <div className="place-self-center text-3xl font-bold mb-4">
         <span className="welcome-text-color">Welcome</span>
        </div>
        <div className="place-self-center mb-4">
          We are preparing Functional and Technical questions to get more insight about the project
        </div>
        <div className="place-self-center mb-4">
          Please Wait...
        </div>
      </div>
    );

  }else if(projectStatus === PROJECT_STATUS_WAITING_FOR_INPUT){
    return (
      <div className="flex flex-col pt-16">
        <div className="place-self-center mb-4">
          Let's complete Functional and Technical questions  
        </div>
        <div className=" flex place-self-center">
            <Button
            labelToShow="Functional"
            className="button-background-grad"
            onClick={redirectToFunQuestionPage}
            />
            <Button
            labelToShow="Technical"
            className="button-background-grad ml-4"
            onClick={redirectToTechQuestionPage}
            />
        </div>
      </div>
    );
  }else if(projectStatus === PROJECT_STATUS_INPUT_PROVIDED){
    return (
      <div className="flex flex-col pt-16">
         <div className="place-self-center text-3xl font-bold mb-4">
         <span className="welcome-text-color">Welcome</span>
        </div>
        <div className="place-self-center mb-4">
          Thank you for providing your inputs. We are preparing structure for your project
        </div>
        <div className="place-self-center mb-4">
          Please Wait...
        </div>
      </div>
    );
  }
    
  });