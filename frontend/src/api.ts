import axios, { AxiosInstance, AxiosError } from 'axios';

// --------------------
// Types
// --------------------
export interface ContractIssue {
  clause: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  law_cited: string;
  eli5: string;
  confidence: number;
}

export type DecisionVerdict = 'TAKE' | 'NEGOTIATE' | 'AVOID';

export interface ContractDecision {
  verdict: DecisionVerdict;
  one_liner: string;
  why: string;
}

export interface AnalysisResponse {
  risk_score: number;

  // ✅ new fields from backend (optional so it won't crash old responses)
  decision?: ContractDecision;
  plain_english_summary?: string;
  negotiation_suggestions?: string[];

  issues: ContractIssue[];
}

// --------------------
// Axios client
// --------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 60000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.status);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('[API] Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API] No Response:', error.message);
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// --------------------
// API calls
// --------------------
export const analyzeContract = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<AnalysisResponse>('/analyze-contract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const generateSummary = async (clauses: string[]): Promise<string> => {
  const response = await apiClient.post<{ summary: string }>('/generate-summary', {
    clauses,
  });
  return response.data.summary;
};

// --------------------
// Mock (optional, for demo)
// --------------------
export const analyzeContractMock = async (_file: File): Promise<AnalysisResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return {
    risk_score: 87,
    decision: {
      verdict: 'AVOID',
      one_liner: 'High legal risk. Avoid signing without major changes.',
      why: '2 high-risk clauses detected.',
    },
    plain_english_summary:
      'Overall Risk Score: 87/100\n\nKey Points:\n- Non-compete is too broad.\n- Foreign jurisdiction increases cost.\n- Unilateral changes are unfair.',
    negotiation_suggestions: [
      'Remove post-termination non-compete clause.',
      'Bring jurisdiction back to India.',
      'Block unilateral contract changes.',
    ],
    issues: [
      {
        clause:
          'The Employee agrees not to engage in any business or employment that competes with the Company for a period of 5 years after termination, across all of India.',
        risk_level: 'HIGH',
        law_cited: 'Indian Contract Act, 1872 – Section 27',
        eli5:
          'This non-compete clause is likely unenforceable in India. Section 27 makes restraint of trade void.',
        confidence: 0.94,
      },
      {
        clause:
          'Any disputes shall be resolved exclusively under the jurisdiction of courts in Singapore, and Singapore law shall apply.',
        risk_level: 'HIGH',
        law_cited: 'Consumer Protection Act, 2019 – Section 2(7)',
        eli5: 'Foreign jurisdiction can be challenged if it causes undue hardship to an Indian party.',
        confidence: 0.88,
      },
      {
        clause:
          'The Company reserves the right to modify the terms of this agreement at any time without prior notice to the Employee.',
        risk_level: 'MEDIUM',
        law_cited: 'Indian Contract Act, 1872 – Section 14',
        eli5: "Contracts require free consent. Unilateral changes can be unfair.",
        confidence: 0.82,
      },
      {
        clause:
          'The Employee shall forfeit all pending dues and bonuses if they resign before completing 2 years of service.',
        risk_level: 'MEDIUM',
        law_cited: 'Payment of Wages Act, 1936 – Section 7',
        eli5: 'Earned wages usually cannot be forfeited.',
        confidence: 0.79,
      },
      {
        clause: 'Employee agrees to maintain confidentiality of company information during and after employment.',
        risk_level: 'LOW',
        law_cited: 'Information Technology Act, 2000 – Section 72A',
        eli5: 'This is generally a standard confidentiality clause.',
        confidence: 0.95,
      },
    ],
  };
};

export default apiClient;
