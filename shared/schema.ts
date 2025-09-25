import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const legalCases = pgTable("legal_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  english: text("english").notNull(),
  tamil: text("tamil"),
  batch: text("batch").notNull(),
  sentenceNumber: integer("sentence_number").notNull(),
  docId: text("doc_id").notNull().unique(),
  courtType: text("court_type"),
  caseCategory: text("case_category"),
  dateDecided: timestamp("date_decided"),
  title: text("title"),
  summary: text("summary"),
  aiSummary: text("ai_summary"),
  relevanceScore: integer("relevance_score").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  docIdIdx: index("doc_id_idx").on(table.docId),
  batchIdx: index("batch_idx").on(table.batch),
  categoryIdx: index("category_idx").on(table.caseCategory),
  courtIdx: index("court_idx").on(table.courtType),
}));

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  filters: text("filters"), // JSON string of filter parameters
  resultCount: integer("result_count").default(0),
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLegalCaseSchema = createInsertSchema(legalCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LegalCase = typeof legalCases.$inferSelect;
export type InsertLegalCase = z.infer<typeof insertLegalCaseSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

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
}
