import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { useState } from "react";
import { apiClientForAuthReq } from "../services/apiService";
import { useParams,useNavigate } from 'react-router-dom';


export default function RefectorStoryConfModal({ showModal, onClose }) {

    const [popupMessage, setPopupMessage] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();


    if (!showModal) return null;

    function closeModalWindow() {
        onClose();
    }


    async function requestRefectorStory(){
        try{
            setShowSpinner(true);
            const data = {storyId: id};
            const response = await apiClientForAuthReq.post("/story/requestForStoryRefectoring", data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if(response.status =="200"){
                navigate("/Epic/"+response.data.epicId);
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
        <div className="fixed inset-0 flex items-center justify-center z-10">
            <Spinner showSpinner={showSpinner} />
            <PopupMessage message={popupMessage}></PopupMessage>
            <div className="bg-black opacity-50"></div>
            <div className="bg-neutral-800 rounded-lg	shadow-xl transform transition-all sm:max-w-lg sm:w-full overflow-hidden overflow-y-auto">
                <div className="px-4 py-5 sm:p-6">
                    <button
                        type="button"
                        className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={closeModalWindow}
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <div className="mt-3 sm:mt-5">
                        Please review Remarks and update it as per your refectoring expectations. Once you are confirmed click on Refector button.
                    </div>
                </div>
                <div className="relative bg-neutral-800 border-t border-gray-600 mt-4">
                    <center>
                        <button className="mt-4 mb-2 button-background-grad text-white py-2 px-6 text-sm rounded-full transition duration-200" onClick={requestRefectorStory}>
                            Refector
                        </button>
                    </center>
                </div>
            </div>
        </div>
    );
}