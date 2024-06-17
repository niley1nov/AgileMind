
export default function SearchBar(){
   return (
    <div>
        <input
            type="text"
            placeholder="Search for projects, epics, stories, members..."
            className="w-full px-4 py-2 shadow-xl rounded-md bg-neutral-800 text-sm"
        />
    </div>
   );
}