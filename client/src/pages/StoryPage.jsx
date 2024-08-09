import ActionBar from "../components/ActionBar";
import StoryDetails from "../components/StoryDetails";
import StoryInputs from "../components/StoryInputs";
import { useCallback, useEffect, useState } from "react";
import PopupMessage from "../components/PopupMessage";
import Spinner from "../components/Spinner";
import { useParams, useNavigate } from 'react-router-dom';
import { apiClientForAuthReq } from "../services/apiService";
import Button from "../components/Button";
import RefectorStoryConfModal from "../components/RefectorStoryConfModal";
import NavigationComponent from "../components/NavigationComponent";


export default function StoryPage() {

	const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [storyDetails, setStoryDetails] = useState({});
	const [storyInputDetails, setStoryInputDetails] = useState({});
	const [showRefectorModal, setShowRefectorModal] = useState(false);
	const [showRefectorButton, setShowRefectorButton] = useState(false);

	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(function () {
		getStoryDetails();
	}, []);


	async function getStoryDetails() {
		try {
			setShowSpinner(true);
			const response = await apiClientForAuthReq.get("/story/getStoryDetails", {
				params: { storyId: id },
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			if (response.status == "200") {
				//Write Your logic Here
				setStoryDetails(response.data.storyDetails);
				setStoryInputDetails(response.data.storyInputDetails);
				if(response.data.storyInputDetails.storyPoint > 8 || response.data.storyInputDetails.confidence == 'low'){
					setShowRefectorButton(true);
				}
			}
		} catch (error) {
			setPopupMessage(error.message);
			setTimeout(function () { setPopupMessage("");navigate("/login"); }, 2000);
			return [];
		} finally {
			setShowSpinner(false);
		}
	}

	function toMarkdown(text) {
		if (!text) return text;

		text = text.trim();

		text = text.replaceAll('* **Task', '**Task');
		text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
		text = text.replace(/\n/g, '<br>');
		text = text.replace(/\*/g, '&emsp;&#8226');

		return `<p>${text}</p>`;
	}

	function refectorStory() {
		setShowRefectorModal(true);
	}

	const onCloseModal = useCallback(function () {
		setShowRefectorModal(false);
	}, []);


	return (
		<div className="px-20 text-white">
			<Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
			<RefectorStoryConfModal showModal={showRefectorModal} onClose={onCloseModal} />
			<div className="flex flex-col w-full h-full">
				<div className="pt-8">
					<NavigationComponent pageName="Story" />
				</div>
				<div className="pt-8">
					<ActionBar textToShow={`Story: ${storyDetails.storyName}`}>
						{showRefectorButton ?
							<Button
								labelToShow="Refector Story"
								className="button-background-grad"
								onClick={refectorStory} />
							:
							''
						}
					</ActionBar>
				</div>
				<div className="pt-8">
					<StoryDetails description={storyDetails.description} tasks={toMarkdown(storyDetails.tasks)} epicName={storyDetails.epicName} />
					<StoryInputs storyInputDetails={storyInputDetails} setShowRefectorButton={setShowRefectorButton} storyId={id} />
				</div>
			</div>
		</div>
	)
}