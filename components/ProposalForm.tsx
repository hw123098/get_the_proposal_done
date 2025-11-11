
import React from 'react';
import type { ProposalFormData } from '../types';
import { TONES } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface ProposalFormProps {
  formData: ProposalFormData;
  isLoading: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onToneChange: (tone: string) => void;
  onSubmit: () => void;
}

const InputField: React.FC<{
  label: string;
  name: keyof ProposalFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}> = ({ label, name, value, onChange, placeholder, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
    />
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  name: keyof ProposalFormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
}> = ({ label, name, value, onChange, placeholder, rows = 4, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
    />
  </div>
);

export const ProposalForm: React.FC<ProposalFormProps> = ({
  formData,
  isLoading,
  onFormChange,
  onToneChange,
  onSubmit,
}) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-slate-100">Project Details</h2>
      <div className="space-y-6">
        <InputField label="Client Name" name="clientName" value={formData.clientName} onChange={onFormChange} placeholder="e.g., Acme Corporation" required />
        <InputField label="Project Title" name="projectTitle" value={formData.projectTitle} onChange={onFormChange} placeholder="e.g., New Website Redesign" required />
        <TextAreaField label="Project Description & Goals" name="projectDescription" value={formData.projectDescription} onChange={onFormChange} placeholder="Describe the project's main objectives and what the client wants to achieve." required />
        <TextAreaField label="Key Deliverables" name="deliverables" value={formData.deliverables} onChange={onFormChange} placeholder="List the key deliverables, e.g., Homepage design, 5 content pages, contact form..." required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Timeline" name="timeline" value={formData.timeline} onChange={onFormChange} placeholder="e.g., 4-6 Weeks" />
          <InputField label="Budget" name="budget" value={formData.budget} onChange={onFormChange} placeholder="e.g., $10,000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Tone of Voice</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(tone => (
              <button
                key={tone}
                type="button"
                onClick={() => onToneChange(tone)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  formData.tone === tone
                    ? 'bg-cyan-500 text-white font-semibold shadow-md'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generate Proposal
            </>
          )}
        </button>
      </div>
    </div>
  );
};
