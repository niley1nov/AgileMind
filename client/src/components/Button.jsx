
export default function Button({ labelToShow, onClick, className }) {
	return (
		<div>
			<button className={"px-6 py-2 rounded-full text-sm " + className} onClick={onClick}>
				{labelToShow}
			</button>
		</div>
	);
}