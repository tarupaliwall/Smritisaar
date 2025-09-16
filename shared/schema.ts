import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const legalCases = pgTable("legal_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  english: text("english").notNull(),
  tamil: text("tamil"),
  batch: integer("batch").notNull(),
  sentenceNumber: integer("sentence_number").notNull(),
  docId: text("doc_id").notNull(),
  caseTitle: text("case_title").notNull(),
  courtType: text("court_type").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  judge: text("judge"),
  caseDate: timestamp("case_date").notNull(),
  caseType: text("case_type").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  aiSummary: text("ai_summary"),
  relevanceScore: integer("relevance_score").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  filters: jsonb("filters").$type<SearchFilters>(),
  resultCount: integer("result_count").default(0),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const insertLegalCaseSchema = createInsertSchema(legalCases).omit({
  id: true,
  aiSummary: true,
  relevanceScore: true,
  createdAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  timestamp: true,
});

export type InsertLegalCase = z.infer<typeof insertLegalCaseSchema>;
export type LegalCase = typeof legalCases.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Search and filter schemas
export const searchFiltersSchema = z.object({
  courtType: z.string().optional(),
  jurisdiction: z.string().optional(),
  caseType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  judge: z.string().optional(),
});

export const searchRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  filters: searchFiltersSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;

export interface SearchResponse {
  cases: LegalCase[];
  total: number;
  page: number;
  totalPages: number;
  processingSteps: string[];
}

export interface CaseAnalysisRequest {
  caseId: string;
  analysisType: 'summary' | 'precedent' | 'full';
}

export interface CaseAnalysisResponse {
  caseId: string;
  analysis: string;
  keyPoints: string[];
  precedents: string[];
  relevantSections: string[];
}
