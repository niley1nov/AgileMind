import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectPage(){
    const navigate = useNavigate();

    useEffect(function(){
        console.log('Project Page Mounted');
    },[])


    function onButtonClick(){
        navigate('/');
    }

    return (
        <div>
            <h2>Project Page</h2>
            <button onClick={onButtonClick}>Home Page</button>
        </div>
    )
}