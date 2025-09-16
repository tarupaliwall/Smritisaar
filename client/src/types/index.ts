export interface LegalCase {
  id: string;
  english: string;
  tamil: string | null;
  batch: number;
  sentenceNumber: number;
  docId: string;
  caseTitle: string;
  courtType: string;
  jurisdiction: string;
  judge: string | null;
  caseDate: string;
  caseType: string;
  tags: string[];
  aiSummary: string | null;
  relevanceScore: number;
  createdAt: string;
}

export interface SearchFilters {
  courtType?: string;
  jurisdiction?: string;
  caseType?: string;
  dateFrom?: string;
  dateTo?: string;
  judge?: string;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  cases: LegalCase[];
  total: number;
  page: number;
  totalPages: number;
  processingSteps: string[];
}

export interface FilterOptions {
  courtTypes: string[];
  jurisdictions: string[];
  caseTypes: string[];
  judges: string[];
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface PipelineStep {
  id: string;
  icon: string;
  title: string;
  description: string;
  active: boolean;
}
