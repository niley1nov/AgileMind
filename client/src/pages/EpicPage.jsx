import { useEffect,useState } from "react";
import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";
import { useParams, useNavigate, Link } from 'react-router-dom';
import Table from "../components/Table";
import Button from "../components/Button";



export default function EpicPage(){
    const [popupMessage, setPopupMessage] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [epicName, setEpicName] = useState("");
    const [storyList, setStoryList] = useState([]);
    const navigate = useNavigate();

    const heading = [
      { key: "storyName", label: "Story Name" },
      {key: "status", label: "Story Status"},
      { key: "devOwner", label: "Dev Owner" },
      { key: "qaOwner", label: "QA Owner" }

    ];

  

    const { id } = useParams();

    
    useEffect(function(){
      getStoryList();
    },[]);

    function navigateToDependancyGraph(){
      navigate('/Dependency/'+id);
    }


    async function getStoryList(){
      try{
        setShowSpinner(true);
        const response = await apiClientForAuthReq.get("/epic/getStoryList", {
          params: {epicId : id},
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if(response.status =="200"){
            //Write Your logic Here
            setEpicName(response.data.epicName);
            setStoryList(response.data.storyList.map(function(story){
                story.storyName = (
                    <Link to={"/Story/" + story._id} className="text-blue-500 text-sm hover:text-blue-800">
                      {story.storyName}
                    </Link>
                  );
                  return story;
            }));
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

    return (
        <div className="px-20 text-white">
          <Spinner showSpinner={showSpinner}/>
          <PopupMessage message={popupMessage}></PopupMessage>
          <div className="flex flex-col w-full h-full">
            <div className="pt-8">
              <SearchBar />
            </div>
            <div className="pt-8">
              <ActionBar textToShow={`Epic: ${epicName}`}>
                <Button
                      labelToShow="View Dependency Graph"
                      className="button-background-grad"
                      onClick={navigateToDependancyGraph}
                />
              </ActionBar>
            </div>
            <div className="pt-8">
                <Table header={heading} rowList={storyList} />
            </div>
          </div>
      </div>
    )
}