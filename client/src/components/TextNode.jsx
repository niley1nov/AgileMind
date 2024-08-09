import { memo } from "react";
import { Handle, useStore, Position, useReactFlow } from "@xyflow/react";

const TextNode = memo(function TextNode({ sourcePosition, targetPosition, data }) {
	const { setNodes } = useReactFlow();
	const dimensions = useStore((s) => {
		const node = s.nodeLookup.get("2-3");

		if (
			!node ||
			!node.width ||
			!node.height ||
			!s.edges.some((edge) => edge.target === data.id)
		) {
			return null;
		}

		return {
			width: node.width,
			height: node.height,
		};
	});

	const updateDimension = (attr) => (event) => {
		setNodes((nds) =>
			nds.map((n) => {
				if (n.id === "2-3") {
					return {
						...n,
						style: {
							...n.style,
							[attr]: parseInt(event.target.value),
						},
					};
				}

				return n;
			})
		);
	};

	return (
		<>
			<div className="wrapper gradient">
				<div className="inner">
					<label>{data.label}</label>
					<input
						type="number"
						value={data.points}
						onChange={data.onChange}
						className="nodrag"
						disabled={true}
					/>
				</div>
			</div>
			{sourcePosition === "right" ? (
				<Handle type="source" position={Position.Right} />
			) : (
				""
			)}
			{targetPosition === "left" ? (
				<Handle type="target" position={Position.Left} />
			) : (
				""
			)}
		</>
	);
});

export default TextNode;
