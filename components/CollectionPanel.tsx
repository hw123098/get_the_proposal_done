import React from 'react';
import type { Paper, CollectedPaper } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ExportIcon } from './icons/ExportIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface CollectionPanelProps {
    collectedPapers: CollectedPaper[];
    onRemove: (paper: Paper) => void;
}

const CollectionItem: React.FC<{ item: CollectedPaper; onRemove: (paper: Paper) => void }> = ({ item, onRemove }) => (
    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700/80 animate-fade-in">
        <div className="flex justify-between items-start">
            <div>
                <h5 className="font-semibold text-slate-200 text-sm">{item.paper.title}</h5>
                <p className="text-xs text-slate-400 mt-1">{item.paper.authors.join(', ')} ({item.paper.year})</p>
                <p className="text-xs text-slate-500 mt-1">From: <span className="italic">{item.sourceKeyword}</span></p>
            </div>
            <button onClick={() => onRemove(item.paper)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
)

export const CollectionPanel: React.FC<CollectionPanelProps> = ({ collectedPapers, onRemove }) => {

    const handleExportCsv = () => {
        if (collectedPapers.length === 0) {
            alert("No papers in collection to export.");
            return;
        }

        const headers = ['Title', 'Authors', 'Year', 'Citations', 'URL', 'Source Keyword'];
        const rows = collectedPapers.map(({ paper, sourceKeyword }) => [
            `"${paper.title.replace(/"/g, '""')}"`,
            `"${paper.authors.join('; ')}"`,
            paper.year,
            paper.citations ?? 'N/A',
            paper.url ?? '',
            sourceKeyword
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `research-collection-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (collectedPapers.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
                <BookmarkIcon className="w-12 h-12 text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-200">Your Collection is Empty</h3>
                <p className="mt-2 text-sm text-slate-400">Click the bookmark icon on a paper in the 'Results' tab to save it here.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-400">{collectedPapers.length} paper(s) collected.</p>
                <button 
                    onClick={handleExportCsv}
                    className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 font-medium py-1.5 px-3 rounded-md hover:bg-emerald-500/20 transition-colors text-sm"
                >
                    <ExportIcon className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
            <div className="space-y-3">
                {collectedPapers.map((item, index) => (
                    <CollectionItem key={`${item.paper.title}-${index}`} item={item} onRemove={onRemove} />
                ))}
            </div>
        </div>
    );
};
