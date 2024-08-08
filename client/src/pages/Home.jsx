import { memo, useEffect, useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import Button from "../components/Button";
import Table from "../components/Table";
import CreateProjectModal from "../components/CreateProjectModal";
import { apiClientForAuthReq } from "../services/apiService";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [projectList, setProjectList] = useState([]);
	const navigate = useNavigate();
	const heading = [
		{ key: "projectName", label: "Project Name" },
		{ key: "startDate", label: "Start Date" },
		{ key: "releaseDate", label: "Release Date" },
		{ key: "status", label: "Project Status" },
		{ key: "totalPhase", label: "# Phases" }
	];

	useEffect(function () {
		getAssignedProjectList();
	}, []);

	function getAssignedProjectList() {
		setShowSpinner(true);
		apiClientForAuthReq
			.get("/project/getAssignedProjects", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			.then(function (response) {
				if (response.status == "200") {
					setProjectList(
						response.data.map(function (project) {
							project.projectName = (
								<Link to={"/Project/" + project._id} className="text-purple-400 text-sm hover:text-purple-500">
									{project.projectName}
								</Link>
							);
							return project;
						})
					);
				}
			})
			.catch(function (e) {
				setPopupMessage(e.message);
				setTimeout(function () {
					setPopupMessage("");
				}, 2000);
				navigate("/login");
			})
			.finally(() => {
				setShowSpinner(false);
			});
	}

	const openCreateProjectModal = useCallback(function () {
		setOpenCreateModal(true);
	}, []);

	const closeCreateProjectModal = useCallback(function () {
		setOpenCreateModal(false);
	}, []);

	const afterProjectCreation = useCallback(function () {
		getAssignedProjectList();
	}, []);

	return (
		<div className="px-20 text-white">
			<Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
			<CreateProjectModal
				showModal={openCreateModal}
				onClose={closeCreateProjectModal}
				onProjectCreation={afterProjectCreation}
			></CreateProjectModal>
			<div className="flex flex-col w-full h-full">
				<div className="pt-8">
					<SearchBar />
				</div>
				<div className="pt-8">
					<ActionBar textToShow="Dashboard">
						{projectList.length > 0 ? (
							<Button
								labelToShow="Create Project"
								className="button-background-grad"
								onClick={openCreateProjectModal}
							/>
						) : (
							""
						)}
					</ActionBar>
				</div>
				<div className="pt-8">
					{projectList.length == 0 ? (
						<WelcomeMessage onClickCallBack={openCreateProjectModal} />
					) : (
						<Table header={heading} rowList={projectList} />
					)}
				</div>
			</div>
		</div>
	);
}

const WelcomeMessage = memo(function WelcomeMessage({ onClickCallBack }) {
	return (
		<div className="flex flex-col pt-16">
			<div className="place-self-center text-3xl font-bold mb-4">
				Welcome To <span className="welcome-text-color">Agile Mind</span>
			</div>
			<div className="place-self-center mb-4">
				Let's create your first project!
			</div>
			<div className="place-self-center">
				<Button
					labelToShow="Create Project"
					className="button-background-grad"
					onClick={onClickCallBack}
				/>
			</div>
		</div>
	);
});
