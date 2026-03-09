import React, { useEffect, useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ContractSummaryProps {
  summary: string;
}

const ContractSummary: React.FC<ContractSummaryProps> = ({ summary }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (summary) setIsExpanded(true);
  }, [summary]);

  if (!summary) {
    return (
      <div className="legal-card animate-slide-up stagger-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Contract Summary
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload a contract to see the plain English summary
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="legal-card animate-slide-up stagger-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Contract Summary
            </h2>
            <p className="text-sm text-muted-foreground">
              Plain English summary from backend
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractSummary;
