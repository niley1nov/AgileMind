export default function TableRow({ children }) {
	return (
		<div className="grid grid-flow-col auto-cols-fr gap-x-3 w-full pl-3 pr-6 py-6 shadow-xl rounded-md bg-neutral-800">
			{children}
		</div>
	);
}