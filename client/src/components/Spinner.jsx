
export default function Spinner({ showSpinner }) {
	if (!showSpinner) return null;
	return (
		<div className="fixed inset-0 flex items-center justify-center space-x-2 bg-black bg-opacity-50">
			<div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
		</div>
	);
}

