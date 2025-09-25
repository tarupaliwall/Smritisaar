import { useState } from "react";
import { SearchResult, LegalCase } from "@/lib/types";

interface SearchResultsProps {
  searchResult: SearchResult | null;
  isLoading: boolean;
  query: string;
}

export default function SearchResults({ searchResult, isLoading, query }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("list");

  const handleViewFullCase = (caseId: string) => {
    // TODO: Implement view full case modal/page
    console.log("View full case:", caseId);
  };

  const handleDownloadPDF = (caseId: string) => {
    // TODO: Implement PDF download
    console.log("Download PDF for case:", caseId);
  };

  const handleCitation = (caseId: string) => {
    // TODO: Implement citation format display
    console.log("Show citation for case:", caseId);
  };

  const handleBookmark = (caseId: string) => {
    // TODO: Implement bookmark functionality
    console.log("Bookmark case:", caseId);
  };

  const handleShare = (caseId: string) => {
    // TODO: Implement share functionality
    console.log("Share case:", caseId);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRelevanceColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <section className="bg-card rounded-lg border shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="loading-spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground" data-testid="text-loading">Processing your legal query...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!searchResult) {
    return (
      <section className="bg-card rounded-lg border shadow-lg p-6">
        <div className="text-center py-12">
          <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground" data-testid="text-no-search">
            Enter a legal query above to search our database of cases.
          </p>
        </div>
      </section>
    );
  }

  const { cases, totalCount, processingTime, queryAnalysis } = searchResult;

  return (
    <section className="bg-card rounded-lg border shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground" data-testid="text-results-title">Search Results</h3>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-result-count">
            Found {totalCount} relevant legal cases ({processingTime}ms)
          </p>
          {queryAnalysis && (
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-query-analysis">
              Intent: {queryAnalysis.intent} | Category: {queryAnalysis.category} | Confidence: {queryAnalysis.confidence}%
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
            data-testid="select-sort-by"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="date">Sort by Date</option>
            <option value="court">Sort by Court Level</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-2 border border-border rounded-md hover:bg-muted"
            data-testid="button-toggle-view"
          >
            <i className={`fas fa-${viewMode === "list" ? "th-large" : "th-list"}`}></i>
          </button>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-folder-open text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground" data-testid="text-no-results">
            No cases found matching your search criteria. Try adjusting your query or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {cases.map((legalCase: LegalCase) => (
            <div
              key={legalCase.id}
              className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow bg-background"
              data-testid={`card-case-${legalCase.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-case-title-${legalCase.id}`}>
                    {legalCase.title || `Legal Case ${legalCase.docId}`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center">
                      <i className="fas fa-calendar mr-1"></i> 
                      {formatDate(legalCase.dateDecided)}
                    </span>
                    {legalCase.courtType && (
                      <span className="flex items-center">
                        <i className="fas fa-building mr-1"></i> 
                        {legalCase.courtType}
                      </span>
                    )}
                    {legalCase.caseCategory && (
                      <span className="flex items-center">
                        <i className="fas fa-tag mr-1"></i> 
                        {legalCase.caseCategory}
                      </span>
                    )}
                    <span className="flex items-center">
                      <i className="fas fa-language mr-1"></i> 
                      {legalCase.tamil ? "Tamil/English" : "English"}
                    </span>
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                      Batch #{legalCase.batch}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {legalCase.relevanceScore && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRelevanceColor(legalCase.relevanceScore)}`}>
                      {legalCase.relevanceScore}% Relevance
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Doc ID: {legalCase.docId}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {legalCase.aiSummary && (
                  <div className="bg-muted rounded-lg p-4">
                    <h5 className="font-medium text-foreground mb-2 flex items-center">
                      <i className="fas fa-robot text-primary mr-2"></i>
                      AI Summary
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {legalCase.aiSummary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h6 className="font-medium text-foreground text-sm">English Content</h6>
                    <p className="text-sm text-muted-foreground bg-background p-3 rounded border line-clamp-3">
                      {legalCase.english.length > 200 
                        ? `${legalCase.english.substring(0, 200)}...`
                        : legalCase.english
                      }
                    </p>
                  </div>
                  {legalCase.tamil && (
                    <div className="space-y-2">
                      <h6 className="font-medium text-foreground text-sm">Tamil Content</h6>
                      <p className="text-sm text-muted-foreground bg-background p-3 rounded border line-clamp-3">
                        {legalCase.tamil.length > 200
                          ? `${legalCase.tamil.substring(0, 200)}...`
                          : legalCase.tamil
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleViewFullCase(legalCase.id)}
                      className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                      data-testid={`button-view-full-${legalCase.id}`}
                    >
                      <i className="fas fa-external-link-alt mr-1"></i>
                      View Full Case
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(legalCase.id)}
                      className="text-muted-foreground hover:text-foreground text-sm font-medium flex items-center"
                      data-testid={`button-download-${legalCase.id}`}
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleCitation(legalCase.id)}
                      className="text-muted-foreground hover:text-foreground text-sm font-medium flex items-center"
                      data-testid={`button-citation-${legalCase.id}`}
                    >
                      <i className="fas fa-quote-right mr-1"></i>
                      Citation
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBookmark(legalCase.id)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      data-testid={`button-bookmark-${legalCase.id}`}
                    >
                      <i className="far fa-bookmark"></i>
                    </button>
                    <button
                      onClick={() => handleShare(legalCase.id)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      data-testid={`button-share-${legalCase.id}`}
                    >
                      <i className="fas fa-share"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalCount > 10 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Showing 1-{Math.min(10, cases.length)} of {totalCount} results
              </p>
              <div className="flex items-center space-x-2">
                <button
                  disabled
                  className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted disabled:opacity-50"
                  data-testid="button-previous-page"
                >
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  1
                </button>
                <button className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted">
                  2
                </button>
                <button className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted">
                  3
                </button>
                <span className="px-2">...</span>
                <button className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted">
                  {Math.ceil(totalCount / 10)}
                </button>
                <button
                  className="px-3 py-2 border border-border rounded-md text-sm hover:bg-muted"
                  data-testid="button-next-page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
