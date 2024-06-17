import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
export default function Layout(){
    return (
        <div className="flex min-h-screen">
            <div>
                <Navbar/>
            </div>
            <div className="bg-neutral-900 w-full">
                <Outlet></Outlet>
            </div>
        </div>
    );
}