import React, { useMemo, useState } from 'react';
import type { NetworkData, NetworkEdge } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

export const NetworkView: React.FC<{ data: NetworkData }> = ({ data }) => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 500, height: 500 });
    const { nodes, edges } = data;

    const nodePositions = useMemo(() => {
        const posMap = new Map<string, { x: number; y: number }>();
        const numNodes = nodes.length;
        if (numNodes === 0) return posMap;

        const width = 500; // SVG coordinate space
        const height = 500;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 50;

        nodes.forEach((node, i) => {
            if (numNodes === 1) {
                posMap.set(node.id, { x: centerX, y: centerY });
                return;
            }
            const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            posMap.set(node.id, { x, y });
        });
        return posMap;
    }, [nodes]);
    
    const handleZoom = (factor: number) => {
        setViewBox(prev => {
            const newWidth = prev.width * factor;
            const newHeight = prev.height * factor;
            // Center the zoom
            const newX = prev.x - (newWidth - prev.width) / 2;
            const newY = prev.y - (newHeight - prev.height) / 2;
            return { x: newX, y: newY, width: newWidth, height: newHeight };
        });
    };

    const isNodeRelatedToHovered = (nodeId: string) => {
        if (!hoveredNode) return false;
        if (nodeId === hoveredNode) return true;
        return edges.some(edge => 
            (edge.from === hoveredNode && edge.to === nodeId) ||
            (edge.to === hoveredNode && edge.from === nodeId)
        );
    }
    
    const isEdgeRelatedToHovered = (edge: NetworkEdge) => {
         if (!hoveredNode) return false;
         return edge.from === hoveredNode || edge.to === hoveredNode;
    }

    if (nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-center text-slate-500">
                <p>No network to display. Add keywords to get started.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <svg id="network-svg-view" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} className="w-full h-full" onMouseLeave={() => setHoveredNode(null)}>
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"></feGaussianBlur>
                        <feMerge>
                            <feMergeNode in="coloredBlur"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>

                {/* Edges */}
                <g>
                    {edges.map((edge, i) => {
                        const fromPos = nodePositions.get(edge.from);
                        const toPos = nodePositions.get(edge.to);
                        if (!fromPos || !toPos) return null;

                        const isRelated = isEdgeRelatedToHovered(edge);
                        const opacity = hoveredNode ? (isRelated ? '1' : '0.15') : '0.7';

                        // Path for the label
                        const pathId = `edgepath-${i}`;
                        const d = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;

                        return (
                            <g key={`${edge.from}-${edge.to}-${i}`} className="transition-opacity duration-300" style={{ opacity }}>
                                <path id={pathId} d={d} fill="none" />
                                <line
                                    x1={fromPos.x} y1={fromPos.y}
                                    x2={toPos.x} y2={toPos.y}
                                    stroke={isRelated && hoveredNode ? '#0ea5e9' : '#475569'} 
                                    strokeWidth={isRelated && hoveredNode ? '2' : '1.5'}
                                />
                                {edge.label && (
                                    <text dy="-5" textAnchor="middle" fill={isRelated && hoveredNode ? "#94a3b8" : "#64748b"} fontSize="10px" className="font-medium transition-colors">
                                        <textPath href={`#${pathId}`} startOffset="50%">{edge.label}</textPath>
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>

                {/* Nodes */}
                <g>
                    {nodes.map(node => {
                        const pos = nodePositions.get(node.id);
                        if (!pos) return null;

                        const isRelated = isNodeRelatedToHovered(node.id);
                        const opacity = hoveredNode ? (isRelated ? '1' : '0.2') : '1';
                        const isHovered = node.id === hoveredNode;

                        return (
                            <g 
                                key={node.id} 
                                transform={`translate(${pos.x}, ${pos.y})`} 
                                className="cursor-pointer transition-opacity duration-300"
                                style={{ opacity }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                            >
                                <circle 
                                    r={isHovered ? "14" : "12"} 
                                    fill="#0f172a" 
                                    stroke={isHovered ? "#67e8f9" : "#0ea5e9"} 
                                    strokeWidth="2" 
                                    className="transition-all"
                                    style={{ filter: isHovered ? 'url(#glow)' : 'none' }}
                                />
                                <text
                                    y="-22"
                                    textAnchor="middle"
                                    fill={isHovered ? "#e2e8f0" : "#94a3b8"}
                                    fontSize="12px"
                                    className="font-semibold pointer-events-none transition-colors"
                                >
                                    {node.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
            <div className="absolute bottom-1 right-1 flex flex-col gap-1">
                <button 
                    onClick={() => handleZoom(0.8)} 
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/80 text-slate-300 hover:bg-slate-600 rounded-md transition-colors"
                    aria-label="Zoom in"
                    title="Zoom in"
                >
                    <PlusIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => handleZoom(1.25)} 
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/80 text-slate-300 hover:bg-slate-600 rounded-md transition-colors"
                    aria-label="Zoom out"
                    title="Zoom out"
                >
                    <MinusIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};