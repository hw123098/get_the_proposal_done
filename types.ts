export interface Paper {
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  url: string;
  citations?: number;
}

export interface CollectedPaper {
  paper: Paper;
  sourceKeyword: string;
}

export interface TreeNode {
  id: string;
  keyword: string;
  label?: 'hot' | 'classic' | 'niche';
  children: TreeNode[];
  literature?: Paper[];
  isLoading?: boolean;
}

export interface NetworkNode {
  id: string; // keyword
  label: string; // keyword
  group?: string; // root keyword
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  from: string;
  to: string;
  label?: string;
}

export interface NetworkData {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
}

export type ViewMode = 'tree' | 'network';

// FIX: Add ProposalFormData interface to resolve import errors in ProposalForm.tsx.
export interface ProposalFormData {
  clientName: string;
  projectTitle: string;
  projectDescription: string;
  deliverables: string;
  timeline: string;
  budget: string;
  tone: string;
}
