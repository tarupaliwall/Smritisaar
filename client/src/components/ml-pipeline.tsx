import { useEffect, useState } from "react";
import type { PipelineStep } from "@/types";

interface MLPipelineProps {
  isProcessing: boolean;
  steps?: string[];
}

const DEFAULT_STEPS: PipelineStep[] = [
  {
    id: "step-1",
    icon: "fas fa-file-text",
    title: "Query Processing",
    description: "Analyzing legal terms",
    active: false,
  },
  {
    id: "step-2", 
    icon: "fas fa-database",
    title: "Dataset Search",
    description: "Searching case database",
    active: false,
  },
  {
    id: "step-3",
    icon: "fas fa-brain", 
    title: "AI Analysis",
    description: "Gemini AI processing",
    active: false,
  },
  {
    id: "step-4",
    icon: "fas fa-filter",
    title: "Relevance Scoring", 
    description: "Ranking results",
    active: false,
  },
  {
    id: "step-5",
    icon: "fas fa-file-alt",
    title: "Summarization",
    description: "Creating summaries",
    active: false,
  },
];

export function MLPipeline({ isProcessing, steps }: MLPipelineProps) {
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(DEFAULT_STEPS);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      animatePipeline();
    } else {
      resetPipeline();
    }
  }, [isProcessing]);

  const animatePipeline = () => {
    setPipelineSteps(prev => prev.map(step => ({ ...step, active: false })));
    setProgressWidth(0);
    
    pipelineSteps.forEach((step, index) => {
      setTimeout(() => {
        setPipelineSteps(prev => 
          prev.map((s, i) => 
            i === index ? { ...s, active: true } : s
          )
        );
        setProgressWidth(((index + 1) / pipelineSteps.length) * 100);
      }, index * 600);
    });
  };

  const resetPipeline = () => {
    setTimeout(() => {
      setPipelineSteps(prev => prev.map(step => ({ ...step, active: false })));
      setProgressWidth(0);
    }, 1000);
  };

  return (
    <section className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm" data-testid="ml-pipeline">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">ML Processing Pipeline</h3>
      
      <div className="relative">
        <div className="flex justify-between items-center">
          {pipelineSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center text-center w-1/5 relative pipeline-step ${
                step.active ? 'active' : ''
              }`}
              data-testid={`pipeline-${step.id}`}
            >
              <div
                className={`w-16 h-16 border-4 rounded-full flex items-center justify-center mb-3 step-icon transition-all duration-300 ${
                  step.active
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                <i className={`${step.icon} text-xl`} />
              </div>
              <h4 className="font-semibold text-sm text-card-foreground mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* Progress line background */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-border -z-10" />
        {/* Active progress line */}
        <div
          className="absolute top-8 left-0 h-1 bg-primary transition-all duration-1000 -z-10"
          style={{ width: `${progressWidth}%` }}
          data-testid="progress-line"
        />
      </div>

      {steps && steps.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg" data-testid="processing-steps">
          <h4 className="font-semibold text-card-foreground mb-2">Processing Steps:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {steps.map((step, index) => (
              <li key={index} className="flex items-center">
                <i className="fas fa-check-circle text-primary mr-2" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
