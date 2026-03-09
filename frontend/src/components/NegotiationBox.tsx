import React, { useState, useMemo } from 'react';
import { Copy, Check, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { ContractIssue } from '../api';

interface NegotiationBoxProps {
  issues: ContractIssue[];
}

const NegotiationBox: React.FC<NegotiationBoxProps> = ({ issues }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'formal' | 'friendly' | 'assertive'>('formal');

  const highRiskIssues = useMemo(() => 
    issues.filter(issue => issue.risk_level === 'HIGH'),
    [issues]
  );

  const mediumRiskIssues = useMemo(() => 
    issues.filter(issue => issue.risk_level === 'MEDIUM'),
    [issues]
  );

  const generateMessage = (tone: 'formal' | 'friendly' | 'assertive'): string => {
    const greetings = {
      formal: 'Dear Sir/Madam,',
      friendly: 'Hello,',
      assertive: 'To whom it may concern,'
    };

    const intros = {
      formal: 'I am writing to request revisions to certain clauses in the contract under review. Upon careful examination, the following concerns have been identified:',
      friendly: 'Thank you for sharing the contract. I\'ve reviewed it and would like to discuss a few points that caught my attention:',
      assertive: 'After reviewing the contract, I must bring to your attention several clauses that require immediate revision:'
    };

    const closings = {
      formal: 'I trust we can arrive at mutually agreeable terms. Please do not hesitate to contact me to discuss these matters further.\n\nYours sincerely,',
      friendly: 'I\'m confident we can work together to address these points. Looking forward to your response!\n\nBest regards,',
      assertive: 'I expect these issues to be addressed before we can proceed further. Please respond with your proposed amendments.\n\nRegards,'
    };

    let message = `${greetings[tone]}\n\n${intros[tone]}\n\n`;

    if (highRiskIssues.length > 0) {
      message += '**CRITICAL ISSUES:**\n\n';
      highRiskIssues.forEach((issue, index) => {
        message += `${index + 1}. ${issue.law_cited}\n`;
        message += `   Issue: ${issue.eli5}\n`;
        message += `   Request: This clause should be revised or removed to comply with Indian law.\n\n`;
      });
    }

    if (mediumRiskIssues.length > 0) {
      message += '**ADDITIONAL CONCERNS:**\n\n';
      mediumRiskIssues.forEach((issue, index) => {
        message += `${index + 1}. ${issue.law_cited}\n`;
        message += `   Issue: ${issue.eli5}\n`;
        message += `   Suggestion: Consider revising this clause for fairness and legal compliance.\n\n`;
      });
    }

    message += closings[tone];
    
    return message;
  };

  const negotiationMessage = generateMessage(selectedTone);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(negotiationMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (highRiskIssues.length === 0 && mediumRiskIssues.length === 0) {
    return (
      <div className="legal-card animate-slide-up stagger-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              No Negotiation Needed
            </h2>
            <p className="text-sm text-muted-foreground">
              All clauses appear reasonable
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Great news! This contract doesn't contain any high or medium-risk clauses that require negotiation. 
          The terms appear to be fair and compliant with Indian law.
        </p>
      </div>
    );
  }

  return (
    <div className="legal-card animate-slide-up stagger-4">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Negotiation Draft
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-generated response for problematic clauses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-xs text-accent font-medium">AI Generated</span>
        </div>
      </div>

      {/* Tone Selector */}
      <div className="flex gap-2 mb-4">
        {(['formal', 'friendly', 'assertive'] as const).map((tone) => (
          <button
            key={tone}
            onClick={() => setSelectedTone(tone)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              selectedTone === tone
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tone.charAt(0).toUpperCase() + tone.slice(1)}
          </button>
        ))}
        <button
          onClick={() => {}}
          className="ml-auto p-1.5 rounded-full hover:bg-muted transition-colors"
          title="Regenerate message"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Message Preview */}
      <div className="relative">
        <div className="p-4 rounded-lg bg-muted/50 border border-border max-h-[300px] overflow-y-auto">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {negotiationMessage}
          </pre>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-card text-foreground border border-border hover:border-accent hover:shadow-sm'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span>
          Addressing {highRiskIssues.length} critical and {mediumRiskIssues.length} moderate issues
        </span>
      </div>
    </div>
  );
};

export default NegotiationBox;
