import React, { useState } from 'react';
import type { TreeNode, Paper, CollectedPaper } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PaperCard } from './PaperCard';
import { CollectionPanel } from './CollectionPanel';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface LiteraturePanelProps {
    node: TreeNode | null;
    collectedPapers: CollectedPaper[];
    onToggleCollect: (paper: Paper, sourceKeyword: string) => void;
}

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpenIcon className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-200">Select a Topic</h3>
        <p className="mt-2 text-sm text-slate-400">Click on a topic in the tree view to see related literature and details.</p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-slate-300">Finding relevant literature...</p>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; count?: number, children: React.ReactNode }> = ({ active, onClick, count, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            active
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
    >
        {children}
        {typeof count !== 'undefined' && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-700 text-slate-300'}`}>{count}</span>}
    </button>
)

export const LiteraturePanel: React.FC<LiteraturePanelProps> = ({ node, collectedPapers, onToggleCollect }) => {
    const [activeTab, setActiveTab] = useState<'results' | 'collection'>('results');
    const collectedPaperTitles = new Set(collectedPapers.map(item => item.paper.title));

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex flex-col max-h-[70vh] lg:max-h-full shadow-lg">
            {!node && activeTab === 'results' ? <InitialState /> : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <div className="border-b border-slate-700 w-full">
                            <nav className="-mb-px flex gap-4">
                                <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')}>
                                    <BookOpenIcon className="w-5 h-5" /> Results
                                </TabButton>
                                <TabButton active={activeTab === 'collection'} onClick={() => setActiveTab('collection')} count={collectedPapers.length}>
                                    <BookmarkIcon className="w-5 h-5" /> Collection
                                </TabButton>
                            </nav>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto -mr-2 pr-4">
                        {activeTab === 'results' && (
                            <>
                                {node ? (
                                    <>
                                        <h2 className="text-xl font-bold text-cyan-300 mb-1">{node.keyword}</h2>
                                        <p className="text-sm text-slate-400 mb-6">Key literature for this topic.</p>
                                        <div className="space-y-4">
                                            {node.isLoading && <LoadingState />}
                                            {!node.isLoading && !node.literature?.length && <p className="text-slate-500 text-center py-8">No literature found or fetched yet.</p>}
                                            {node.literature?.map((paper, index) => (
                                                <PaperCard 
                                                    key={`${paper.title}-${index}`} 
                                                    paper={paper} 
                                                    isCollected={collectedPaperTitles.has(paper.title)}
                                                    onToggleCollect={() => onToggleCollect(paper, node.keyword)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <InitialState />
                                )}
                            </>
                        )}
                        {activeTab === 'collection' && (
                           <CollectionPanel
                             collectedPapers={collectedPapers}
                             onRemove={(paper) => onToggleCollect(paper, '')}
                           />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
