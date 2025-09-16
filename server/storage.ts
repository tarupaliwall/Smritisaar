import { type LegalCase, type InsertLegalCase, type SearchHistory, type InsertSearchHistory, type SearchFilters } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Legal Cases
  createLegalCase(case_: InsertLegalCase): Promise<LegalCase>;
  getLegalCase(id: string): Promise<LegalCase | undefined>;
  searchLegalCases(query: string, filters?: SearchFilters, page?: number, limit?: number): Promise<{
    cases: LegalCase[];
    total: number;
  }>;
  updateCaseAISummary(id: string, summary: string, relevanceScore: number): Promise<void>;
  getAllCases(): Promise<LegalCase[]>;
  
  // Search History
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  getRecentSearches(limit?: number): Promise<SearchHistory[]>;
  
  // Filter Options
  getAvailableFilters(): Promise<{
    courtTypes: string[];
    jurisdictions: string[];
    caseTypes: string[];
    judges: string[];
  }>;
}

export class MemStorage implements IStorage {
  private cases: Map<string, LegalCase>;
  private searchHistory: Map<string, SearchHistory>;

  constructor() {
    this.cases = new Map();
    this.searchHistory = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample cases based on the dataset structure
    const sampleCases: InsertLegalCase[] = [
      {
        english: "Commercial lease agreement breach and damages claim in property dispute between ABC Corporation and XYZ Ltd.",
        tamil: "வணிக குத்தகை ஒப்பந்தம் மீறல் மற்றும் சொத்து தகராறில் ABC கார்ப்பரேஷன் மற்றும் XYZ லிமிடெட் இடையே சேத கோரிக்கை",
        batch: 1,
        sentenceNumber: 1,
        docId: "HC_DEL_2023_001",
        caseTitle: "ABC Corporation vs. XYZ Ltd.",
        courtType: "High Court",
        jurisdiction: "Commercial",
        judge: "Justice R.K. Sharma",
        caseDate: new Date("2023-03-15"),
        caseType: "Commercial Law",
        tags: ["Contract Law", "Property", "Commercial"],
      },
      {
        english: "Criminal procedure evidence admissibility standards for digital evidence and chain of custody requirements in criminal cases.",
        tamil: "குற்றவியல் நடைமுறை சான்று ஏற்புடைமை தரநிலைகள் டிஜிட்டல் சான்றுகள் மற்றும் குற்றவியல் வழக்குகளில் சான்று வரிசை தேவைகள்",
        batch: 1,
        sentenceNumber: 2,
        docId: "SC_IND_2024_002",
        caseTitle: "State vs. Rajesh Kumar",
        courtType: "Supreme Court",
        jurisdiction: "Criminal",
        judge: "Justice A.K. Mishra",
        caseDate: new Date("2024-01-08"),
        caseType: "Criminal Law",
        tags: ["Evidence", "Digital", "Procedure"],
      },
      {
        english: "Family law custody determination factors and child welfare considerations in divorce proceedings.",
        tamil: "குடும்ப சட்ட காவல் தீர்மான காரணிகள் மற்றும் விவாகரத்து நடைமுறைகளில் குழந்தை நலன் கருத்துகள்",
        batch: 2,
        sentenceNumber: 1,
        docId: "FC_MUM_2023_003",
        caseTitle: "Priya Sharma vs. Amit Sharma",
        courtType: "Family Court",
        jurisdiction: "Family",
        judge: "Justice M.S. Patel",
        caseDate: new Date("2023-06-20"),
        caseType: "Family Law",
        tags: ["Custody", "Child Welfare", "Divorce"],
      },
      {
        english: "Constitutional law fundamental rights interpretation and state power limitations in emergency provisions.",
        tamil: "அரசியலமைப்பு சட்ட அடிப்படை உரிமைகள் விளக்கம் மற்றும் அவசரகால விதிகளில் மாநில அதிகார வரம்புகள்",
        batch: 2,
        sentenceNumber: 2,
        docId: "SC_IND_2023_004",
        caseTitle: "Citizens Rights Forum vs. Union of India",
        courtType: "Supreme Court",
        jurisdiction: "Constitutional",
        judge: "Justice V.K. Singh",
        caseDate: new Date("2023-09-12"),
        caseType: "Constitutional Law",
        tags: ["Fundamental Rights", "Emergency", "State Power"],
      },
      {
        english: "Trademark infringement and intellectual property rights violation in commercial brand protection case.",
        tamil: "வர்த்தக முத்திரை மீறல் மற்றும் வணிக பிராண்ட் பாதுகாப்பு வழக்கில் அறிவுசார் சொத்து உரிமைகள் மீறல்",
        batch: 3,
        sentenceNumber: 1,
        docId: "HC_DEL_2024_005",
        caseTitle: "TechBrand Inc. vs. CopyTech Ltd.",
        courtType: "High Court",
        jurisdiction: "Commercial",
        judge: "Justice P.R. Gupta",
        caseDate: new Date("2024-02-28"),
        caseType: "Intellectual Property",
        tags: ["Trademark", "IP Rights", "Brand Protection"],
      }
    ];

    sampleCases.forEach(caseData => {
      const id = randomUUID();
      const case_: LegalCase = {
        ...caseData,
        id,
        aiSummary: null,
        relevanceScore: 0,
        createdAt: new Date(),
      };
      this.cases.set(id, case_);
    });
  }

  async createLegalCase(insertCase: InsertLegalCase): Promise<LegalCase> {
    const id = randomUUID();
    const case_: LegalCase = {
      ...insertCase,
      id,
      aiSummary: null,
      relevanceScore: 0,
      createdAt: new Date(),
    };
    this.cases.set(id, case_);
    return case_;
  }

  async getLegalCase(id: string): Promise<LegalCase | undefined> {
    return this.cases.get(id);
  }

  async searchLegalCases(
    query: string, 
    filters?: SearchFilters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ cases: LegalCase[]; total: number }> {
    const queryLower = query.toLowerCase();
    let filteredCases = Array.from(this.cases.values()).filter(case_ => {
      // Text search in English and Tamil content
      const textMatch = case_.english.toLowerCase().includes(queryLower) ||
                       case_.caseTitle.toLowerCase().includes(queryLower) ||
                       (case_.tamil && case_.tamil.toLowerCase().includes(queryLower)) ||
                       case_.tags.some(tag => tag.toLowerCase().includes(queryLower));

      if (!textMatch) return false;

      // Apply filters
      if (filters?.courtType && case_.courtType !== filters.courtType) return false;
      if (filters?.jurisdiction && case_.jurisdiction !== filters.jurisdiction) return false;
      if (filters?.caseType && case_.caseType !== filters.caseType) return false;
      if (filters?.judge && case_.judge !== filters.judge) return false;
      
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (case_.caseDate < fromDate) return false;
      }
      
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo);
        if (case_.caseDate > toDate) return false;
      }

      return true;
    });

    // Sort by relevance (mock scoring based on query match strength)
    filteredCases.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });

    const total = filteredCases.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const cases = filteredCases.slice(startIndex, endIndex);

    return { cases, total };
  }

  private calculateRelevanceScore(case_: LegalCase, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title match (highest weight)
    if (case_.caseTitle.toLowerCase().includes(queryLower)) score += 50;
    
    // English content match
    const englishMatches = (case_.english.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += englishMatches * 10;
    
    // Tag matches
    const tagMatches = case_.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
    score += tagMatches * 20;
    
    // Court type relevance
    if (case_.courtType === "Supreme Court") score += 15;
    else if (case_.courtType === "High Court") score += 10;
    
    return score;
  }

  async updateCaseAISummary(id: string, summary: string, relevanceScore: number): Promise<void> {
    const case_ = this.cases.get(id);
    if (case_) {
      case_.aiSummary = summary;
      case_.relevanceScore = relevanceScore;
      this.cases.set(id, case_);
    }
  }

  async getAllCases(): Promise<LegalCase[]> {
    return Array.from(this.cases.values());
  }

  async createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const search: SearchHistory = {
      ...insertSearch,
      id,
      timestamp: new Date(),
    };
    this.searchHistory.set(id, search);
    return search;
  }

  async getRecentSearches(limit: number = 10): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getAvailableFilters(): Promise<{
    courtTypes: string[];
    jurisdictions: string[];
    caseTypes: string[];
    judges: string[];
  }> {
    const cases = Array.from(this.cases.values());
    return {
      courtTypes: [...new Set(cases.map(c => c.courtType))],
      jurisdictions: [...new Set(cases.map(c => c.jurisdiction))],
      caseTypes: [...new Set(cases.map(c => c.caseType))],
      judges: [...new Set(cases.map(c => c.judge).filter(Boolean))],
    };
  }
}

export const storage = new MemStorage();
