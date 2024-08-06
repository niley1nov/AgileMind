import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import StoryDetails from "../components/StoryDetails";
import StoryInputs from "../components/StoryInputs";
import { useEffect, useState } from "react";
import PopupMessage from "../components/PopupMessage";
import Spinner from "../components/Spinner";
import { useParams} from 'react-router-dom';
import { apiClientForAuthReq } from "../services/apiService";



export default function StoryPage(){

    const [popupMessage, setPopupMessage] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [storyDetails, setStoryDetails] = useState({});
    const [storyInputDetails, setStoryInputDetails] = useState({});

    const { id } = useParams();

    useEffect(function(){
        getStoryDetails();
    },[]);


    async function getStoryDetails(){
        try{
          setShowSpinner(true);
          const response = await apiClientForAuthReq.get("/story/getStoryDetails", {
            params: {storyId : id},
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if(response.status =="200"){
              //Write Your logic Here
              setStoryDetails(response.data.storyDetails);
              setStoryInputDetails(response.data.storyInputDetails);
             
          }
        }catch(error){
          setPopupMessage(error.message);
          setTimeout(function(){setPopupMessage("")},2000);
          //navigate("/login");
          return [];
        }finally{
          setShowSpinner(false);
        }
    }

    function toMarkdown(text) {
        if(!text) return text;
        // Split the text into lines
        const lines = text.trim().split('\n');

        // Initialize HTML string
        let html = '<ol>';

        // Process each line
        lines.forEach(line => {
            // Bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Add list item
            html += `<li style="margin-bottom: 10px;">${line}</li>`;
        });

        // Close the ordered list
        html += '</ol>';

        return html; 
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
                <ActionBar textToShow={`Story: ${storyDetails.storyName}`}>
                </ActionBar>
            </div>
            <div className="pt-8">
                <StoryDetails description={storyDetails.description} tasks={toMarkdown(storyDetails.tasks)} epicName ={storyDetails.epicName}/>
                <StoryInputs storyInputDetails={storyInputDetails} storyId={id}/>
            </div>
            </div>
    </div>
    )
}