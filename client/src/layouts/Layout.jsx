import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserInfo from "../components/UserInfo";

export default function Layout() {


	return (
		<div className="flex min-h-screen">
			<div>
				<Navbar />
			</div>
			<div className="bg-neutral-900 w-full" >
				<UserInfo/>
				<Outlet></Outlet>
			</div>
		</div>
	);
}