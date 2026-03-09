import React, { useState } from 'react';
import {
  Shield,
  Scale,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import UploadBox from '../components/UploadBox';
import RiskMeter from '../components/RiskMeter';
import ClauseCard from '../components/ClauseCard';
import InlineLegalChat from '../components/InlineLegalChat';
import AIRecommendation from '../components/AIRecommendation';
import ContractSummary from '../components/ContractSummary';

import { AnalysisResponse, ContractIssue } from '../api';

const Dashboard: React.FC = () => {
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [clauses, setClauses] = useState<ContractIssue[]>([]);
  const [plainSummary, setPlainSummary] = useState<string>(''); // ✅ FIX
  const [isLoading, setIsLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // ✅ THIS FUNCTION IS THE KEY FIX
  const handleAnalysisComplete = (data: AnalysisResponse) => {
    setRiskScore(data.risk_score);
    setClauses(data.issues);
    setPlainSummary(data.plain_english_summary || ''); // ✅ NO ERROR NOW
    setAnalysisComplete(true);
  };

  const stats = {
    high: clauses.filter(c => c.risk_level === 'HIGH').length,
    medium: clauses.filter(c => c.risk_level === 'MEDIUM').length,
    low: clauses.filter(c => c.risk_level === 'LOW').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                AI Legal Sentinel
              </h1>
              <p className="text-white/80 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Contract Intelligence for India
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Upload */}
        <UploadBox
          onAnalysisComplete={handleAnalysisComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* RESULTS */}
        {analysisComplete && riskScore !== null && (
          <>
            {/* STATS */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
              <StatCard icon={TrendingUp} value={clauses.length} label="Issues Found" />
              <StatCard icon={AlertTriangle} value={stats.high} label="High Risk" color="red" />
              <StatCard icon={AlertTriangle} value={stats.medium} label="Medium Risk" color="yellow" />
              <StatCard icon={CheckCircle} value={stats.low} label="Low Risk" color="green" />
            </section>

            {/* AI DECISION */}
            <AIRecommendation riskScore={riskScore} issues={clauses} />

            {/* ✅ CONTRACT SUMMARY (BACKEND GENERATED) */}
            <ContractSummary summary={plainSummary} />

            {/* CONTENT */}
            <div className="grid lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-1 space-y-8">
                <RiskMeter score={riskScore} />
                <InlineLegalChat issues={clauses} />
              </div>

              <div className="lg:col-span-2 space-y-4">
                {[...clauses]
                  .sort((a, b) => {
                    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
                    return order[a.risk_level] - order[b.risk_level];
                  })
                  .map((issue, index) => (
                    <ClauseCard
                      key={index}
                      clause={issue.clause}
                      riskLevel={issue.risk_level}
                      lawCited={issue.law_cited}
                      eli5={issue.eli5}
                      confidence={issue.confidence}
                      index={index}
                    />
                  ))}
              </div>
            </div>
          </>
        )}

        {/* EMPTY */}
        {!analysisComplete && !isLoading && (
          <div className="text-center py-20 text-muted-foreground">
            Upload a contract to begin analysis.
          </div>
        )}
      </main>
    </div>
  );
};

/* ---------- Small helper component ---------- */

const StatCard = ({ icon: Icon, value, label, color = 'primary' }: any) => {
  const colorMap: any = {
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    primary: 'text-primary bg-primary/10',
  };

  return (
    <div className="legal-card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default Dashboard;
