import React, { useState } from 'react';
import { ChevronDown, Scale, BookOpen, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';

interface ClauseCardProps {
  clause: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  lawCited: string;
  eli5: string;
  confidence: number;
  index: number;
}

const ClauseCard: React.FC<ClauseCardProps> = ({
  clause,
  riskLevel,
  lawCited,
  eli5,
  confidence,
  index
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          icon: AlertTriangle,
          label: 'High Risk',
          emoji: '🔴',
          borderClass: 'clause-card-danger',
          badgeClass: 'risk-badge-danger',
          textClass: 'text-red-700'
        };
      case 'MEDIUM':
        return {
          icon: AlertCircle,
          label: 'Medium Risk',
          emoji: '🟡',
          borderClass: 'clause-card-caution',
          badgeClass: 'risk-badge-caution',
          textClass: 'text-yellow-700'
        };
      default:
        return {
          icon: CheckCircle,
          label: 'Low Risk',
          emoji: '🟢',
          borderClass: 'clause-card-safe',
          badgeClass: 'risk-badge-safe',
          textClass: 'text-green-700'
        };
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  return (
    <div 
      className={`legal-card-hover ${riskConfig.borderClass} animate-slide-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Header */}
      <div 
        className="flex items-start justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${riskConfig.badgeClass}`}>
              <RiskIcon className="w-3.5 h-3.5" />
              {riskConfig.label}
            </span>
            <ConfidenceBadge confidence={confidence} />
          </div>
          
          <p className="text-foreground leading-relaxed line-clamp-2">
            "{clause}"
          </p>
        </div>
        
        <button 
          className={`p-2 rounded-full hover:bg-muted transition-all duration-300 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Expanded Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-4 border-t border-border space-y-4">
          {/* Full Clause */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-foreground leading-relaxed italic">
              "{clause}"
            </p>
          </div>

          {/* Law Cited */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Law Cited
              </p>
              <p className="text-sm font-medium text-foreground">
                {lawCited}
              </p>
            </div>
          </div>

          {/* ELI5 Explanation */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Plain English Explanation
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {eli5}
              </p>
            </div>
          </div>

          {/* Risk Indicator Footer */}
          <div className={`flex items-center gap-2 pt-3 border-t border-border ${riskConfig.textClass}`}>
            <span className="text-lg">{riskConfig.emoji}</span>
            <span className="text-sm font-medium">
              {riskLevel === 'HIGH' && 'This clause requires immediate attention and negotiation.'}
              {riskLevel === 'MEDIUM' && 'Consider reviewing this clause with a legal professional.'}
              {riskLevel === 'LOW' && 'This clause appears standard and reasonable.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClauseCard;
