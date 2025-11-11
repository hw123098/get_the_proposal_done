import React from 'react';
import type { TreeNode, NetworkData, Paper, CollectedPaper } from '../types';
import { TreeView } from './TreeView';
import { LiteraturePanel } from './LiteraturePanel';
import { NetworkView } from './NetworkView';
import { ITERATION_LIMIT } from '../constants';
import { RefreshIcon } from './icons/RefreshIcon';

interface ResearchExplorerProps {
    trees: TreeNode[];
    networkData: NetworkData | null;
    selectedNodeForLiterature: TreeNode | null;
    selectedForNetwork: Set<string>;
    collectedPapers: CollectedPaper[];
    iterations: number;
    isLoading: boolean;
    loadingMessage: string;
    onNodeSelectForLiterature: (node: TreeNode) => void;
    onNodeExpand: (nodeId: string, parentKeyword: string) => void;
    onNodeCheck: (keyword: string, isChecked: boolean) => void;
    onUpdateNetwork: () => void;
    onToggleCollectPaper: (paper: Paper, sourceKeyword: string) => void;
    onRefreshTree: (keyword: string) => void;
}

export const ResearchExplorer: React.FC<ResearchExplorerProps> = ({
    trees,
    networkData,
    selectedNodeForLiterature,
    selectedForNetwork,
    collectedPapers,
    iterations,
    isLoading,
    loadingMessage,
    onNodeSelectForLiterature,
    onNodeExpand,
    onNodeCheck,
    onUpdateNetwork,
    onToggleCollectPaper,
    onRefreshTree,
}) => {
    return (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 lg:gap-6 animate-fade-in min-h-0">
            {/* Left Panel: Trees */}
            <div className="lg:col-span-3 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col min-h-[400px] lg:min-h-0 mb-6 lg:mb-0 shadow-lg">
                <h2 className="text-lg font-bold text-slate-200 mb-4 px-2">Topic Trees</h2>
                <div className="flex-grow overflow-auto p-2 -mr-2 pr-4 space-y-4">
                    {trees.map(tree => (
                        <details key={tree.id} open className="bg-slate-900/70 p-2 rounded-lg">
                            <summary className="font-semibold cursor-pointer text-slate-300 hover:text-white flex justify-between items-center list-inside">
                                <span>{tree.keyword}</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onRefreshTree(tree.keyword);
                                    }}
                                    disabled={isLoading}
                                    className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Refresh topic tree for ${tree.keyword}`}
                                    title={`Refresh topic tree for ${tree.keyword}`}
                                >
                                    <RefreshIcon className={`w-4 h-4 ${isLoading && loadingMessage.includes(tree.keyword) ? 'animate-spin' : ''}`} />
                                </button>
                            </summary>
                            <div className="mt-2">
                                <TreeView
                                    node={tree}
                                    selectedNodeId={selectedNodeForLiterature?.id}
                                    checkedKeywords={selectedForNetwork}
                                    onNodeSelect={onNodeSelectForLiterature}
                                    onNodeExpand={onNodeExpand}
                                    onNodeCheck={onNodeCheck}
                                />
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            {/* Middle Panel: Network View */}
            <div className="lg:col-span-5 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col min-h-[500px] lg:min-h-0 mb-6 lg:mb-0 shadow-lg">
                <div className="flex justify-between items-center mb-4 px-2 flex-wrap gap-2">
                     <h2 className="text-lg font-bold text-slate-200">Keyword Network</h2>
                     <button
                        onClick={onUpdateNetwork}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-2 px-3 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                        {isLoading && loadingMessage.includes('network') ? (
                            <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                            </>
                        ) : 'Update Network'}
                    </button>
                    <div className="text-sm text-slate-400 font-mono">
                        Ops: <span className="font-bold text-slate-200">{iterations}</span> / {ITERATION_LIMIT}
                    </div>
                </div>
                 <div className="flex-grow overflow-hidden p-2 relative bg-slate-900/50 rounded-lg">
                    {networkData ? <NetworkView data={networkData} /> : <div className="text-slate-500 flex items-center justify-center h-full">Network graph will appear here.</div>}
                </div>
            </div>

            {/* Right Panel: Literature */}
            <div className="lg:col-span-4 min-h-0">
                 <LiteraturePanel 
                    node={selectedNodeForLiterature}
                    collectedPapers={collectedPapers}
                    onToggleCollect={onToggleCollectPaper}
                />
            </div>
        </div>
    );
};