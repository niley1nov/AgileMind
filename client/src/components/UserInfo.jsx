import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";



export default function UserInfo(){
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const [popupMessage, setPopupMessage] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
    const [userDetails, setUserDetails] = useState({});

    useEffect(function(){
        getUserDetails();
    },[])

    function logOut() {
		localStorage.removeItem("token");
		navigate('/login');
	}

    async function getUserDetails(){
        setShowSpinner(true);
		apiClientForAuthReq
			.get("/user/getUserInfo", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			.then(function (response) {
				if (response.status == "200") {
					setUserDetails({firstName: response.data.userFirstName, role: response.data.userRole});
				}
			})
			.catch(function (e) {
				setPopupMessage(e.message);
				setTimeout(function () {
					setPopupMessage("");
				}, 2000);
			})
			.finally(() => {
				setShowSpinner(false);
			});
    }

    return (
        <div className="bg-neutral-800 px-24">
            <Spinner showSpinner={showSpinner} />
			<PopupMessage message={popupMessage}></PopupMessage>
            <span  className="float-right text-base text-white mt-2">{`${userDetails.firstName} (${userDetails.role})`}
                <span className="cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 inline ml-2" onMouseEnter={() => setShowPopup(true)} onMouseLeave={() => setShowPopup(false)}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    {showPopup && (
                    <div
                        className="absolute right-0 mr-8 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                        onMouseEnter={() => setShowPopup(true)}
                        onMouseLeave={() => setShowPopup(false)}
                    >
                        <div className="py-1">
                            <button
                                onClick={logOut}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    )
                }
                </span>
            </span>
        </div>
    );
}