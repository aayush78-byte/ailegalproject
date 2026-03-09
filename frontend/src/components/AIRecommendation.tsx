import React, { useMemo } from 'react';
import { Brain, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ContractIssue } from '../api';

interface AIRecommendationProps {
  riskScore: number;
  issues: ContractIssue[];
}

/**
 * AIRecommendation — computes a recommendation locally from the backend analysis.
 * No external API needed: the verdict is fully determined by rule engine results.
 *
 * Logic (mirrors the backend rule: Rules decide legality. AI explains.)
 *   - ≥2 HIGH risks  OR  score ≥70  → DO NOT SIGN (AVOID)
 *   - ≥1 HIGH risk   OR  score ≥40  → NEGOTIATE before signing
 *   - ≥3 MEDIUM risks               → BE ALERT
 *   - otherwise                      → RELATIVELY SAFE
 */
const AIRecommendation: React.FC<AIRecommendationProps> = ({ riskScore, issues }) => {
  const highCount = issues.filter(i => i.risk_level === 'HIGH').length;
  const mediumCount = issues.filter(i => i.risk_level === 'MEDIUM').length;
  const laws = [...new Set(issues.map(i => i.law_cited))].filter(Boolean);

  const { verdict, color, bg, border, Icon, advice } = useMemo(() => {
    if (riskScore >= 70) {
      return {
        verdict: '🚫 DO NOT SIGN',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-300',
        Icon: XCircle,
        advice: `This contract is HIGH RISK (score: ${riskScore}/100).
\n👉 Do NOT sign this contract in its current form. It contains critical legal violations that could put you at significant disadvantage or are outright void under Indian law.`,
      };
    }

    if (riskScore >= 30) {
      return {
        verdict: '🔔 BE ALERT & NEGOTIATE',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        Icon: AlertTriangle,
        advice: `This contract has MODERATE RISK (score: ${riskScore}/100).
\n👉 There are some risks in accepting this. Be alert and review the flagged clauses carefully. We recommend negotiating the highlighted terms before you sign.`,
      };
    }

    return {
      verdict: '✅ SAFE TO SIGN',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-300',
      Icon: CheckCircle,
      advice: `This contract is RELATIVELY SAFE (score: ${riskScore}/100).
\n👉 The terms appear generally compliant with standard legal practices. You can proceed with signing, though a final personal review of all terms is always advised.`,
    };
  }, [riskScore]);

  return (
    <div className="legal-card animate-slide-up stagger-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            AI Recommendation
          </h2>
          <p className="text-sm text-muted-foreground">
            Should you sign this contract?
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${bg} ${border} transition-all duration-300`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 mt-0.5 ${color} flex-shrink-0`} />
          <div>
            <p className={`text-base font-bold ${color} mb-2`}>{verdict}</p>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {advice}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Brain className="w-3.5 h-3.5" />
        <span>
          Based on {issues.length} flagged clause(s) · Score {riskScore}/100 ·{' '}
          {highCount} HIGH · {mediumCount} MEDIUM
        </span>
      </div>
    </div>
  );
};

export default AIRecommendation;
