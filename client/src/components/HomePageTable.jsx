import TableRow from "../components/TableRow";

export default function HomePageTable(){
    return (
        <div>
            <div className="grid grid-flow-col auto-cols-fr gap-x-3 w-full pl-2 pr-6 py-6 text-neutral-400 text-sm">
                <div className="col-span-2">
                    Project Name
                </div>
                <div>
                    # Tasks
                </div>
                <div>
                    Members
                </div>
                <div>
                    Stage
                </div>
                <div>
                    Due Date
                </div>
                <div>
                    
                </div>
            </div>
            <div className="space-y-2">
                <TableRow>
                    <div className="text-sm col-span-2">
                        Finance Management System
                    </div>
                    <div className="text-sm">
                        16 Epics
                    </div>
                    <div className="text-sm">
                        Avtar
                    </div>
                    <div className="text-sm">
                        In Progress (66%)
                    </div>
                    <div className="text-sm">
                        08.08.2024
                    </div>
                    <div className="text-sm flex items-center justify-end">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="12" cy="12" r="1" />  <circle cx="12" cy="19" r="1" />  <circle cx="12" cy="5" r="1" /></svg>
                    </div>
                </TableRow>
                <TableRow>
                    <div className="text-sm col-span-2">
                        Chatbot for Sales department
                    </div>
                    <div className="text-sm">
                        10 Epics
                    </div>
                    <div className="text-sm">
                        Avtar
                    </div>
                    <div className="text-sm">
                    Done
                    </div>
                    <div className="text-sm">
                        08.06.2023
                    </div>
                    <div className="text-sm flex items-center justify-end">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="12" cy="12" r="1" />  <circle cx="12" cy="19" r="1" />  <circle cx="12" cy="5" r="1" /></svg>
                    </div>
                </TableRow>
                <TableRow>
                    <div className="text-sm col-span-2">
                        Agile Mind
                    </div>
                    <div className="text-sm">
                        25 Epics
                    </div>
                    <div className="text-sm">
                        Avtar
                    </div>
                    <div className="text-sm">
                    In Progress(10%) 
                    </div>
                    <div className="text-sm">
                        09.12.2024
                    </div>
                    <div className="text-sm flex items-center justify-end">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="12" cy="12" r="1" />  <circle cx="12" cy="19" r="1" />  <circle cx="12" cy="5" r="1" /></svg>
                    </div>
                </TableRow>
            
            </div>
        </div>
    );
}