import {useEffect, useCallback, useState } from "react";
import ActionBar from "../components/ActionBar";
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
import {useParams} from 'react-router-dom';
import PopupMessage from "../components/PopupMessage";
import { apiClientForAuthReq } from "../services/apiService";


const connectionLineStyle = { stroke: "#fff" };
const snapGrid = [20, 20];
const nodeTypes = { textinput: TextNode };

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const DependencyGraphPage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [epicName, setEpicName] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const [modelOutput, setModelOutput] = useState({});

    const {id} = useParams();


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


    useEffect(() => {
        getEpicRelatedData();
        const roots = [];
        const predOf = {};
        for (const story in modelOutput) {
            if (modelOutput[story].deps.length === 0) {
                roots.push(story);
            }
            predOf[story] = [];
        }

        for (const story in modelOutput) {
            for (const dep of modelOutput[story].deps) {
                if (!predOf[dep]) {
                    predOf[dep] = [];
                }
                predOf[dep].push([story, modelOutput[dep].points]);
            }
        }

        const xTopology = findLongestPaths(predOf, roots);

        const yTopology = {};
        const yt = {};

        for (let story in modelOutput) {
            if (!yt[xTopology[story]]) {
                yt[xTopology[story]] = 1;
            } else {
                yt[xTopology[story]] += 1;
            }
            yTopology[story] = yt[xTopology[story]];
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
                data: { label: story, points: modelOutput[story].points },
                position: { x: 100 * xTopology[story], y: 150 * yTopology[story] },
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


    async function getEpicRelatedData(){
        try{
            const response = await apiClientForAuthReq.get("/epic/getStoryDependencyData", {
              params: {epicId : id},
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if(response.status =="200"){
                setEpicName(response.data.epicName);
                setModelOutput(response.data.storyDependencies);
            }
        }catch(error){
            setPopupMessage(error.message);
            setTimeout(function(){setPopupMessage("")},2000);
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
            connectionLineStyle={connectionLineStyle}
            snapToGrid={true}
            snapGrid={snapGrid}
            defaultViewport={defaultViewport}
            fitView
            attributionPosition="bottom-left">
                <div className="px-20 text-white">
                <PopupMessage message={popupMessage}></PopupMessage>
                    <div className="flex flex-col w-full h-full">
                        <div className="pt-8">
                            <ActionBar textToShow={`Epic: ${epicName}`}>
                            </ActionBar>
                        </div>
                    </div> 
                </div>
        </ReactFlow>
        
    );
};

export default DependencyGraphPage;
