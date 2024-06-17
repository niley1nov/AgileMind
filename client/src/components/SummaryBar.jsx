export default function SummaryBar({children, textToShow}){
    return (
     <div className="flex justify-between">
        <div className="text-4xl">
            {textToShow}
        </div>
        <div className="flex justify-between space-x-10">
            {children}
        </div>
     </div>
    );
}