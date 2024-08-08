import { useEffect, useState } from "react";
import debounce from "../utils/debounce";

export default function SearchInput(param) {
	const [suggestions, setSuggestions] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [isValueSelected, setIsValueSelected] = useState(false);

	useEffect(() => {
		setSuggestions([]);
		setInputValue(param.value ? param.value : "");
		setIsValueSelected(false);
	}, [param])

	useEffect(() => {
		if (!isValueSelected && !param.readOnly) {
			const debouncedSearch = debounce(async function () {
				if (inputValue) {
					const result = await param.searchInDataBase(inputValue);
					setSuggestions(result);
				} else {
					setSuggestions([]);
				}

			}, 500);
			debouncedSearch();
		}

	}, [inputValue]);

	function onInputChange(event) {
		setIsValueSelected(false);
		setInputValue(event.target.value);
	}

	function selectValue(event) {
		setIsValueSelected(true);
		if (param.onSearchSelect) {
			param.onSearchSelect(event.target.innerHTML);
		}
		setInputValue(event.target.innerHTML);
		setSuggestions([]);
	}



	return (
		<div className={param.className}>
			<label htmlFor={param.elementName} className="block text-sm font-medium mb-1">
				{param.labelToShow}
			</label>
			<input
				{...param.register}
				type="text"
				name={param.elementName}
				placeholder={param.placeholder}
				className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-transparent"
				onChange={onInputChange}
				autoComplete="off"
				value={inputValue}
				readOnly={param.readOnly}
			/>
			<p className="text-xs mt-1">
				{param.supportingText}
			</p>
			<p className="text-xs text-red-700 mt-1">
				{param.errorToShow}
			</p>
			{suggestions.length > 0 && (
				<ul>
					{suggestions.map((suggestion) => (
						<li key={suggestion.key} onClick={selectValue} className="rounded-full bg-slate-300 hover:bg-slate-500 text-gray-700 px-4 my-2 cursor-pointer">
							{suggestion.value}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}


