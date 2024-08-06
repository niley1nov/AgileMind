export default function StoryDetails(){
    return (
        <div className="w-full px-3 py-2">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8">
                <div>
                    <div className="mb-2 text-neutral-400 text-base">Description</div>
                    <div className="w-full px-3 py-2 text-sm">
                        Story Description
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-neutral-400 text-base">Tasks</div>
                    <div className="w-full px-3 py-2 text-sm">
                        List of Tasks
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-neutral-400 text-base">Epic Name</div>
                    <div className="w-full px-3 py-2 text-sm">
                        Name of the Epic
                    </div>
                </div>
            </div>
        </div>
    );
}