import { memo } from "react";
import { Handle, useStore, Position, useReactFlow } from "@xyflow/react";

const TextNode = memo(function TextNode({ sourcePosition, targetPosition, data }) {
	const { setNodes } = useReactFlow();

	return (
		<>
			<div
				className={`wrapper gradient ${data.highlighted ? "highlighted" : "normal"
					}`}
			>
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
