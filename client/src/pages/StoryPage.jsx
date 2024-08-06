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

        console.log(text);
        text = text.trim();
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\n/g, '<br>');
        text = text.replace(/\*/g, '&emsp;&#8226');
        console.log(text);

        return `<p>${text}</p>`; 
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