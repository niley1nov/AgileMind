
export default function PopupMessage({ message }) {
	if (!message) return null;
	return (
		<div className="fixed inset-0 flex items-start justify-center mt-4 z-20">
			<div className="bg-white p-5 rounded-lg shadow-lg relative w-1/2 text-red-700">
				<p>{message}</p>
			</div>
		</div>
	);
}

