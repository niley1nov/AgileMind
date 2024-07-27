import { useEffect, useState } from "react";
import UserCard from "../components/UserCard";
import { apiClientForAuthReq } from "../services/apiService";
import Spinner from "../components/Spinner";
import PopupMessage from "../components/PopupMessage";
import { useParams, useNavigate } from "react-router-dom";

export default function ViewAssignmentModal({ showModal, onClose }) {
  const [popupMessage, setPopupMessage] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [assignmentList, setAssignmentList] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(function () {
    getAssignmentRecords();
  }, []);

  if (!showModal) return null;

  async function getAssignmentRecords() {
    try {
      setShowSpinner(true);
      const response = await apiClientForAuthReq.get(
        "/project/getProjectAssignments",
        {
          params: { projectId: id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status == "200") {
        setAssignmentList(response.data);
      }
    } catch (error) {
      setPopupMessage(error.message);
      setTimeout(function () {
        setPopupMessage("");
      }, 2000);
      navigate("/login");
      return [];
    } finally {
      setShowSpinner(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <Spinner showSpinner={showSpinner} />
      <PopupMessage message={popupMessage}></PopupMessage>
      <div className="bg-black bg-opacity-75"></div>
      <div className="bg-neutral-800 rounded-lg	shadow-xl transform transition-all sm:max-w-lg sm:w-full overflow-hidden overflow-y-auto">
        <div className="p-4 max-h-svh overflow-y-auto">
          <button
            type="button"
            className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              onClick={onClose}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="mt-3 sm:mt-5">
            {assignmentList.map((assignment, index) => (
              <UserCard
                key={index}
                firstName={assignment.firstName}
                lastName={assignment.lastName}
                email={assignment.email}
                role={assignment.role}
                startDate={assignment.startDate}
                endDate={assignment.endDate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
