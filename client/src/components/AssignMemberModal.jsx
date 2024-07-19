import SelectInput from "../components/SelectInput";
import SearchInput from "./SearchInput";
import { useForm } from "react-hook-form";
import {roleOptions} from "../services/selectOptions";



export default function AssignMemberModal({showModal, onClose}){
    const {register,formState: { errors }} = useForm();

    if (!showModal) return null;

    function closeModalWindow(){
        onClose();
      }
      
    return (
        <div className="fixed inset-0 flex items-center justify-center z-10">
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
                <form className="py-8 text-white rounded-md">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                    <SelectInput
                        labelToShow="Select Role"
                        elementName="userRole"
                        register={register("userRole", { required: "Required field" })}
                        options={roleOptions}
                        errorToShow={errors.userRole?.message}
                    />
                    <SearchInput
                        labelToShow="Select User"
                        elementName="searchUser"
                        placeholder="Search by User Email"
                        register={register("searchUser", { required: "Required field" })}

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