import { useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import EditProjectButton from "../components/EditProjectButton";
import SummaryBar from "../components/SummaryBar";
import CreateProjectButton from "../components/CreateProjectButton";
import HomePageTable from "../components/HomePageTable";


export default function Home(){
    //const navigate = useNavigate();

    useEffect(function(){
        console.log('Home Page Mounted');
    },[])

    /*function onButtonClick(){
        navigate('/Project');
    }*/
    return (
        <div className="w-full h-full px-20 text-white">
            <div className="flex flex-col w-full h-full">
                <div className="pt-8">
                    <SearchBar/>
                </div>
                <div className="pt-8">
                    <ActionBar textToShow="Dashoboard">
                        <EditProjectButton/>
                    </ActionBar>
                </div>
                <div className="pt-8">
                    <SummaryBar textToShow="Project Management"></SummaryBar>
                </div>
                <div className="pt-8">
                    <CreateProjectButton/>
                </div>
                <div className="pt-2">
                    <HomePageTable/>
                </div>
            </div>
        </div>
    )
}