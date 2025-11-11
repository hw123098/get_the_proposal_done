import React from 'react';
import type { Paper } from '../types';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface PaperCardProps {
    paper: Paper;
    isCollected: boolean;
    onToggleCollect: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, isCollected, onToggleCollect }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/80 transition-all hover:border-slate-600 hover:bg-slate-800/80 animate-fade-in relative">
        <button 
            onClick={onToggleCollect}
            aria-label={isCollected ? 'Remove from collection' : 'Add to collection'}
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:bg-slate-700 transition-colors"
        >
            <BookmarkIcon className={`w-5 h-5 ${isCollected ? 'text-amber-400 fill-current' : ''}`} />
        </button>
        <h4 className="font-semibold text-slate-100 pr-8">{paper.title}</h4>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
            <span>{paper.authors.join(', ')}</span>
            <span className="font-semibold">{paper.year}</span>
            {paper.citations != null && (
                 <span className="font-semibold">{paper.citations.toLocaleString()} Citations</span>
            )}
        </div>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{paper.abstract}</p>
        {paper.url && (
            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm mt-3 inline-block hover:underline">
                View Source &rarr;
            </a>
        )}
    </div>
);
