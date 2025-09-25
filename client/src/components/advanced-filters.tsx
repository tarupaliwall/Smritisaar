import { SearchFilters } from "@/lib/types";

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

export default function AdvancedFilters({ filters, onFiltersChange, onReset }: AdvancedFiltersProps) {
  const updateFilter = (key: keyof SearchFilters, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  return (
    <section className="bg-card rounded-lg border shadow-lg p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground" data-testid="text-filters-title">Advanced Filters</h3>
          <button
            onClick={onReset}
            className="text-primary hover:text-primary/80 text-sm font-medium"
            data-testid="button-reset-filters"
          >
            <i className="fas fa-undo mr-1"></i>
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Language</label>
            <select
              value={filters.language || ""}
              onChange={(e) => updateFilter("language", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              data-testid="select-language"
            >
              <option value="">All Languages</option>
              <option value="english">English</option>
              <option value="tamil">Tamil</option>
              <option value="bilingual">Bilingual</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Court Type</label>
            <select
              value={filters.courtType || ""}
              onChange={(e) => updateFilter("courtType", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              data-testid="select-court-type"
            >
              <option value="">All Courts</option>
              <option value="supreme">Supreme Court</option>
              <option value="high">High Court</option>
              <option value="district">District Court</option>
              <option value="tribunal">Tribunal</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                data-testid="input-date-from"
              />
              <input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                data-testid="input-date-to"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Case Category</label>
            <select
              value={filters.category || ""}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              data-testid="select-category"
            >
              <option value="">All Categories</option>
              <option value="civil">Civil Law</option>
              <option value="criminal">Criminal Law</option>
              <option value="constitutional">Constitutional Law</option>
              <option value="commercial">Commercial Law</option>
              <option value="family">Family Law</option>
              <option value="property">Property Law</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="aiSummary"
              checked={filters.enableAISummary || false}
              onChange={(e) => updateFilter("enableAISummary", e.target.checked)}
              className="rounded border-border"
              data-testid="checkbox-ai-summary"
            />
            <label htmlFor="aiSummary" className="text-sm text-foreground">Enable AI Summarization</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="relevanceRanking"
              checked={filters.enableRanking || false}
              onChange={(e) => updateFilter("enableRanking", e.target.checked)}
              className="rounded border-border"
              data-testid="checkbox-relevance-ranking"
            />
            <label htmlFor="relevanceRanking" className="text-sm text-foreground">Smart Relevance Ranking</label>
          </div>
        </div>
      </div>
    </section>
  );
}
