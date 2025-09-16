import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const EXAMPLE_QUERIES = [
  "Property dispute commercial lease",
  "Contract breach damages",
  "Criminal procedure evidence",
  "Family law custody",
  "Constitutional rights violation",
  "Trademark infringement",
];

export function SearchSection({ onSearch, isLoading }: SearchSectionProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <section className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm" data-testid="search-section">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-2">Legal Case Query</h2>
        <p className="text-muted-foreground">Enter your legal query to find relevant case laws and precedents</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-0">
          <Input
            type="text"
            placeholder="e.g., property dispute commercial lease agreement breach..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-border rounded-l-lg focus:border-primary focus:outline-none bg-background text-foreground text-lg rounded-r-none"
            data-testid="input-search-query"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-r-lg rounded-l-none font-semibold transition-colors"
            data-testid="button-search"
          >
            <i className="fas fa-search mr-2" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2" data-testid="example-queries">
        <span className="text-sm text-muted-foreground mr-2">Quick examples:</span>
        {EXAMPLE_QUERIES.map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example)}
            disabled={isLoading}
            className="bg-accent hover:bg-accent/80 text-accent-foreground px-3 py-1 rounded-full text-sm transition-all hover:transform hover:-translate-y-0.5 example-chip disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`chip-example-${index}`}
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
