export default function NumberInput(param){
    return (
        <div className={param.className}>
            <label htmlFor={param.elementName} className="block text-sm font-medium mb-1">
              {param.labelToShow}
            </label>
            <input
              {...param.register}
              type="number"
              name={param.elementName}
              placeholder={param.placeholder}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-transparent"
              onChange={param.onInputChange}
              value={param.value}
              maxLength={param.maxLength}
              readOnly={param.readOnly}
            />
            <p className="text-xs mt-1">
                {param.supportingText}
            </p>
            <p className="text-xs text-red-700 mt-1">
                {param.errorToShow}
            </p>
        </div>
    );
}