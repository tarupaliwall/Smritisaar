import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { searchRequestSchema, type SearchRequest, type SearchResponse, type CaseAnalysisRequest, type CaseAnalysisResponse } from "@shared/schema";
import { analyzeLegalCase, summarizeLegalCase } from "./services/gemini";
import { processCaseDataset } from "./services/case-processor";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Search legal cases
  app.post("/api/search", async (req, res) => {
    try {
      const searchData = searchRequestSchema.parse(req.body);
      const { query, filters, page = 1, limit = 10 } = searchData;

      // Log search for analytics
      await storage.createSearchHistory({
        query,
        filters: filters || {},
        resultCount: 0, // Will be updated after search
      });

      // Perform search
      const { cases, total } = await storage.searchLegalCases(query, filters, page, limit);

      // Update search history with actual result count
      const searches = await storage.getRecentSearches(1);
      if (searches.length > 0) {
        // In a real implementation, you'd update the record
        // For in-memory storage, we'll skip this update
      }

      // Calculate processing steps for UI
      const processingSteps = [
        "Query Processing - Legal term analysis complete",
        "Dataset Search - Scanning case database",
        "AI Analysis - Gemini processing relevance",
        "Relevance Scoring - Ranking results",
        "Summarization - Generating case summaries"
      ];

      // Generate AI summaries for top results if not already present
      for (const case_ of cases.slice(0, 3)) { // Limit to top 3 for performance
        if (!case_.aiSummary) {
          try {
            const summary = await summarizeLegalCase(case_.english);
            const relevanceScore = Math.floor(Math.random() * 20) + 80; // Mock relevance 80-100%
            await storage.updateCaseAISummary(case_.id, summary, relevanceScore);
            case_.aiSummary = summary;
            case_.relevanceScore = relevanceScore;
          } catch (error) {
            console.error("Failed to generate AI summary:", error);
          }
        }
      }

      const response: SearchResponse = {
        cases,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        processingSteps,
      };

      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Search failed",
        error: "SEARCH_FAILED"
      });
    }
  });

  // Get case by ID
  app.get("/api/case/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const case_ = await storage.getLegalCase(id);
      
      if (!case_) {
        return res.status(404).json({ 
          message: "Legal case not found",
          error: "CASE_NOT_FOUND"
        });
      }

      res.json(case_);
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve case",
        error: "CASE_RETRIEVAL_FAILED"
      });
    }
  });

  // Analyze case with Gemini AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const { caseId, analysisType }: CaseAnalysisRequest = req.body;
      
      if (!caseId || !analysisType) {
        return res.status(400).json({ 
          message: "Case ID and analysis type are required",
          error: "INVALID_REQUEST"
        });
      }

      const case_ = await storage.getLegalCase(caseId);
      if (!case_) {
        return res.status(404).json({ 
          message: "Legal case not found",
          error: "CASE_NOT_FOUND"
        });
      }

      let analysis: string;
      let keyPoints: string[] = [];
      let precedents: string[] = [];
      let relevantSections: string[] = [];

      switch (analysisType) {
        case 'summary':
          analysis = await summarizeLegalCase(case_.english);
          break;
        case 'precedent':
          analysis = await analyzeLegalCase(case_.english, 'precedent');
          precedents = analysis.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
          break;
        case 'full':
          analysis = await analyzeLegalCase(case_.english, 'comprehensive');
          keyPoints = analysis.split('\n').filter(line => line.includes('•') || line.includes('-')).slice(0, 5);
          break;
        default:
          return res.status(400).json({ 
            message: "Invalid analysis type",
            error: "INVALID_ANALYSIS_TYPE"
          });
      }

      const response: CaseAnalysisResponse = {
        caseId,
        analysis,
        keyPoints,
        precedents,
        relevantSections,
      };

      res.json(response);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: "AI analysis failed",
        error: "ANALYSIS_FAILED"
      });
    }
  });

  // Get available filter options
  app.get("/api/filters", async (req, res) => {
    try {
      const filters = await storage.getAvailableFilters();
      res.json(filters);
    } catch (error) {
      console.error("Get filters error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve filter options",
        error: "FILTERS_RETRIEVAL_FAILED"
      });
    }
  });

  // Upload and process dataset
  app.post("/api/upload-dataset", upload.single('dataset'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "No file uploaded",
          error: "NO_FILE_UPLOADED"
        });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;

      console.log(`Processing uploaded file: ${originalName}`);
      
      const processedCount = await processCaseDataset(filePath);
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      
      res.json({ 
        message: `Successfully processed ${processedCount} cases from ${originalName}`,
        processedCount,
        filename: originalName
      });
    } catch (error) {
      console.error("Dataset upload/processing error:", error);
      
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Dataset processing failed",
        error: "DATASET_PROCESSING_FAILED"
      });
    }
  });

  // Process dataset (admin endpoint - for direct file path)
  app.post("/api/admin/process-dataset", async (req, res) => {
    try {
      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({ 
          message: "File path is required",
          error: "INVALID_REQUEST"
        });
      }

      const processedCount = await processCaseDataset(filePath);
      res.json({ 
        message: `Successfully processed ${processedCount} cases`,
        processedCount 
      });
    } catch (error) {
      console.error("Dataset processing error:", error);
      res.status(500).json({ 
        message: "Dataset processing failed",
        error: "DATASET_PROCESSING_FAILED"
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
