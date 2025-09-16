import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SearchFilters, FilterOptions } from "@/types";

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
}

export function AdvancedFilters({ filters, onFiltersChange, onApplyFilters }: AdvancedFiltersProps) {
  const [isVisible, setIsVisible] = useState(false);

  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['/api/filters'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0);

  return (
    <section className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm" data-testid="advanced-filters">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Advanced Filters</h3>
        <Button
          variant="ghost"
          onClick={() => setIsVisible(!isVisible)}
          className="text-primary hover:text-primary/80 text-sm font-medium"
          data-testid="button-toggle-filters"
        >
          <i className={`fas fa-chevron-${isVisible ? 'up' : 'down'} mr-1`} />
          {isVisible ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">!</span>}
        </Button>
      </div>
      
      {isVisible && (
        <div data-testid="filters-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="court-type" className="block text-sm font-medium text-card-foreground mb-2">
                Court Type
              </Label>
              <Select
                value={filters.courtType || ""}
                onValueChange={(value) => updateFilter('courtType', value === "" ? undefined : value)}
                data-testid="select-court-type"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Courts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courts</SelectItem>
                  {filterOptions?.courtTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="jurisdiction" className="block text-sm font-medium text-card-foreground mb-2">
                Jurisdiction
              </Label>
              <Select
                value={filters.jurisdiction || ""}
                onValueChange={(value) => updateFilter('jurisdiction', value === "" ? undefined : value)}
                data-testid="select-jurisdiction"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Jurisdictions</SelectItem>
                  {filterOptions?.jurisdictions.map((jurisdiction) => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>
                      {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="case-type" className="block text-sm font-medium text-card-foreground mb-2">
                Case Type
              </Label>
              <Select
                value={filters.caseType || ""}
                onValueChange={(value) => updateFilter('caseType', value === "" ? undefined : value)}
                data-testid="select-case-type"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Case Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Case Types</SelectItem>
                  {filterOptions?.caseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="judge" className="block text-sm font-medium text-card-foreground mb-2">
                Judge
              </Label>
              <Select
                value={filters.judge || ""}
                onValueChange={(value) => updateFilter('judge', value === "" ? undefined : value)}
                data-testid="select-judge"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Judges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Judges</SelectItem>
                  {filterOptions?.judges.map((judge) => (
                    <SelectItem key={judge} value={judge}>
                      {judge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="date-from" className="block text-sm font-medium text-card-foreground mb-2">
                Date From
              </Label>
              <Input
                type="date"
                id="date-from"
                value={filters.dateFrom || ""}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full"
                data-testid="input-date-from"
              />
            </div>
            
            <div>
              <Label htmlFor="date-to" className="block text-sm font-medium text-card-foreground mb-2">
                Date To
              </Label>
              <Input
                type="date"
                id="date-to"
                value={filters.dateTo || ""}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full"
                data-testid="input-date-to"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
            <Button
              onClick={onApplyFilters}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 transition-colors"
              data-testid="button-apply-filters"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
