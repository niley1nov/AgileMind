import { useState } from "react";
import TextInput from "../components/TextInput";
import TextAreaInput from "../components/TextAreaInput";
import FileInput from "../components/FileInput";
import DateInput from "../components/DateInput";
import { useForm } from "react-hook-form";
import Spinner from "../components/Spinner";
import { apiClientForAuthReq } from "../services/apiService";
import PopupMessage from "../components/PopupMessage";


function CreateProjectModal({ showModal, onClose, onProjectCreation }) {
	const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const { register, handleSubmit, formState: { errors } } = useForm();
	if (!showModal) return null;

	async function onFormSubmit(data) {
		try {
			setShowSpinner(true);
			const srsFile = data.srsFile[0];
			var fileInfo = {};
			fileInfo.fileName = srsFile.name;
			fileInfo.contentType = fileInfo.fileName.split('.').pop();
			const reader = new FileReader();
			reader.onload = (e) => {
				const arrayBuffer = e.target.result;
				fileInfo.data = Array.from(new Uint8Array(arrayBuffer));
				createProjectRecord({ ...data, fileInfo });
			};
			reader.readAsArrayBuffer(srsFile);
		} catch (e) {
			setPopupMessage(e.message);
			setTimeout(function () { setPopupMessage("") }, 2000);
		}
	}


	async function createProjectRecord(data) {
		try {
			const response = await apiClientForAuthReq.post("/project/createProject", data, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			if (response.status == "200") {
				onProjectCreation();
				closeModalWindow();
			} 
		} catch (e) {
			setPopupMessage(e.message);
			setTimeout(function () { setPopupMessage("") }, 2000);
		} finally {
			setShowSpinner(false);
		}
	}


	function closeModalWindow() {
		onClose();
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center z-10">
			<Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
			<div className="bg-black opacity-50"></div>
			<div className="bg-neutral-800 rounded-lg	shadow-xl transform transition-all sm:max-w-lg sm:w-full overflow-hidden overflow-y-auto">
				<div className="px-4 py-5 sm:p-6 max-h-svh overflow-y-auto">
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
								<TextInput
									labelToShow="Project Name"
									elementName="projectName"
									placeholder="Enter your project name here"
									register={register("projectName", { required: "Required field" })}
									errorToShow={errors.projectName?.message}
								/>
								<TextAreaInput
									labelToShow="Project Description"
									elementName="projectDecription"
									placeholder="Enter project description here"
									register={register("projectDecription", { required: "Required field" })}
									errorToShow={errors.projectDecription?.message}
								/>
								<FileInput
									labelToShow="SRS File"
									elementName="srsFile"
									placeholder="Upload your SRS file here"
									accept=".pdf,.doc,.docx,.txt"
									register={register("srsFile", { required: "Required field" })}
									errorToShow={errors.srsFile?.message}
								/>
								<DateInput
									labelToShow="Start Date"
									elementName="startDate"
									register={register("startDate", { required: "Required field" })}
									errorToShow={errors.startDate?.message}
								/>
								<DateInput
									labelToShow="Release Date"
									elementName="releaseDate"
									register={register("releaseDate", { required: "Required field" })}
									errorToShow={errors.releaseDate?.message}
								/>
							</div>
							<center>
								<button
									className="mt-8 mb-2 button-background-grad text-white py-2 px-4 text-sm rounded-full transition duration-200"
									type="submit"
								>
									Create Project
								</button>
							</center>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CreateProjectModal;