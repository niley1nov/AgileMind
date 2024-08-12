import { useEffect, useCallback, useState } from "react";
import {
	ReactFlow,
	useNodesState,
	useEdgesState,
	addEdge,
	MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TextNode from "../components/TextNode";
import "../css/dependencyGraph.css";
import { useParams } from 'react-router-dom';
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";

const connectionLineStyle = { stroke: "#fff" };
const snapGrid = [20, 20];
const nodeTypes = { textinput: TextNode };

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const DependencyGraphPage = () => {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [popupMessage, setPopupMessage] = useState("");
	const [modelOutput, setModelOutput] = useState({});

	const { id } = useParams();


	function topologicalSort(graph) {
		const inDegree = {};
		Object.keys(graph).forEach((node) => {
			inDegree[node] = 0;
		});

		Object.keys(graph).forEach((node) => {
			graph[node].forEach(([neighbor, weight]) => {
				inDegree[neighbor] = (inDegree[neighbor] || 0) + 1;
			});
		});

		const queue = [];
		Object.keys(inDegree).forEach((node) => {
			if (inDegree[node] === 0) queue.push(node);
		});

		const topOrder = [];
		while (queue.length > 0) {
			const node = queue.shift();
			topOrder.push(node);
			(graph[node] || []).forEach(([neighbor, weight]) => {
				inDegree[neighbor] -= 1;
				if (inDegree[neighbor] === 0) {
					queue.push(neighbor);
				}
			});
		}

		return topOrder;
	}

	function findLongestPaths(graph, roots) {
		const topOrder = topologicalSort(graph);
		const distances = {};
		Object.keys(graph).forEach((node) => {
			distances[node] = -Infinity;
		});
		roots.forEach((root) => {
			distances[root] = 0;
		});

		topOrder.forEach((node) => {
			if (distances[node] !== -Infinity) {
				(graph[node] || []).forEach(([neighbor, weight]) => {
					if (distances[neighbor] < distances[node] + weight) {
						distances[neighbor] = distances[node] + weight;
					}
				});
			}
		});

		return distances;
	}

	function createMatrix(rows, cols) {
		let matrix = [];
		for (let i = 0; i < rows; i++) {
			matrix.push(Array(cols).fill(null));
		}
		return matrix;
	}

	function truncateString(str, maxLength) {
		if (!str) {
			return "";
		}
		if (str.length <= maxLength) {
			return str;
		} else {
			return str.substring(0, maxLength) + "...";
		}
	}

	useEffect(() => {
		getEpicRelatedData();
		const roots = [];
		const predOf = {};
		let xTopology = {};
		let yTopology = {};
		const yt = {};

		for (const story in modelOutput) {
			if (modelOutput[story].deps.length === 0) {
				roots.push(story);
			}
			predOf[story] = predOf[story] || [];
			for (const dep of modelOutput[story].deps) {
				predOf[dep] = predOf[dep] || [];
				predOf[dep].push([story, modelOutput[dep].points]);
			}
		}

		xTopology = findLongestPaths(predOf, roots);

		for (let story in modelOutput) {
			if (yt[xTopology[story]] == null) {
				yt[xTopology[story]] = 0;
			} else {
				yt[xTopology[story]] += 1;
			}
			yTopology[story] = yt[xTopology[story]];
		}

		const m = Math.max(...Object.values(xTopology)) + 1;
		const n = Math.max(...Object.values(yTopology)) + 3;
		const matrix = createMatrix(m, n);

		for (const story in modelOutput) {
			matrix[xTopology[story]][yTopology[story]] = story;
		}

		for (let i = 1; i < matrix.length; i++) {
			if (matrix[i][0] != null) {
				for (let j = 0; j < matrix[0].length; j++) {
					if (matrix[i][j] != null && matrix[i - 1][j] != null) {
						for (let k = 0; k < matrix[0].length; k++) {
							if (matrix[i - 1][k] == null && matrix[i][k] == null) {
								matrix[i][k] = matrix[i][j];
								matrix[i][j] = null;
								yTopology[matrix[i][k]] = k;
							}
						}
					}
				}
			}
		}

		const nodes = [];
		const edges = [];
		let i = 0;
		for (let story in modelOutput) {
			let source = "";
			let target = "";
			if (modelOutput[story].deps.length === 0) {
				source = "right";
			} else if (predOf[story].length === 0) {
				target = "left";
			} else {
				source = "right";
				target = "left";
			}

			const node = {
				id: String(i),
				type: "textinput",
				data: { label: truncateString(story, 30), points: modelOutput[story].points },
				position: { x: 100 * xTopology[story], y: 160 * yTopology[story] },
			};
			if (source !== "") {
				node["sourcePosition"] = source;
			}
			if (target !== "") {
				node["targetPosition"] = target;
			}
			nodes.push(node);

			for (let dep of predOf[story]) {
				const edge = {
					id: "e" + modelOutput[story].index + "-" + modelOutput[dep[0]].index,
					source: String(modelOutput[story].index),
					target: String(modelOutput[dep[0]].index),
					style: { stroke: "#fff" },
					markerEnd: {
						type: MarkerType.ArrowClosed,
					},
				};
				edges.push(edge);
			}

			i++;
		}
		setNodes(nodes);
		setEdges(edges);
	}, [modelOutput]);

	const handleNodeClick = (event, clickedNode) => {
		const isCurrentlyHighlighted = clickedNode.data.highlighted;

		const newNodes = nodes.map((node) => {
			if (node.id === clickedNode.id) {
				return {
					...node,
					data: {
						...node.data,
						highlighted: !isCurrentlyHighlighted,
					},
				};
			} else {
				const isPredecessor = edges.some(
					(edge) => edge.target === clickedNode.id && edge.source === node.id
				);
				return {
					...node,
					data: {
						...node.data,
						highlighted: isPredecessor && !isCurrentlyHighlighted,
					},
				};
			}
		});

		setNodes(newNodes);
	};

	async function getEpicRelatedData() {
		try {
			const response = await apiClientForAuthReq.get("/epic/getStoryDependencyData", {
				params: { epicId: id },
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			if (response.status == "200" && Object.keys(modelOutput).length === 0) {
				setModelOutput(response.data.storyDependencies);
			}
		} catch (error) {
			setPopupMessage(error.message);
			setTimeout(function () { setPopupMessage("") }, 2000);
		}
	}

	const onConnect = useCallback(
		(params) =>
			setEdges((eds) =>
				addEdge({ ...params, animated: true, style: { stroke: "#fff" } }, eds)
			),
		[]
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			className="bg-neutral-900"
			nodeTypes={nodeTypes}
			onNodeClick={handleNodeClick}
			connectionLineStyle={connectionLineStyle}
			snapToGrid={true}
			snapGrid={snapGrid}
			defaultViewport={defaultViewport}
			fitView
			attributionPosition="bottom-left">
			<div className="px-20 text-white">
				<PopupMessage message={popupMessage}></PopupMessage>
			</div>
		</ReactFlow>

	);
};

export default DependencyGraphPage;
