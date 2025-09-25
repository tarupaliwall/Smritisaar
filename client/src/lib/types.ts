export interface LegalCase {
  id: string;
  english: string;
  tamil: string | null;
  batch: string;
  sentenceNumber: number;
  docId: string;
  courtType: string | null;
  caseCategory: string | null;
  dateDecided: string | null;
  title: string | null;
  summary: string | null;
  aiSummary: string | null;
  relevanceScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  language?: string;
  courtType?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  enableAISummary?: boolean;
  enableRanking?: boolean;
}

export interface SearchResult {
  cases: LegalCase[];
  totalCount: number;
  processingTime: number;
  queryAnalysis?: {
    intent: string;
    category: string;
    entities: string[];
    confidence: number;
  };
}

export interface DatabaseStats {
  totalCases: number;
  languagesSupported: number;
  courtJurisdictions: number;
  lastUpdated: string;
  categoriesCount: {
    [key: string]: number;
  };
}

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'processing' | 'pending';
}
