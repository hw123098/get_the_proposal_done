import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';

interface KeywordInputProps {
    onSearch: (keywords: string[]) => void;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({ onSearch }) => {
    const [keywords, setKeywords] = useState<string[]>(['', '', '']);

    const handleKeywordChange = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
    };

    const addKeywordInput = () => {
        setKeywords([...keywords, '']);
    };

    const removeKeywordInput = (index: number) => {
        if (keywords.length > 1) {
            const newKeywords = keywords.filter((_, i) => i !== index);
            setKeywords(newKeywords);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nonEmptyKeywords = keywords.map(k => k.trim()).filter(k => k !== '');
        if (nonEmptyKeywords.length > 0) {
            onSearch(nonEmptyKeywords);
        }
    };
    
    const hasKeywords = keywords.some(k => k.trim() !== '');

    return (
        <div className="flex-grow flex items-center justify-center animate-fade-in">
            <div className="w-full max-w-2xl text-center">
                <h2 className="text-4xl font-bold text-slate-100 mb-2">Build Your Research Network</h2>
                <p className="text-lg text-slate-400 mb-8">Enter multiple topics to create an initial network map.</p>
                <form onSubmit={handleSubmit} className="w-full text-left p-6 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4">
                    {keywords.map((keyword, index) => (
                       <div key={index} className="flex items-center gap-3">
                            <input 
                                type="text"
                                value={keyword}
                                onChange={(e) => handleKeywordChange(index, e.target.value)}
                                placeholder={`Topic ${index + 1}...`}
                                className="w-full text-lg bg-slate-800 border border-slate-600 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                aria-label={`Research topic input ${index + 1}`}
                            />
                            {keywords.length > 1 && (
                                <button type="button" onClick={() => removeKeywordInput(index)} className="p-2 text-slate-400 hover:text-red-400 transition-colors" aria-label={`Remove Topic ${index + 1}`}>
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            )}
                       </div>
                    ))}
                     <button
                        type="button"
                        onClick={addKeywordInput}
                        className="w-full flex items-center justify-center gap-2 text-sm text-cyan-400 font-medium py-2 px-3 rounded-md hover:bg-cyan-500/10 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add another topic
                    </button>
                </form>

                 <button 
                    type="button"
                    onClick={handleSubmit}
                    className="mt-8 w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                    disabled={!hasKeywords}
                >
                    <SearchIcon className="w-5 h-5" />
                    Build Network
                </button>
            </div>
        </div>
    );
};