import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

import { SearchSection } from "@/components/search-section";
import { AdvancedFilters } from "@/components/advanced-filters";
import { MLPipeline } from "@/components/ml-pipeline";
import { ResultsSection } from "@/components/results-section";
import { useTheme } from "@/components/theme-provider";

import type { SearchRequest, SearchResponse, SearchFilters, LegalCase } from "@/types";

export default function Home() {
  const { toast } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<LegalCase[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchRequest: SearchRequest): Promise<SearchResponse> => {
      const response = await apiRequest("POST", "/api/search", searchRequest);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.cases);
      setTotalResults(data.total);
      setProcessingSteps(data.processingSteps);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.total} relevant cases`,
      });
    },
    onError: (error) => {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description: "Unable to search cases. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Case analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async ({ caseId, analysisType }: { caseId: string; analysisType: string }) => {
      const response = await apiRequest("POST", "/api/analyze", { caseId, analysisType });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated for the case",
      });
      // You could show the analysis in a modal or separate page
      console.log("Analysis result:", data);
    },
    onError: (error) => {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze case. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searchRequest: SearchRequest = {
      query,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      page: 1,
      limit: 10,
    };
    
    searchMutation.mutate(searchRequest);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      toast({
        title: "No Query",
        description: "Please enter a search query before applying filters.",
        variant: "destructive",
      });
    }
  };

  const handleViewCase = (caseId: string) => {
    // Navigate to case detail page or open modal
    window.open(`/case/${caseId}`, '_blank');
  };

  const handleAnalyzeCase = (caseId: string) => {
    analysisMutation.mutate({ caseId, analysisType: 'summary' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-secondary text-3xl mr-4">
                <i className="fas fa-balance-scale" data-testid="logo-icon" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="app-title">SmritiSaar</h1>
                <p className="text-sm opacity-90 mt-1" data-testid="app-tagline">
                  ML-Driven Case Law Retrieval and Summarization
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              data-testid="button-theme-toggle"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`} />
              <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchSection
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
        />

        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
        />

        <MLPipeline
          isProcessing={searchMutation.isPending}
          steps={processingSteps}
        />

        <ResultsSection
          results={searchResults}
          total={totalResults}
          isLoading={searchMutation.isPending}
          onViewCase={handleViewCase}
          onAnalyzeCase={handleAnalyzeCase}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 SmritiSaar - ML-Driven Case Law Retrieval and Summarization</p>
          <p className="mt-1">Powered by Gemini AI | Enhancing Legal Efficiency with AI</p>
          <p className="mt-1 text-xs">
            Disclaimer: This is a legal research tool. Not a substitute for professional legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
