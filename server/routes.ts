import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSearchHistorySchema, type SearchFilters } from "@shared/schema";
import { summarizeLegalCase, analyzeSearchQuery, generateSearchSuggestions } from "./services/gemini";

const searchQuerySchema = z.object({
  query: z.string().min(1),
  filters: z.object({
    language: z.string().optional(),
    courtType: z.string().optional(),
    category: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    enableAISummary: z.boolean().optional(),
    enableRanking: z.boolean().optional(),
  }).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search legal cases
  app.post("/api/search", async (req, res) => {
    try {
      const startTime = Date.now();
      const { query, filters = {}, page = 1, limit = 10 } = searchQuerySchema.parse(req.body);

      // Analyze query with Gemini AI
      const queryAnalysis = await analyzeSearchQuery(query);
      
      // Search cases with filters
      const searchResult = await storage.searchLegalCases(query, filters, page, limit);
      
      // Generate AI summaries if enabled
      if (filters.enableAISummary) {
        for (const legalCase of searchResult.cases) {
          if (!legalCase.aiSummary) {
            const summary = await summarizeLegalCase(legalCase.english, legalCase.tamil || undefined);
            await storage.updateCaseAISummary(legalCase.id, summary);
            legalCase.aiSummary = summary.summary;
          }
        }
      }

      const processingTime = Date.now() - startTime;

      // Save search history
      await storage.createSearchHistory({
        query,
        filters: JSON.stringify(filters),
        resultCount: searchResult.totalCount,
        processingTime,
      });

      res.json({
        ...searchResult,
        processingTime,
        queryAnalysis,
      });

    } catch (error) {
      console.error("Search error:", error);
      res.status(400).json({ 
        error: "Search failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get search suggestions
  app.post("/api/search/suggestions", async (req, res) => {
    try {
      const { query } = z.object({ query: z.string() }).parse(req.body);
      const suggestions = await generateSearchSuggestions(query);
      res.json({ suggestions });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(400).json({ 
        error: "Failed to generate suggestions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get case by ID
  app.get("/api/cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const legalCase = await storage.getLegalCase(id);
      
      if (!legalCase) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Generate AI summary if not exists
      if (!legalCase.aiSummary) {
        const summary = await summarizeLegalCase(legalCase.english, legalCase.tamil || undefined);
        await storage.updateCaseAISummary(legalCase.id, summary);
        legalCase.aiSummary = summary.summary;
      }

      res.json(legalCase);
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ 
        error: "Failed to retrieve case",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get database statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDatabaseStats();
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ 
        error: "Failed to retrieve statistics",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Import dataset (admin endpoint)
  app.post("/api/admin/import-dataset", async (req, res) => {
    try {
      const { csvData } = z.object({ 
        csvData: z.array(z.object({
          english: z.string(),
          tamil: z.string().optional(),
          batch: z.string(),
          sentence_number: z.number(),
          doc_id: z.string(),
        }))
      }).parse(req.body);

      let importedCount = 0;
      for (const row of csvData) {
        try {
          await storage.createLegalCase({
            english: row.english,
            tamil: row.tamil || null,
            batch: row.batch,
            sentenceNumber: row.sentence_number,
            docId: row.doc_id,
            courtType: null,
            caseCategory: null,
            dateDecided: null,
            title: null,
            summary: null,
            aiSummary: null,
            relevanceScore: 0,
          });
          importedCount++;
        } catch (error) {
          console.error(`Failed to import case ${row.doc_id}:`, error);
        }
      }

      res.json({ 
        message: `Successfully imported ${importedCount} out of ${csvData.length} cases`,
        importedCount,
        totalRows: csvData.length
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(400).json({ 
        error: "Import failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
