import { useEffect,memo,useState,useCallback } from "react";
import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import Button from "../components/Button";
import AssignMemberModal from "../components/AssignMemberModal";




export default function ProjectPage(){
    const [openAssignUserModal, setOpenAssignUserModal] = useState(false);
    useEffect(function(){
        console.log('Project Page Mounted');
    },[])


    const openAssignmentModal = useCallback(function () {
        setOpenAssignUserModal(true);
      }, []);
    
      const closeAssignmentModal = useCallback(function () {
        setOpenAssignUserModal(false);
      }, []);


    return (
        <div className="px-20 text-white">
        <AssignMemberModal showModal={openAssignUserModal} onClose={closeAssignmentModal}/>
        <div className="flex flex-col w-full h-full">
          <div className="pt-8">
            <SearchBar />
          </div>
          <div className="pt-8">
            <ActionBar textToShow="Project Name">
                <Button
                    labelToShow="Add Members"
                    className="button-background-grad"
                    onClick={openAssignmentModal}
                />
                <Button
                    labelToShow="View Members"
                    className="button-background-grad"
                />
            </ActionBar>
          </div>
          <div className="pt-8">
              <ProjectMessage />
          </div>
        </div>
      </div>
    )
}


const ProjectMessage = memo(function ProjectMessage() {
    return (
      <div className="flex flex-col pt-16">
        <div className="place-self-center text-3xl font-bold mb-4">
         <span className="welcome-text-color">Project Name</span>
        </div>
        <div className="place-self-center mb-4">
          Let's complete Functional and Technical questions  
        </div>
        <div className=" flex place-self-center">
            <Button
            labelToShow="Functional"
            className="button-background-grad"
            />
            <Button
            labelToShow="Technical"
            className="button-background-grad ml-4"
            />
      </div>
      </div>
    );
  });