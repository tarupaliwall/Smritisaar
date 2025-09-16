import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "" 
});

export async function summarizeLegalCase(caseText: string): Promise<string> {
  try {
    const prompt = `As a legal expert, provide a concise and accurate summary of the following legal case text. Focus on:
    - Key legal issues and holdings
    - Important precedents established
    - Practical implications for legal practice
    - Main parties and their positions

    Legal Case Text:
    ${caseText}

    Provide a clear, professional summary in 2-3 paragraphs that would be useful for legal research.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Error generating case summary:", error);
    throw new Error("Failed to generate AI summary for legal case");
  }
}

export async function analyzeLegalCase(
  caseText: string, 
  analysisType: 'precedent' | 'comprehensive' | 'summary'
): Promise<string> {
  try {
    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case 'precedent':
        systemPrompt = `You are a legal precedent analysis expert. Analyze the provided legal case text and identify:
        - Legal precedents established or cited
        - How this case affects existing law
        - Future implications for similar cases
        - Key legal principles reinforced or modified`;
        
        userPrompt = `Analyze the precedential value of this legal case:\n\n${caseText}`;
        break;

      case 'comprehensive':
        systemPrompt = `You are a comprehensive legal case analyst. Provide a detailed analysis covering:
        - Case background and context
        - Legal issues presented
        - Court's reasoning and analysis
        - Holding and disposition
        - Significance and implications
        - Related legal concepts`;
        
        userPrompt = `Provide a comprehensive legal analysis of this case:\n\n${caseText}`;
        break;

      case 'summary':
        return await summarizeLegalCase(caseText);

      default:
        throw new Error("Invalid analysis type specified");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: userPrompt,
    });

    return response.text || "Unable to complete legal analysis at this time.";
  } catch (error) {
    console.error("Error analyzing legal case:", error);
    throw new Error(`Failed to perform ${analysisType} analysis of legal case`);
  }
}

export async function extractLegalEntities(caseText: string): Promise<{
  parties: string[];
  courts: string[];
  judges: string[];
  statutes: string[];
  precedents: string[];
}> {
  try {
    const systemPrompt = `You are a legal entity extraction expert. Extract and categorize legal entities from the provided case text.
    Return a JSON response with the following structure:
    {
      "parties": ["array of party names"],
      "courts": ["array of court names"], 
      "judges": ["array of judge names"],
      "statutes": ["array of statute references"],
      "precedents": ["array of case precedents cited"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            parties: { type: "array", items: { type: "string" } },
            courts: { type: "array", items: { type: "string" } },
            judges: { type: "array", items: { type: "string" } },
            statutes: { type: "array", items: { type: "string" } },
            precedents: { type: "array", items: { type: "string" } }
          },
          required: ["parties", "courts", "judges", "statutes", "precedents"]
        }
      },
      contents: `Extract legal entities from this case text:\n\n${caseText}`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error("Error extracting legal entities:", error);
    return {
      parties: [],
      courts: [],
      judges: [],
      statutes: [],
      precedents: []
    };
  }
}

export async function generateLegalKeywords(caseText: string): Promise<string[]> {
  try {
    const systemPrompt = `You are a legal keyword extraction expert. Generate relevant legal keywords and phrases from the provided case text.
    Focus on:
    - Legal concepts and doctrines
    - Areas of law
    - Legal procedures
    - Key legal terms
    
    Return a JSON array of strings containing the most relevant keywords.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        }
      },
      contents: `Extract legal keywords from this case text:\n\n${caseText}`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error generating legal keywords:", error);
    return [];
  }
}

export async function classifyLegalCase(caseText: string): Promise<{
  primaryArea: string;
  secondaryAreas: string[];
  jurisdiction: string;
  courtLevel: string;
  caseType: string;
  confidence: number;
}> {
  try {
    const systemPrompt = `You are a legal case classification expert. Analyze the provided case text and classify it according to legal categories.
    
    Return a JSON response with:
    - primaryArea: The main area of law (e.g., "Criminal Law", "Contract Law", "Constitutional Law")
    - secondaryAreas: Array of related legal areas
    - jurisdiction: Type of jurisdiction (e.g., "Federal", "State", "Civil", "Criminal")
    - courtLevel: Level of court (e.g., "Supreme Court", "High Court", "District Court")
    - caseType: Specific case type (e.g., "Appeal", "Original Jurisdiction", "Writ Petition")
    - confidence: Confidence score from 0.0 to 1.0`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            primaryArea: { type: "string" },
            secondaryAreas: { type: "array", items: { type: "string" } },
            jurisdiction: { type: "string" },
            courtLevel: { type: "string" },
            caseType: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["primaryArea", "secondaryAreas", "jurisdiction", "courtLevel", "caseType", "confidence"]
        }
      },
      contents: `Classify this legal case:\n\n${caseText}`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error("Error classifying legal case:", error);
    return {
      primaryArea: "General Law",
      secondaryAreas: [],
      jurisdiction: "Unknown",
      courtLevel: "Unknown",
      caseType: "Unknown",
      confidence: 0.0
    };
  }
}

export async function translateLegalText(
  text: string, 
  targetLanguage: 'tamil' | 'english'
): Promise<string> {
  try {
    const languageNames = {
      tamil: 'Tamil',
      english: 'English'
    };

    const systemPrompt = `You are a legal translation expert specializing in Indian law. 
    Translate the provided legal text to ${languageNames[targetLanguage]} while:
    - Maintaining legal terminology accuracy
    - Preserving the formal legal tone
    - Keeping legal concepts intact
    - Using appropriate legal vocabulary in the target language`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Translate this legal text to ${languageNames[targetLanguage]}:\n\n${text}`,
    });

    return response.text || "Translation not available at this time.";
  } catch (error) {
    console.error("Error translating legal text:", error);
    throw new Error(`Failed to translate legal text to ${targetLanguage}`);
  }
}

// Enhanced search query processing for legal terms
export async function enhanceLegalQuery(query: string): Promise<{
  enhancedQuery: string;
  legalTerms: string[];
  suggestedFilters: {
    courtType?: string;
    jurisdiction?: string;
    caseType?: string;
  };
}> {
  try {
    const systemPrompt = `You are a legal search query enhancement expert. Analyze the user's legal query and:
    1. Enhance it with proper legal terminology
    2. Identify key legal terms and concepts
    3. Suggest appropriate search filters
    
    Return a JSON response with:
    - enhancedQuery: An improved version of the query with legal terminology
    - legalTerms: Array of key legal terms identified
    - suggestedFilters: Object with suggested filter values for courtType, jurisdiction, caseType`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            enhancedQuery: { type: "string" },
            legalTerms: { type: "array", items: { type: "string" } },
            suggestedFilters: {
              type: "object",
              properties: {
                courtType: { type: "string" },
                jurisdiction: { type: "string" },
                caseType: { type: "string" }
              }
            }
          },
          required: ["enhancedQuery", "legalTerms", "suggestedFilters"]
        }
      },
      contents: `Enhance this legal search query: "${query}"`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error("Error enhancing legal query:", error);
    return {
      enhancedQuery: query,
      legalTerms: [],
      suggestedFilters: {}
    };
  }
}
