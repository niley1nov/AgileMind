import TableRow from "./TableRow";

export default function Table({header, rowList}) {
    if(!rowList || rowList.length == 0) return null;
  return (
    <div className="pb-8">
      <div className="grid grid-flow-col auto-cols-fr w-full pl-2 pr-6 py-6 text-neutral-300">
        {
            header.map(function(heading){
                return <div className="text-sm" key={heading.key}>{heading.label}</div>;
            })
        }
      </div>
      <div className="space-y-2">
        {
            rowList.map(function(row,index){
                return (
                    <TableRow key={index}> 
                        {
                            header.map(function(heading){
                                return <div className="text-xs" key={heading.key}>
                                    {row[heading.key]}
                                </div>;
                            })
                        }
                    </TableRow>
                );
            })
        }
      </div>
    </div>
  );
}
