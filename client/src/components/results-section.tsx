import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LegalCase } from "@/types";

interface ResultsSectionProps {
  results: LegalCase[];
  total: number;
  isLoading: boolean;
  onViewCase: (caseId: string) => void;
  onAnalyzeCase: (caseId: string) => void;
}

export function ResultsSection({ results, total, isLoading, onViewCase, onAnalyzeCase }: ResultsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCaseTypeColor = (caseType: string) => {
    const colors: Record<string, string> = {
      'Criminal Law': 'destructive',
      'Commercial Law': 'primary',
      'Family Law': 'secondary',
      'Constitutional Law': 'accent',
      'Property Law': 'muted',
      'Contract Law': 'primary',
      'Intellectual Property': 'accent',
    };
    return colors[caseType] || 'muted';
  };

  if (isLoading) {
    return (
      <section className="bg-card border border-border rounded-lg p-6 shadow-sm" data-testid="results-section">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Search Results</h3>
        </div>
        
        <div className="text-center py-12" data-testid="loading-state">
          <div className="loading-pulse">
            <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4" />
            <p className="text-muted-foreground">Searching legal databases...</p>
          </div>
        </div>
      </section>
    );
  }

  if (results.length === 0 && total === 0) {
    return (
      <section className="bg-card border border-border rounded-lg p-6 shadow-sm" data-testid="results-section">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Search Results</h3>
        </div>
        
        <div className="text-center py-12" data-testid="no-results">
          <i className="fas fa-search text-4xl text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold text-card-foreground mb-2">No search performed yet</h4>
          <p className="text-muted-foreground">Enter a legal query above to find relevant case laws</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-lg p-6 shadow-sm" data-testid="results-section">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Search Results</h3>
        <div className="text-sm text-muted-foreground" data-testid="result-count">
          Found {total} relevant case{total !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4" data-testid="case-results">
        {results.map((case_) => (
          <div
            key={case_.id}
            className="case-card border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-all"
            data-testid={`case-card-${case_.id}`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-primary flex-1 mr-4">{case_.caseTitle}</h4>
              <Badge 
                variant="outline" 
                className={`px-2 py-1 text-xs font-medium bg-${getCaseTypeColor(case_.caseType)}/10 text-${getCaseTypeColor(case_.caseType)} border-${getCaseTypeColor(case_.caseType)}/20`}
                data-testid={`badge-case-type-${case_.id}`}
              >
                {case_.caseType}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center" data-testid={`court-info-${case_.id}`}>
                <i className="fas fa-gavel mr-2" />
                <span>{case_.courtType}</span>
              </div>
              <div className="flex items-center" data-testid={`date-info-${case_.id}`}>
                <i className="fas fa-calendar mr-2" />
                <span>{formatDate(case_.caseDate)}</span>
              </div>
              {case_.judge && (
                <div className="flex items-center" data-testid={`judge-info-${case_.id}`}>
                  <i className="fas fa-user-tie mr-2" />
                  <span>{case_.judge}</span>
                </div>
              )}
              {case_.relevanceScore > 0 && (
                <div className="flex items-center" data-testid={`relevance-info-${case_.id}`}>
                  <i className="fas fa-star mr-2" />
                  <span>Relevance: {case_.relevanceScore}%</span>
                </div>
              )}
            </div>
            
            {case_.aiSummary && (
              <div className="mb-4" data-testid={`summary-${case_.id}`}>
                <h5 className="font-semibold text-card-foreground mb-2">AI Summary</h5>
                <p className="text-muted-foreground leading-relaxed">{case_.aiSummary}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2" data-testid={`tags-${case_.id}`}>
                {case_.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-secondary/20 text-secondary px-2 py-1 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {case_.tags.length > 3 && (
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary px-2 py-1 text-xs">
                    +{case_.tags.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAnalyzeCase(case_.id)}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                  data-testid={`button-analyze-${case_.id}`}
                >
                  <i className="fas fa-brain mr-1" />
                  AI Analyze
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onViewCase(case_.id)}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                  data-testid={`button-view-${case_.id}`}
                >
                  View Full Case <i className="fas fa-external-link-alt ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && results.length < total && (
        <div className="text-center mt-6" data-testid="load-more">
          <p className="text-muted-foreground text-sm">
            Showing {results.length} of {total} results
          </p>
          <Button variant="outline" className="mt-2">
            Load More Results
          </Button>
        </div>
      )}
    </section>
  );
}
