import { useState } from "react";
import "../index.css";
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
	const navigate = useNavigate();
	const [showPopup, setShowPopup] = useState(false);


	function navigateToDashboard() {
		navigate('/');
	}

	function logOut(){
		localStorage.removeItem("token");
		navigate('/login');
	}
	return (
		<nav className="z-10 fixed h-full w-25 bg-neutral-800 text-white px-3 py-8">
			<div className="flex flex-col justify-between items-center h-full">
				<div className="cursor-pointer">
					<svg
						className="h-8 w-8 hover:bg-gray-700"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						strokeWidth="1"
						stroke="currentColor"
						fill="none"
						strokeLinejoin="round"
						strokeLinecap="round"
						onClick={navigateToDashboard}
					>
						<path stroke="none" d="M0 0h24v24H0z" />
						<polyline points="5 12 3 12 12 3 21 12 19 12" />
						<path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
						<path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
					</svg>
				</div>
				<div className="flex flex flex-col justify-between items-center space-y-7">
					<div className="cursor-pointer">
						<svg
							className="h-6 w-6 hover:bg-gray-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1"
								d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div className="cursor-pointer">
						<svg
							className="h-6 w-6 hover:bg-gray-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1"
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
					</div>
					<div className="cursor-pointer">
						{showPopup && (
							<div
								className="absolute mt-2 ml-6 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
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
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" onMouseEnter={() => setShowPopup(true)} onMouseLeave={() => setShowPopup(false)}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</div>
				</div>
			</div>
		</nav>
	);
}

