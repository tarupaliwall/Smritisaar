import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SearchFilters, SearchResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface SearchSectionProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onSearchComplete: (result: SearchResult) => void;
  isSearching: boolean;
  filters: SearchFilters;
}

export default function SearchSection({ 
  onSearch, 
  onSearchComplete, 
  isSearching, 
  filters 
}: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Get search suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['/api/search/suggestions'],
    queryFn: async () => {
      if (query.length < 3) return { suggestions: [] };
      const res = await apiRequest("POST", "/api/search/suggestions", { query });
      return await res.json();
    },
    enabled: query.length >= 3,
  });

  useEffect(() => {
    if (suggestionsData?.suggestions) {
      setSuggestions(suggestionsData.suggestions);
      setShowSuggestions(true);
    }
  }, [suggestionsData]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a legal query to search.",
        variant: "destructive",
      });
      return;
    }

    onSearch(query, filters);
    setShowSuggestions(false);

    try {
      const res = await apiRequest("POST", "/api/search", {
        query: query.trim(),
        filters,
        page: 1,
        limit: 10,
      });
      
      const result = await res.json();
      onSearchComplete(result);
      
      toast({
        title: "Search Completed",
        description: `Found ${result.totalCount} relevant cases in ${result.processingTime}ms`,
      });
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      onSearchComplete({ cases: [], totalCount: 0, processingTime: 0 });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const exampleQueries = [
    "Property Rights",
    "Contract Law",
    "Criminal Defense",
    "Family Law",
  ];

  return (
    <section className="bg-card rounded-lg border shadow-lg p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-search-title">
            Legal Case Search & Analysis
          </h2>
          <p className="text-muted-foreground" data-testid="text-search-description">
            Powered by Google Gemini AI for intelligent case law retrieval and summarization
          </p>
        </div>

        <div className="relative">
          <div className="flex rounded-lg border-2 border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your legal query in natural language..."
              className="flex-1 px-4 py-4 bg-background text-foreground placeholder:text-muted-foreground border-0 outline-none text-lg"
              data-testid="input-search-query"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
              data-testid="button-search"
            >
              <i className={`fas fa-${isSearching ? 'spinner fa-spin' : 'search'} mr-2`}></i>
              {isSearching ? 'Searching...' : 'Search Cases'}
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 search-suggestions rounded-lg border shadow-lg p-4 z-10">
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-2 hover:bg-muted rounded text-sm"
                    data-testid={`button-suggestion-${index}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Quick examples:</span>
          {exampleQueries.map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
              data-testid={`button-example-${example.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
