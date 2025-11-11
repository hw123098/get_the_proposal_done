import React, { useState, useCallback } from 'react';
import type { TreeNode, NetworkData, Paper, CollectedPaper } from './types';
import { Header } from './components/Header';
import { KeywordInput } from './components/KeywordInput';
import { ResearchExplorer } from './components/ResearchExplorer';
import { generateInitialTree, expandTreeNode, findLiterature, generateKeywordNetwork } from './services/geminiService';
import { ITERATION_LIMIT } from './constants';

const App: React.FC = () => {
  const [trees, setTrees] = useState<TreeNode[]>([]);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [selectedNodeForLiterature, setSelectedNodeForLiterature] = useState<TreeNode | null>(null);
  const [selectedForNetwork, setSelectedForNetwork] = useState<Set<string>>(new Set());
  const [collectedPapers, setCollectedPapers] = useState<CollectedPaper[]>([]);
  
  const [iterations, setIterations] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string>('');

  const handleSearch = useCallback(async (keywords: string[]) => {
    if (keywords.length === 0) return;
    setIsLoading(true);
    setError('');
    setTrees([]);
    setNetworkData(null);
    setSelectedNodeForLiterature(null);
    setSelectedForNetwork(new Set(keywords));
    setIterations(0);
    
    try {
      setLoadingMessage('Generating keyword network...');
      const networkPromise = generateKeywordNetwork(keywords);
      
      setLoadingMessage('Generating topic trees for each keyword...');
      const treePromises = keywords.map(k => generateInitialTree(k));

      const [edges, initialTrees] = await Promise.all([networkPromise, Promise.all(treePromises)]);
      
      setNetworkData({
        nodes: keywords.map(k => ({ id: k, label: k })),
        edges,
      });
      setTrees(initialTrees);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const findAndModifyNode = (nodes: TreeNode[], nodeId: string, updates: Partial<TreeNode>): TreeNode[] => {
    return nodes.map(node => {
        if (node.id === nodeId) {
            return { ...node, ...updates };
        }
        if (node.children && node.children.length > 0) {
            return { ...node, children: findAndModifyNode(node.children, nodeId, updates) };
        }
        return node;
    });
  };

  const handleNodeSelectForLiterature = useCallback(async (node: TreeNode) => {
    setSelectedNodeForLiterature(node);
    if (!node.literature && !node.isLoading) {
      setTrees(prevTrees => findAndModifyNode(prevTrees, node.id, { isLoading: true }));

      try {
        const papers = await findLiterature(node.keyword);
        setTrees(prevTrees => {
          const newTrees = findAndModifyNode(prevTrees, node.id, { literature: papers, isLoading: false });
          // Update the selected node state as well to trigger re-render in literature panel
          setSelectedNodeForLiterature(prevNode => prevNode?.id === node.id ? { ...prevNode, literature: papers, isLoading: false } : prevNode);
          return newTrees;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch literature.');
        setTrees(prevTrees => findAndModifyNode(prevTrees, node.id, { isLoading: false }));
      }
    }
  }, []);
  
  const handleNodeExpand = useCallback(async (nodeId: string, parentKeyword: string) => {
    if (iterations >= ITERATION_LIMIT) {
        setError(`Iteration limit of ${ITERATION_LIMIT} reached.`);
        return;
    }

    setTrees(prevTrees => findAndModifyNode(prevTrees, nodeId, { isLoading: true }));
    
    try {
        const newKeywords = await expandTreeNode(parentKeyword);
        const newChildren: TreeNode[] = newKeywords.map((item, index) => ({
            id: `${nodeId}-${item.keyword.toLowerCase().replace(/\s+/g, '-')}-${index}`,
            keyword: item.keyword,
            label: item.label as any,
            children: [],
        }));

        setTrees(prevTrees => findAndModifyNode(prevTrees, nodeId, { children: newChildren, isLoading: false }));
        setIterations(prev => prev + 1);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to expand node.');
        setTrees(prevTrees => findAndModifyNode(prevTrees, nodeId, { isLoading: false }));
    }
  }, [iterations]);

  const handleNodeCheck = useCallback((keyword: string, isChecked: boolean) => {
    setSelectedForNetwork(prev => {
        const newSet = new Set(prev);
        if (isChecked) {
            newSet.add(keyword);
        } else {
            newSet.delete(keyword);
        }
        return newSet;
    });
  }, []);

  const handleUpdateNetwork = useCallback(async () => {
    if (iterations >= ITERATION_LIMIT) {
        setError(`Iteration limit of ${ITERATION_LIMIT} reached.`);
        return;
    }
    // FIX: Use spread syntax to convert Set to array, which has better type inference than Array.from in some environments.
     const keywords = [...selectedForNetwork];
     if (keywords.length < 2) {
        setError("Select at least two keywords to form a network.");
        return;
     }
     setIsLoading(true);
     setLoadingMessage("Updating keyword network...");
     setError('');
     try {
        const edges = await generateKeywordNetwork(keywords);
        setNetworkData({
            nodes: keywords.map(k => ({ id: k, label: k })),
            edges
        });
        setIterations(prev => prev + 1);
     } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update network.');
     } finally {
        setIsLoading(false);
        setLoadingMessage('');
     }
  }, [selectedForNetwork, iterations]);

  const handleToggleCollectPaper = useCallback((paper: Paper, sourceKeyword: string) => {
    setCollectedPapers(prev => {
        const existingIndex = prev.findIndex(item => item.paper.title === paper.title);
        if (existingIndex > -1) {
            return prev.filter((_, index) => index !== existingIndex);
        } else {
            return [...prev, { paper, sourceKeyword }];
        }
    });
  }, []);

  const handleRefreshTree = useCallback(async (keywordToRefresh: string) => {
    setIsLoading(true);
    setLoadingMessage(`Refreshing tree for "${keywordToRefresh}"...`);
    setError('');
    try {
        const newTree = await generateInitialTree(keywordToRefresh);
        setTrees(prevTrees => prevTrees.map(tree => tree.keyword === keywordToRefresh ? newTree : tree));
    } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to refresh tree for "${keywordToRefresh}".`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, []);

  const handleExportJson = () => {
    if (!networkData && trees.length === 0 && collectedPapers.length === 0) {
      alert("No data to export.");
      return;
    }
    const exportData = {
      network: networkData,
      trees: trees,
      collection: collectedPapers,
      createdAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-explorer-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportNetworkPng = () => {
    const svgElement = document.getElementById('network-svg-view');
    if (!svgElement) {
        alert("Network graph not found.");
        return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        // Add a margin for better aesthetics
        const margin = 50;
        canvas.width = img.width + margin * 2;
        canvas.height = img.height + margin * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Fill background
            ctx.fillStyle = '#0f172a'; // bg-slate-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, margin, margin);

            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `research-network-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
        }
        URL.revokeObjectURL(url);
    };
    img.onerror = () => {
        alert("Failed to load SVG image for export.");
        URL.revokeObjectURL(url);
    };
    img.src = url;
};


  const hasData = trees.length > 0 || networkData;

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header onExportJson={handleExportJson} onExportNetworkPng={handleExportNetworkPng} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        {!hasData && !isLoading && <KeywordInput onSearch={handleSearch} />}
        {isLoading && !hasData && (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-cyan-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-slate-300">{loadingMessage || 'Generating initial research map...'}</p>
            </div>
          </div>
        )}
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4 text-center">{error}</div>}
        
        {hasData && (
          <ResearchExplorer
            trees={trees}
            networkData={networkData}
            selectedNodeForLiterature={selectedNodeForLiterature}
            selectedForNetwork={selectedForNetwork}
            collectedPapers={collectedPapers}
            iterations={iterations}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            onNodeSelectForLiterature={handleNodeSelectForLiterature}
            onNodeExpand={handleNodeExpand}
            onNodeCheck={handleNodeCheck}
            onUpdateNetwork={handleUpdateNetwork}
            onToggleCollectPaper={handleToggleCollectPaper}
            onRefreshTree={handleRefreshTree}
          />
        )}
      </main>
    </div>
  );
};

export default App;