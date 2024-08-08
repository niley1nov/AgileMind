import SelectInput from "../components/SelectInput";
import SearchInput from "./SearchInput";
import DateInput from "../components/DateInput";
import { useForm } from "react-hook-form";
import {roleOptions} from "../services/selectOptions";
import { useState } from "react";
import { apiClientForAuthReq } from "../services/apiService";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { useParams } from 'react-router-dom';




export default function AssignMemberModal({showModal, onClose}){
    const {register, handleSubmit, formState: { errors }, setValue} = useForm();
    const [userRole, setUserRole] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const { id } = useParams();
    

    if (!showModal) return null;

    async function searchForUserInDataBase(userEmail){
      try{
        const data = {userEmail: userEmail, userRole: userRole};
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

    function closeModalWindow(){
      onClose();
    }

    function onRoleChange(event){
      setUserRole(event.target.value);
    }

    async function onFormSubmit(data) {
      try{
        setShowSpinner(true);
        data.projectId = id;
        const response = await apiClientForAuthReq.post("/project/createProjectAssignment", data, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if(response.status == "200"){
          onClose();
        }
      }catch(e){
        setPopupMessage(e.message);
        setTimeout(function(){setPopupMessage("")},2000);
      }finally{
        setShowSpinner(false);
      }
    }
      
    return (
        <div className="fixed inset-0 flex items-center justify-center z-10">
            <Spinner showSpinner={showSpinner}/>
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
                <form 
                onSubmit={handleSubmit(onFormSubmit)}
                className="py-8 text-white rounded-md">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                    <SelectInput
                        labelToShow="Select Role"
                        elementName="userRole"
                        register={register("userRole", { required: "Required field" })}
                        options={roleOptions}
                        errorToShow={errors.userRole?.message}
                        onInputChange={onRoleChange}
                    />
                    <SearchInput
                        labelToShow="Select User"
                        elementName="userEmail"
                        placeholder="Search by User Email"
                        register={register("userEmail", { required: "Required field" })}
                        searchInDataBase={searchForUserInDataBase}
                        onSearchSelect={(selectedValue)=>{setValue('userEmail',selectedValue)}}
                        readOnly={userRole==""}
                        errorToShow={errors.userEmail?.message}
                    />
                     <DateInput
                      labelToShow="Start Date"
                      elementName="startDate"
                      register={register("startDate", { required: "Required field" })}
                      errorToShow={errors.startDate?.message}
                    />
                    <DateInput
                      labelToShow="End Date"
                      elementName="endDate"
                      register={register("endDate", { required: "Required field" })}
                      errorToShow={errors.endDate?.message}
                    />
                  </div>
                  <center>
                    <button
                      className="mt-8 mb-2 button-background-grad text-white py-2 px-4 text-sm rounded-full transition duration-200"
                      type="submit"
                    >
                      Add Member
                    </button>
                  </center>
                </form>
              </div>
            </div>
          </div>
        </div>
    );
}