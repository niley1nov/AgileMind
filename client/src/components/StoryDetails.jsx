import { useEffect, memo } from "react";


const StoryDetails = memo(
    function StoryDetails({description,tasks,epicName}){
        useEffect(function(){
            document.getElementById('taskBlock').innerHTML = tasks;
        },[tasks])
        return (
            <div className="w-full px-3 py-2">
                <div className="grid grid-cols-1 gap-x-8 gap-y-8">
                    <div>
                        <div className="mb-2 text-neutral-300 text-base">Description</div>
                        <div className="w-full px-3 py-2 text-sm">
                            {description}
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 text-neutral-300 text-base">Tasks</div>
                        <div className="w-full px-3 py-2 text-sm" id="taskBlock">
                            {tasks}
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 text-neutral-300 text-base">Epic Name</div>
                        <div className="w-full px-3 py-2 text-sm">
                            {epicName}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
);

export default StoryDetails;
