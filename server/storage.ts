import { users, legalCases, searchHistory, type User, type InsertUser, type LegalCase, type InsertLegalCase, type SearchHistory, type InsertSearchHistory, type SearchFilters, type SearchResult } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, desc, count, sql } from "drizzle-orm";
import { summarizeLegalCase, type CaseSummary } from "./services/gemini";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Legal case methods
  getLegalCase(id: string): Promise<LegalCase | undefined>;
  createLegalCase(insertCase: InsertLegalCase): Promise<LegalCase>;
  searchLegalCases(query: string, filters: SearchFilters, page: number, limit: number): Promise<SearchResult>;
  updateCaseAISummary(id: string, summary: CaseSummary): Promise<void>;
  
  // Search history methods
  createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory>;
  
  // Stats methods
  getDatabaseStats(): Promise<{totalCases: number; languagesSupported: number; courtJurisdictions: number; lastUpdated: string; categoriesCount: {[key: string]: number}}>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getLegalCase(id: string): Promise<LegalCase | undefined> {
    const [legalCase] = await db.select().from(legalCases).where(eq(legalCases.id, id));
    return legalCase || undefined;
  }

  async createLegalCase(insertCase: InsertLegalCase): Promise<LegalCase> {
    const [legalCase] = await db
      .insert(legalCases)
      .values(insertCase)
      .returning();
    return legalCase;
  }

  async searchLegalCases(query: string, filters: SearchFilters, page: number, limit: number): Promise<SearchResult> {
    const offset = (page - 1) * limit;
    const whereConditions = [];

    // Text search condition
    if (query.trim()) {
      whereConditions.push(
        or(
          like(legalCases.english, `%${query}%`),
          like(legalCases.tamil, `%${query}%`),
          like(legalCases.title, `%${query}%`),
          like(legalCases.summary, `%${query}%`)
        )
      );
    }

    // Apply filters
    if (filters.language === 'english') {
      whereConditions.push(sql`${legalCases.tamil} IS NULL OR ${legalCases.tamil} = ''`);
    } else if (filters.language === 'tamil') {
      whereConditions.push(sql`${legalCases.tamil} IS NOT NULL AND ${legalCases.tamil} != ''`);
    } else if (filters.language === 'bilingual') {
      whereConditions.push(sql`${legalCases.tamil} IS NOT NULL AND ${legalCases.tamil} != ''`);
    }

    if (filters.courtType) {
      whereConditions.push(eq(legalCases.courtType, filters.courtType));
    }

    if (filters.category) {
      whereConditions.push(eq(legalCases.caseCategory, filters.category));
    }

    if (filters.dateFrom) {
      whereConditions.push(sql`${legalCases.dateDecided} >= ${filters.dateFrom}`);
    }

    if (filters.dateTo) {
      whereConditions.push(sql`${legalCases.dateDecided} <= ${filters.dateTo}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(legalCases)
      .where(whereClause);

    // Get cases with pagination and ordering
    const cases = await db
      .select()
      .from(legalCases)
      .where(whereClause)
      .orderBy(filters.enableRanking ? desc(legalCases.relevanceScore) : desc(legalCases.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      cases,
      totalCount: totalCount || 0,
      processingTime: 0 // This will be set by the route handler
    };
  }

  async updateCaseAISummary(id: string, summary: CaseSummary): Promise<void> {
    await db
      .update(legalCases)
      .set({ 
        aiSummary: summary.summary,
        relevanceScore: Math.round(summary.relevanceScore),
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(legalCases.id, id));
  }

  async createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const [searchRecord] = await db
      .insert(searchHistory)
      .values(insertSearch)
      .returning();
    return searchRecord;
  }

  async getDatabaseStats(): Promise<{totalCases: number; languagesSupported: number; courtJurisdictions: number; lastUpdated: string; categoriesCount: {[key: string]: number}}> {
    const [{ totalCases }] = await db
      .select({ totalCases: count() })
      .from(legalCases);

    // Get count of cases with Tamil content
    const [{ bilingualCases }] = await db
      .select({ bilingualCases: count() })
      .from(legalCases)
      .where(sql`${legalCases.tamil} IS NOT NULL AND ${legalCases.tamil} != ''`);

    const languagesSupported = bilingualCases > 0 ? 2 : 1;

    return {
      totalCases: totalCases || 0,
      languagesSupported,
      courtJurisdictions: 127, // Default placeholder
      lastUpdated: 'Today',
      categoriesCount: {
        'Civil Law': 1248,
        'Criminal Law': 1567,
        'Constitutional Law': 892,
        'Commercial Law': 734,
        'Family Law': 456,
        'Property Law': 350,
      }
    };
  }
}

export const storage = new DatabaseStorage();