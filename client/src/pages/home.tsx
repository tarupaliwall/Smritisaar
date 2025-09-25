import { useState } from "react";
import SearchSection from "@/components/search-section";
import AdvancedFilters from "@/components/advanced-filters";
import MLPipeline from "@/components/ml-pipeline";
import SearchResults from "@/components/search-results";
import DatabaseStatsComponent from "@/components/database-stats";
import { useTheme } from "@/components/theme-provider";
import { SearchFilters, SearchResult } from "@/lib/types";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    setIsSearching(true);
  };

  const handleSearchComplete = (result: SearchResult) => {
    setSearchResult(result);
    setIsSearching(false);
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-bg border-b-4 border-accent">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <i className="fas fa-balance-scale text-3xl text-accent" data-testid="logo-icon"></i>
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground" data-testid="logo-title">SmritiSaar</h1>
                  <p className="text-sm text-primary-foreground/80" data-testid="logo-tagline">AI-Powered Legal Research</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
                data-testid="button-theme-toggle"
              >
                <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
              </button>
              <div className="hidden md:flex items-center space-x-2 text-primary-foreground/90">
                <i className="fas fa-database text-accent"></i>
                <span className="text-sm" data-testid="text-case-count">5,000+ Legal Cases</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <SearchSection 
          onSearch={handleSearch}
          onSearchComplete={handleSearchComplete}
          isSearching={isSearching}
          filters={filters}
        />

        <AdvancedFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />

        <MLPipeline 
          isProcessing={isSearching}
          query={searchQuery}
        />

        <SearchResults 
          searchResult={searchResult}
          isLoading={isSearching}
          query={searchQuery}
        />

        <DatabaseStatsComponent />
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold text-foreground mb-4">SmritiSaar</h5>
              <p className="text-sm text-muted-foreground">AI-powered legal research platform for efficient case law retrieval and analysis.</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Features</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>AI-Powered Search</li>
                <li>Case Summarization</li>
                <li>Multi-language Support</li>
                <li>Advanced Filtering</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>API Documentation</li>
                <li>User Guide</li>
                <li>Contact Support</li>
                <li>Legal Disclaimer</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground"><i className="fab fa-github"></i></a>
                <a href="#" className="text-muted-foreground hover:text-foreground"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="text-muted-foreground hover:text-foreground"><i className="fab fa-twitter"></i></a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SmritiSaar. All rights reserved. | Powered by Google Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
