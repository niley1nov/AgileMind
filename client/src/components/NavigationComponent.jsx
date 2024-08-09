import { Link, useParams } from "react-router-dom";
import { apiClientForAuthReq } from "../services/apiService";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";


export default function NavigationComponent({ pageName }) {

	const [navigationItems, setNavigationItems] = useState([]);
	const { id } = useParams();
	const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);

	useEffect(function () {
		getNavigationData();
	}, []);

	async function getNavigationData() {
		try {
			setShowSpinner(true);
			const response = await apiClientForAuthReq.get("/user/getNavigationInfo", {
				params: { id: id, pageName: pageName },
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			if (response.status == "200") {
				setNavigationItems(response.data);
			}
		} catch (error) {
			setPopupMessage(error.message);
			setTimeout(function () { setPopupMessage("") }, 2000);
		} finally {
			setShowSpinner(false);
		}
	}

	return (
		<nav className="text-sm font-medium text-gray-500 w-full px-4 py-2 shadow-xl rounded-full bg-neutral-800 text-sm">
			<Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
			<ol className="list-reset flex">
				{
					navigationItems.map(function (item, index) {
						return index === navigationItems.length - 1 ?
							<>
								<li className="truncate text-nowrap">
									<span className="text-purple-300">{item.label}</span>
								</li>
							</> :
							<>
								<li className="truncate text-nowrap">
									<Link key={index} to={item.link} className="text-purple-400 hover:text-purple-500">{item.label}</Link>
								</li>
								<li>
									<span className="mx-2">{'>'}</span>
								</li>
							</>
					})
				}
			</ol>
		</nav>
	);
}