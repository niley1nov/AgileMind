import SearchBar from "../components/SearchBar";
import ActionBar from "../components/ActionBar";
import StoryDetails from "../components/StoryDetails";
import StoryInputs from "../components/StoryInputs";

export default function StoryPage(){
    return (
        <div className="px-20 text-white">
        <div className="flex flex-col w-full h-full">
          <div className="pt-8">
            <SearchBar />
          </div>
          <div className="pt-8">
            <ActionBar textToShow={`Story Name`}>
            </ActionBar>
          </div>
          <div className="pt-8">
            <StoryDetails/>
            <StoryInputs/>
          </div>
        </div>
    </div>
    )
}