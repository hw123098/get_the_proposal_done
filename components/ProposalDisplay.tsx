
import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ProposalDisplayProps {
  proposal: string;
  isLoading: boolean;
  error: string;
}

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <SparklesIcon className="w-16 h-16 text-cyan-400 animate-pulse" />
    <h3 className="mt-4 text-lg font-semibold text-slate-200">Crafting your proposal...</h3>
    <p className="mt-2 text-sm text-slate-400">The AI is warming up its virtual pen. This might take a moment.</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 border-2 border-slate-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-slate-200">Your Proposal Awaits</h3>
    <p className="mt-2 text-sm text-slate-400">Fill out the form on the left to generate your professional proposal.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="text-lg font-semibold text-red-300">An Error Occurred</h3>
    <p className="mt-2 text-sm text-red-400">{message}</p>
  </div>
);

export const ProposalDisplay: React.FC<ProposalDisplayProps> = ({ proposal, isLoading, error }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal);
    setIsCopied(true);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!proposal) return <InitialState />;
    
    return (
      <>
        <div className="absolute top-4 right-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 px-3 rounded-md transition-colors text-sm"
          >
            <ClipboardIcon className="w-4 h-4" />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div 
            className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-100 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: proposal.replace(/\n/g, '<br />') }} // A simple way to render markdown-like newlines
        >
        </div>
      </>
    );
  };
  
  return (
    <div className="relative bg-slate-800/50 p-6 rounded-xl border border-slate-700 min-h-[500px] lg:min-h-full flex flex-col mt-8 lg:mt-0">
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
