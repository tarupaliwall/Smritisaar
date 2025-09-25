import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface CaseSummary {
  summary: string;
  keyPoints: string[];
  legalPrinciples: string[];
  relevanceScore: number;
}

export async function summarizeLegalCase(
  english: string, 
  tamil?: string
): Promise<CaseSummary> {
  try {
    const content = tamil ? `English: ${english}\n\nTamil: ${tamil}` : english;
    
    const systemPrompt = `You are a legal expert specializing in Indian law. 
Analyze the provided legal case content and provide a structured summary.
Focus on key legal principles, precedents, and important rulings.
Respond with JSON in this exact format:
{
  "summary": "Concise 2-3 sentence summary of the case",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "legalPrinciples": ["Legal principle 1", "Legal principle 2"],
  "relevanceScore": number_between_1_and_100
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyPoints: { 
              type: "array",
              items: { type: "string" }
            },
            legalPrinciples: {
              type: "array", 
              items: { type: "string" }
            },
            relevanceScore: { type: "number" }
          },
          required: ["summary", "keyPoints", "legalPrinciples", "relevanceScore"],
        },
      },
      contents: content,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: CaseSummary = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error("Failed to summarize legal case:", error);
    return {
      summary: "Summary unavailable due to processing error.",
      keyPoints: [],
      legalPrinciples: [],
      relevanceScore: 0
    };
  }
}

export async function analyzeSearchQuery(query: string): Promise<{
  intent: string;
  category: string;
  entities: string[];
  confidence: number;
}> {
  try {
    const systemPrompt = `You are a legal query analyzer. 
Analyze the user's legal search query and extract:
- intent (what they're looking for)
- category (type of law: civil, criminal, constitutional, commercial, family, property)
- entities (specific legal terms, case names, acts, sections)
- confidence (0-100 how confident you are in the analysis)

Respond with JSON in this format:
{
  "intent": "brief description of what user wants",
  "category": "legal category",
  "entities": ["entity1", "entity2"],
  "confidence": number_0_to_100
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            category: { type: "string" },
            entities: {
              type: "array",
              items: { type: "string" }
            },
            confidence: { type: "number" }
          },
          required: ["intent", "category", "entities", "confidence"],
        },
      },
      contents: query,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error("Failed to analyze search query:", error);
    return {
      intent: "General legal case search",
      category: "general",
      entities: [],
      confidence: 50
    };
  }
}

export async function generateSearchSuggestions(partialQuery: string): Promise<string[]> {
  try {
    const systemPrompt = `You are a legal research assistant. 
Based on the partial query, suggest 5 complete, relevant legal search queries.
Focus on Indian legal cases and common legal research needs.
Respond with JSON array of strings:
["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        },
      },
      contents: `Partial query: "${partialQuery}"`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to generate search suggestions:", error);
    return [];
  }
}
