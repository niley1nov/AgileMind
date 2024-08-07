import SearchInput from "./SearchInput";
import SelectInput from "./SelectInput";
import NumberInput from "./NumberInput";
import TextAreaInput from "./TextAreaInput";
import { apiClientForAuthReq } from "../services/apiService";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PopupMessage from "../components/PopupMessage";
import { storyStatusOptions, storyConfidenceOption, moscowOptions } from "../services/selectOptions";
import Spinner from "../components/Spinner";



const StoryInputs = memo(
    function StoryInputs({ storyInputDetails, storyId }) {

        const [showSpinner, setShowSpinner] = useState(false);
        const [popupMessage, setPopupMessage] = useState("");
        const [isEditable, setIsEditable] = useState(false);
        const [storyData, setStoryData] = useState({});
        const { register, handleSubmit, formState: { errors }, setValue } = useForm();


        useEffect(function () {
            setStoryData(storyInputDetails);
            setValuesForInputs(storyInputDetails);
        }, [storyInputDetails])

        async function searchDevOwner(userEmail) {
            return await searchForUserInDataBase(userEmail, 'Developer');
        }

        async function searchQAOwner(userEmail) {
            return await searchForUserInDataBase(userEmail, 'Tester');
        }

        function onEditClick() {
            setIsEditable(true);
        }

        function onCancelClick() {
            setIsEditable(false);
        }

        function onSubmitButtonClick() {
            const form = document.getElementById('storyInputForm');
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }

        async function searchForUserInDataBase(userEmail, userRole) {
            try {
                const data = { userEmail: userEmail, userRole: userRole };
                const response = await apiClientForAuthReq.get("/user/getUserByEmail", {
                    params: data,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status == "200") {
                    return response.data.map(function (user) {
                        return { key: user._id, value: user.userEmail };
                    });
                }
            } catch (error) {
                setPopupMessage(error.message);
                setTimeout(function () { setPopupMessage("") }, 2000);
                return [];
            }
        }

        function setValuesForInputs(dataToSet) {
            for (let key in dataToSet) {
                setValue(key, dataToSet[key]);
            }
        }

        async function onFormSubmit(data) {
            try {
                data.storyId = storyId;
                setShowSpinner(true);
                const response = await apiClientForAuthReq.post("/story/updateStoryDetails", data, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status == "200") {
                    setIsEditable(false);
                }

            } catch (e) {
                setPopupMessage(e.message);
                setTimeout(function () { setPopupMessage("") }, 2000);
            } finally {
                setShowSpinner(false);
            }
        }

        // Function to handle input change
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setStoryData(prevState => ({
                ...prevState,
                [name]: value
            }));
        };


        return (
            <div className="w-full pt-8 border border-gray-600 rounded-md focus:outline-none focus:ring-2 bg-transparent text-sm mt-8 mb-4">
                <Spinner showSpinner={showSpinner} />
                <PopupMessage message={popupMessage}></PopupMessage>
                <form id="storyInputForm" onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid grid-cols-2 gap-x-36 gap-y-8 px-6">
                        <SearchInput
                            labelToShow="Dev Owner Email"
                            elementName="devOwnerEmail"
                            placeholder="Search by User Email"
                            register={register("devOwnerEmail")}
                            searchInDataBase={searchDevOwner}
                            onSearchSelect={(selectedValue) => {
                                setValue('devOwnerEmail', selectedValue);
                                setStoryData(prevState => ({
                                    ...prevState,
                                    'devOwnerEmail': selectedValue
                                }));
                            }}
                            readOnly={!isEditable}
                            errorToShow={errors.devOwnerEmail?.message}
                            value={storyData.devOwnerEmail}
                        />
                        <SearchInput
                            labelToShow="QA Owner Email"
                            elementName="qaOwnerEmail"
                            placeholder="Search by User Email"
                            register={register("qaOwnerEmail")}
                            searchInDataBase={searchQAOwner}
                            onSearchSelect={(selectedValue) => {
                                setValue('qaOwnerEmail', selectedValue)
                                setStoryData(prevState => ({
                                    ...prevState,
                                    'qaOwnerEmail': selectedValue
                                }));
                            }}
                            readOnly={!isEditable}
                            errorToShow={errors.qaOwnerEmail?.message}
                            value={storyData.qaOwnerEmail}
                        />
                        <SelectInput
                            labelToShow="Story Status"
                            elementName="storyStatus"
                            options={storyStatusOptions}
                            register={register("storyStatus")}
                            errorToShow={errors.storyStatus?.message}
                            readOnly={!isEditable}
                            value={storyData.storyStatus}
                            onInputChange={handleInputChange}
                        />
                        <SelectInput
                            labelToShow="Confidence"
                            elementName="confidence"
                            options={storyConfidenceOption}
                            register={register("confidence", { required: "Required field" })}
                            errorToShow={errors.confidence?.message}
                            readOnly={!isEditable}
                            value={storyData.confidence}
                            onInputChange={handleInputChange}
                        />
                        <SelectInput
                            labelToShow="MoSCoW"
                            elementName="moscow"
                            options={moscowOptions}
                            register={register("moscow", { required: "Required field" })}
                            errorToShow={errors.moscow?.message}
                            readOnly={!isEditable}
                            value={storyData.moscow}
                            onInputChange={handleInputChange}
                        />
                        <NumberInput
                            labelToShow="Story Points"
                            placeholder="Enter your Story Points here"
                            elementName="storyPoint"
                            register={register("storyPoint", { required: "Required field", type: "number" })}
                            errorToShow={errors.storyPoint?.message}
                            readOnly={!isEditable}
                            value={storyData.storyPoint}
                            onInputChange={handleInputChange}
                        />
                        <TextAreaInput
                            labelToShow="Remarks"
                            placeholder="Enter your Remarks here"
                            elementName="reMarks"
                            register={register("reMarks")}
                            errorToShow={errors.reMarks?.message}
                            readOnly={!isEditable}
                            value={storyData.reMarks}
                            onInputChange={handleInputChange}
                        />
                    </div>
                </form>
                <div className="relative bg-neutral-800 border-t border-gray-600 mt-4">
                    <center>
                        {
                            isEditable ?
                                <div className="flex justify-center">
                                    <button
                                        className="mt-4 mb-2 mr-2 bg-neutral-900 text-white py-2 px-6 text-sm rounded-full transition duration-200" onClick={onCancelClick}>
                                        Cancel
                                    </button>
                                    <button
                                        className="mt-4 mb-2 button-background-grad text-white py-2 px-6 text-sm rounded-full transition duration-200" onClick={onSubmitButtonClick}>
                                        Save
                                    </button>
                                </div>
                                :
                                <button
                                    className="mt-4 mb-2 button-background-grad text-white py-2 px-6 text-sm rounded-full transition duration-200" onClick={onEditClick}>
                                    Edit
                                </button>
                        }
                    </center>
                </div>
            </div>
        );
    }

);


export default StoryInputs;