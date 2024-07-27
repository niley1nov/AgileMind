export default function SelectInput(param){
    return (
        <div className={param.className}>
            <label htmlFor={param.elementName} className="block text-sm font-medium mb-1">
              {param.labelToShow}
            </label>
            <select
                {...param.register}
                name={param.elementName}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-transparent"
                onChange={param.onInputChange}
                value={param.value}
            >
                <option value="">Select...</option>
               {
                    param.options.map(
                        function(option,index){
                            return <option value={option.value} key={index}>{option.label}</option>                  
                        }
                    )
               } 
            </select>
            <p className="text-xs mt-1">
                {param.supportingText}
            </p>
            <p className="text-xs text-red-700 mt-1">
                {param.errorToShow}
            </p>
        </div>
    );
}