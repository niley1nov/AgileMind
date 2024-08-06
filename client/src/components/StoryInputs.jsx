import SearchInput from "./SearchInput";
import SelectInput from "./SelectInput";
import { apiClientForAuthReq } from "../services/apiService";
import { useState } from "react";
import { useForm } from "react-hook-form";
import PopupMessage from "../components/PopupMessage";
import { storyStatusOptions } from "../services/selectOptions";




export default function StoryInputs(){

    const [popupMessage, setPopupMessage] = useState("");
    const [isEditable, setIsEditable] = useState(false);
    const {register, handleSubmit, formState: { errors }, setValue} = useForm();


    async function searchDevOwner(userEmail){
       return await searchForUserInDataBase(userEmail, 'Project Manager');
    }

    async function searchQAOwner(userEmail){
        return await searchForUserInDataBase(userEmail, 'Project Manager');
    }

    function onEditClick(){
        setIsEditable(true);
    }

    async function searchForUserInDataBase(userEmail){
        try{
          const data = {userEmail: userEmail, userRole: 'Project Manager'};
          console.log('>> '+JSON.stringify(data));
          const response = await apiClientForAuthReq.get("/user/getUserByEmail", {
            params: data,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if(response.status =="200"){
            return response.data.map(function(user){
              return {key: user._id, value: user.userEmail};
            });
          }
        }catch(error){
          setPopupMessage(error.message);
          setTimeout(function(){setPopupMessage("")},2000);
          return [];
        }
      }

    return (
        <div className="w-full pt-8 border border-gray-600 rounded-md focus:outline-none focus:ring-2 bg-transparent text-sm mt-8 mb-4">
            <PopupMessage message={popupMessage}></PopupMessage>
            <form>
                <div className="grid grid-cols-2 gap-x-36 gap-y-8 px-6">
                        <SearchInput
                            labelToShow="Dev Owner Email"
                            elementName="devOwnerEmail"
                            placeholder="Search by User Email"
                            register={register("devOwnerEmail")}
                            searchInDataBase={searchDevOwner}
                            onSearchSelect={(selectedValue)=>{setValue('devOwnerEmail',selectedValue)}}
                            readOnly={isEditable}
                            errorToShow={errors.devOwnerEmail?.message}
                        />
                        <SearchInput
                            labelToShow="QA Owner Email"
                            elementName="qaOwnerEmail"
                            placeholder="Search by User Email"
                            register={register("qaOwnerEmail")}
                            searchInDataBase={searchQAOwner}
                            onSearchSelect={(selectedValue)=>{setValue('qaOwnerEmail',selectedValue)}}
                            readOnly={isEditable}
                            errorToShow={errors.qaOwnerEmail?.message}
                        />
                         <SelectInput
                            labelToShow="Story Status"
                            elementName="storyStatus"
                            options={storyStatusOptions}
                            register={register("storyStatus")}
                            errorToShow={errors.storyStatus?.message}
                        />
                </div>
            </form>
            <div className="relative bg-neutral-800 border-t border-gray-600 mt-4">
                <center>
                    {
                        isEditable ? <button
                        className="mt-4 mb-2 button-background-grad text-white py-2 px-6 text-sm rounded-full transition duration-200">
                            Save
                        </button> : 
                         <button
                         className="mt-4 mb-2 text-white py-2 px-6 text-sm rounded-full transition duration-200 bg-neutral-900" onClick={onEditClick}>
                             Edit
                         </button>
                    }
    
                </center>
            </div>
        </div>
    );
}