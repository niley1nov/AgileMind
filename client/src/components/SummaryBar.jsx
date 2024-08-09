export default function SummaryBar({ children, textToShow, subTextToShow }) {
	return (
		<div className="flex justify-between">
			<div className="flex flex-col space-y-2">
				<div className="text-4xl">
					{textToShow}
				</div>
				<div className="text-sm text-neutral-300">
					{subTextToShow}
				</div>
			</div>
			<div className="flex justify-between space-x-16">
				{children}
			</div>
		</div>
	);
}