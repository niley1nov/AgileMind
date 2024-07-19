export default function ActionBar({children, textToShow}){
    return (
     <div className="flex justify-between">
        <div className="text-3xl text-neutral-400">
            {textToShow}
        </div>
        <div className="flex justify-between space-x-4">
            {children}
        </div>
     </div>
    );
}