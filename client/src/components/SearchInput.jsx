import { useState } from "react";

export default function SearchInput(param){
   const [suggestions, setSuggestions] = useState([]);
   const [selectedUserEmail, setSelectedUserEmail] = useState("");


   function searchInDataBase(event){
      setSelectedUserEmail(event.target.value);
      setSuggestions([{_id: 'test1', email: 'testEmail1'},{_id: 'test2', email: 'testEmail2'}]);
   }

   function selectUser(event){
      setSelectedUserEmail(event.target.innerHTML);
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
            onChange={searchInDataBase}
            value={selectedUserEmail}
        />
         <p className="text-xs mt-1">
            {param.supportingText}
         </p>
         <p className="text-xs text-red-700 mt-1">
            {param.errorToShow}
         </p>
         {suggestions.length > 0 && (
        <ul>
          {suggestions.map((user) => (
            <li key={user._id} onClick={selectUser} className="rounded-full bg-slate-300 hover:bg-slate-500 text-gray-700 px-4 my-2 cursor-pointer">
              {user.email}
            </li>
          ))}
        </ul>
      )}
     </div>
    );
 }