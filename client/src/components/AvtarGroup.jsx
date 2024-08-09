import { useEffect, useState } from "react";

export default function AvtarGroup({ imageSize }) {
	const [images, setImage] = useState([]);

	useEffect(function () {
		setImage(["https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"]);
	},
		[]);

	return (
		<div className="flex -space-x-1 overflow-hidden">
			{images.map(function (img) {
				return <img className={`inline-block h-${imageSize} w-${imageSize} rounded-full`} key={img} src={img} />
			})}
		</div>
	);
}