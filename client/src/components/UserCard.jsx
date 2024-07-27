import { formatDate } from "../utils/formatUtils.js";

export default function UserCard({firstName, lastName, email, role, startDate, endDate}){
     return (
        <div className="max-w-sm mx-auto shadow-lg rounded-lg overflow-hidden bg-neutral-900 mb-2">
              <div className="px-6 py-4">
                <h2 className="text-xl font-semibold mb-2">{`${firstName} ${lastName}`}</h2>
                <p className="text-white text-base">
                  <strong>Email:</strong> {email}
                </p>
                <p className="text-white text-base">
                  <strong>Role:</strong> {role}
                </p>
                <p className="text-white text-base">
                  <strong>Start Date:</strong> {formatDate(new Date(startDate))}
                </p>
                <p className="text-white text-base">
                  <strong>End Date:</strong> {formatDate(new Date(endDate))}
                </p>
              </div>
        </div>
     );
}