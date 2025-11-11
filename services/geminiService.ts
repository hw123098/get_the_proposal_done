import { GoogleGenAI, Type } from "@google/genai";
import type { Paper, TreeNode, NetworkEdge } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const treeNodeSchema = {
    type: Type.OBJECT,
    properties: {
        keyword: { type: Type.STRING, description: "A concise academic keyword or phrase." },
        children: {
            type: Type.ARRAY,
            description: "An array of child keywords. Should contain around 10 items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    keyword: { type: Type.STRING },
                    label: { type: Type.STRING, enum: ['hot', 'classic', 'niche'] },
                },
                required: ['keyword'],
            },
        },
    },
    required: ['keyword', 'children'],
};


export const generateInitialTree = async (rootKeyword: string): Promise<TreeNode> => {
    if (!rootKeyword) {
        throw new Error("Please enter a root keyword to begin.");
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a starting research tree for the academic topic "${rootKeyword}". If the topic is in Chinese, generate a tree in Chinese. The root should be the keyword itself. Create around 10 main branches from this root, each with a relevant sub-keyword. Include a mix of closely related sub-topics and more distinct or tangential ones to encourage broad exploration. Assign a label ('hot', 'classic', or 'niche') to each generated sub-keyword.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: treeNodeSchema,
            },
        });
        
        const data = JSON.parse(response.text);

        const root: TreeNode = {
            id: rootKeyword.toLowerCase().replace(/\s+/g, '-'),
            keyword: rootKeyword,
            children: data.children.map((child: any, index: number) => ({
                id: `${rootKeyword}-${child.keyword}-${index}`.toLowerCase().replace(/\s+/g, '-'),
                keyword: child.keyword,
                label: child.label,
                children: [],
            })),
        };

        return root;

    } catch (error) {
        console.error("Error generating initial tree:", error);
        throw new Error(`Failed to generate research tree for "${rootKeyword}".`);
    }
};

export const expandTreeNode = async (parentKeyword: string): Promise<Omit<TreeNode, 'id' | 'children'>[]> => {
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user wants to expand their research tree from the keyword "${parentKeyword}". If the keyword is in Chinese, generate Chinese results. Generate around 10 new, more specific sub-keywords related to it. Include a diverse range of topics, some closely related and some more tangential. For each, provide a label ('hot', 'classic', or 'niche').`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        expansions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    keyword: { type: Type.STRING },
                                    label: { type: Type.STRING, enum: ['hot', 'classic', 'niche'] },
                                },
                                required: ['keyword'],
                            }
                        }
                    },
                    required: ['expansions']
                },
            },
        });
        
        const data = JSON.parse(response.text);
        return data.expansions;

    } catch (error) {
        console.error("Error expanding tree node:", error);
        throw new Error("Failed to expand the research topic.");
    }
}

export const generateKeywordNetwork = async (keywords: string[]): Promise<NetworkEdge[]> => {
    if (keywords.length < 2) {
        return [];
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Given the following list of academic keywords, identify the direct relationships between them. If they are in Chinese, provide Chinese relationships. Represent these relationships as a list of connections. Each connection is an object with 'from' and 'to' properties, using the exact keyword strings from the input list. Also provide a brief 'label' for the relationship (e.g., 'subfield of', 'intersects with', 'enables'). Only include connections between the provided keywords. Keywords: ${JSON.stringify(keywords)}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        connections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    from: { type: Type.STRING, description: 'One of the provided keywords.' },
                                    to: { type: Type.STRING, description: 'Another one of the provided keywords.' },
                                    label: { type: Type.STRING, description: 'A brief description of the relationship.' },
                                },
                                required: ['from', 'to']
                            }
                        }
                    },
                    required: ['connections']
                }
            }
        });

        const data = JSON.parse(response.text);
        // Filter to ensure the model only returned valid connections
        return data.connections.filter((edge: NetworkEdge) => keywords.includes(edge.from) && keywords.includes(edge.to));

    } catch (error) {
        console.error("Error generating keyword network:", error);
        throw new Error("Failed to generate the keyword network graph.");
    }
};


export const findLiterature = async (keyword: string): Promise<Paper[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `You are a meticulous digital archivist and expert academic librarian. Your most critical and ONLY important task is to provide REAL, VERIFIABLE academic literature. Any fake or inaccessible link is a complete failure of your task.

The user's research topic is: "${keyword}"

**CRITICAL INSTRUCTIONS FOR CHINESE TOPICS:**
If the topic "${keyword}" is in Chinese, you MUST adhere to the following rules without exception:
1.  **Source Limitation:** You are ONLY allowed to provide papers from "Baidu Scholar" (百度学术) and the "National Centre for Philosophy and Social Sciences Documentation" (国家哲学社会科学文献中心).
2.  **URL Verification:** The final URL for each paper MUST point to one of these two domains: \`xueshu.baidu.com\` or \`ncpssd.org\`. No other domain is acceptable for Chinese literature.

**Mandatory Two-Step Verification Process for ALL topics:**
1.  **Step 1 (Find):** Use your search tool to find 8 relevant academic papers on the topic.
2.  **Step 2 (Verify):** For EACH paper you find, you MUST perform a secondary, independent verification. This means taking the exact title of the paper and performing a NEW search to confirm its existence and find its canonical URL on an official academic site. For Chinese topics, this means re-searching to find the link on the two allowed domains.

**Output Format:**
After this rigorous verification process, compile the verified information into a single JSON object.

The JSON object must have a single key "papers", which is an array of paper objects. Each paper object must contain:
- "title": The full title of the paper.
- "authors": An array of author names.
- "year": The publication year as a number.
- "abstract": A concise summary of the paper's key findings.
- "citations": The number of citations (if available).
- "url": The DIRECT and VERIFIABLE URL to the paper's landing page. This is the most critical field.

**ZERO-TOLERANCE POLICY:**
- **DO NOT INVENT PAPERS OR URLS.** If you cannot find and verify a paper according to the process above, DO NOT include it.
- It is better to return fewer, fully verified papers than a list with any unverified or fake entries. If you only find 2 real papers, return only 2.
- The final output should be ONLY the JSON object, enclosed in a \`\`\`json ... \`\`\` markdown block. Do not include any other text.`,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        let rawText = response.text;
        
        if (!rawText) {
            console.error("Model returned no text response for keyword:", keyword);
            const finishReason = response.candidates?.[0]?.finishReason;
            const safetyRatings = response.candidates?.[0]?.safetyRatings;
            console.error("Finish Reason:", finishReason);
            console.error("Safety Ratings:", JSON.stringify(safetyRatings, null, 2));
            throw new Error("Failed to find literature: The model returned an empty response.");
        }
        
        const jsonMatch = rawText.match(/```json([\s\S]*)```|({[\s\S]*})/);
        if (!jsonMatch) {
            console.error("Raw response from model:", rawText);
            throw new Error("Failed to parse JSON from model response. No JSON object found.");
        }
        rawText = jsonMatch[1] || jsonMatch[2];

        const data = JSON.parse(rawText);
        
        if (!data.papers || !Array.isArray(data.papers)) {
            return [];
        }

        // The model now provides the URL directly. We just need to validate the structure.
        const papers: Paper[] = data.papers.filter((p: any): p is Paper => 
            p && typeof p.title === 'string' && typeof p.url === 'string'
        );

        return papers;
    } catch (error) {
        console.error("Error finding literature:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to find literature: The model returned an invalid format.");
        }
        if (error instanceof Error && error.message.startsWith("Failed to find literature:")) {
            throw error;
        }
        throw new Error(`Failed to find literature for "${keyword}".`);
    }
};