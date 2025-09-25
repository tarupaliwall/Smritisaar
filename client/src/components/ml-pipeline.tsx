import { useState, useEffect } from "react";
import { PipelineStep } from "@/lib/types";

interface MLPipelineProps {
  isProcessing: boolean;
  query: string;
}

export default function MLPipeline({ isProcessing, query }: MLPipelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const pipelineSteps: PipelineStep[] = [
    {
      id: "query-analysis",
      title: "Query Analysis",
      description: "NLP Processing",
      icon: "fas fa-search",
      status: "pending",
    },
    {
      id: "database-search",
      title: "Database Search",
      description: "Vector Similarity",
      icon: "fas fa-database",
      status: "pending",
    },
    {
      id: "ai-analysis",
      title: "AI Analysis",
      description: "Gemini Processing",
      icon: "fas fa-brain",
      status: "pending",
    },
    {
      id: "ranking",
      title: "Ranking",
      description: "Relevance Scoring",
      icon: "fas fa-sort",
      status: "pending",
    },
    {
      id: "summarization",
      title: "Summarization",
      description: "Key Insights",
      icon: "fas fa-file-alt",
      status: "pending",
    },
  ];

  useEffect(() => {
    if (isProcessing) {
      setCurrentStep(0);
      setProgress(0);

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= pipelineSteps.length) {
            clearInterval(interval);
            return prev;
          }
          return next;
        });
        
        setProgress((prev) => {
          const nextProgress = prev + 20;
          return nextProgress > 100 ? 100 : nextProgress;
        });
      }, 600);

      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
      setProgress(0);
    }
  }, [isProcessing, pipelineSteps.length]);

  const getStepStatus = (index: number): "completed" | "processing" | "pending" => {
    if (!isProcessing) return "pending";
    if (index < currentStep) return "completed";
    if (index === currentStep) return "processing";
    return "pending";
  };

  return (
    <section className="bg-card rounded-lg border shadow-lg p-6">
      <h3 className="text-xl font-semibold text-foreground mb-6" data-testid="text-pipeline-title">
        AI Processing Pipeline
      </h3>
      
      <div className="relative">
        <div className="flex justify-between items-center relative">
          {/* Pipeline Progress Line */}
          <div className="absolute top-10 left-0 right-0 h-1 pipeline-line rounded-full opacity-30"></div>
          <div 
            className="absolute top-10 left-0 h-1 bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
          
          {pipelineSteps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div 
                key={step.id}
                className="flex flex-col items-center relative z-10 bg-background rounded-full p-4"
              >
                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-300 ${
                    status === "completed" 
                      ? "bg-primary text-primary-foreground"
                      : status === "processing"
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-icon-${step.id}`}
                >
                  <i className={step.icon}></i>
                </div>
                <h4 className={`font-semibold mt-3 text-center ${
                  status !== "pending" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {step.description}
                </p>
                <div className={`mt-2 w-2 h-2 rounded-full ${
                  status === "completed" 
                    ? "bg-green-500"
                    : status === "processing"
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Processing Status:</span>
          <div className="flex items-center space-x-2">
            {isProcessing && (
              <div className="loading-spinner w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            )}
            <span className="text-sm font-medium text-foreground" data-testid="text-processing-status">
              {isProcessing 
                ? `Processing step ${currentStep + 1} of ${pipelineSteps.length}: ${pipelineSteps[currentStep]?.title}...`
                : query 
                ? "Processing complete"
                : "Ready to process your query"
              }
            </span>
          </div>
        </div>
        <div className="mt-2 bg-background rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
            data-testid="progress-bar"
          ></div>
        </div>
      </div>
    </section>
  );
}
