import { Outlet } from "react-router-dom";

import '../css/layoutStyle.css';

export default function GuestLayout(){
    return (
        <div className="min-h-screen min-w-screen background-grd-color">
            <div className="w-full">
                <Outlet></Outlet>
            </div>
        </div>
    );
}

