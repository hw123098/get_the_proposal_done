import React from 'react';
import type { TreeNode } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface TreeViewProps {
    node: TreeNode;
    selectedNodeId?: string | null;
    checkedKeywords: Set<string>;
    onNodeSelect: (node: TreeNode) => void;
    onNodeExpand: (nodeId: string, parentKeyword: string) => void;
    onNodeCheck: (keyword: string, isChecked: boolean) => void;
    level?: number;
}

const getLabelColor = (label?: string) => {
    switch(label) {
        case 'hot': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
        case 'classic': return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
        case 'niche': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
        default: return 'bg-slate-600/50 text-slate-300 border-slate-600/50';
    }
}

export const TreeView: React.FC<TreeViewProps> = ({ node, selectedNodeId, checkedKeywords, onNodeSelect, onNodeExpand, onNodeCheck, level = 0 }) => {
    const isSelectedForLiterature = node.id === selectedNodeId;
    const isCheckedForNetwork = checkedKeywords.has(node.keyword);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
        <div style={{ marginLeft: level > 0 ? '20px' : '0' }} className="relative">
            {level > 0 && <div className="absolute left-[-12px] top-[-10px] h-full w-px bg-slate-700/50"></div>}
             <div className="flex items-center gap-2 mb-2 relative">
                 {level > 0 && <div className="absolute left-[-12px] top-[18px] w-[10px] h-px bg-slate-700/50"></div>}
                <div 
                    className={`flex-grow flex items-center gap-2 p-2 rounded-md transition-all duration-200 w-full ${isSelectedForLiterature ? 'bg-cyan-500/20 ring-1 ring-cyan-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                >
                    <input
                        type="checkbox"
                        checked={isCheckedForNetwork}
                        onChange={(e) => onNodeCheck(node.keyword, e.target.checked)}
                        className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-grow cursor-pointer" onClick={() => onNodeSelect(node)}>
                        <p className={`font-medium ${isSelectedForLiterature ? 'text-cyan-300' : 'text-slate-200'}`}>{node.keyword}</p>
                    </div>
                    {node.label && <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${getLabelColor(node.label)}`}>{node.label}</span>}
                </div>
                {!hasChildren && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onNodeExpand(node.id, node.keyword);
                        }}
                        disabled={node.isLoading}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                        aria-label={`Expand ${node.keyword}`}
                    >
                        {node.isLoading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <PlusIcon className="w-4 h-4 text-slate-300" />
                        )}
                    </button>
                )}
            </div>

            {hasChildren && (
                <div className="pt-2">
                    {node.children.map(child => (
                        <TreeView 
                            key={child.id} 
                            node={child} 
                            selectedNodeId={selectedNodeId}
                            checkedKeywords={checkedKeywords}
                            onNodeSelect={onNodeSelect}
                            onNodeExpand={onNodeExpand}
                            onNodeCheck={onNodeCheck}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
