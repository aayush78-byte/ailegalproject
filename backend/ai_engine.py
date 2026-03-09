"""
Enhanced AI Engine with Multi-Provider Support
Uses LLM only for explanations, not legal decisions
"""
import os
import json
import logging
from typing import Dict, List, Optional
from llm_config import get_llm_client, LLMConfig

logger = logging.getLogger(__name__)


def get_ai_risk_explanation(document_risk: Dict, analysis: List[Dict], 
                           provider: Optional[str] = None) -> Dict:
    """
    Generate structured AI explanation of contract risks
    
    Args:
        document_risk:  Overall document risk summary
        analysis: List of clause analysis results
        provider: LLM provider to use (defaults to config)
    
    Returns:
        Structured explanation dict
    """
    try:
        # Check if LLM is configured
        if not LLMConfig.is_configured(provider):
            logger.warning(f"LLM provider {provider or LLMConfig.PROVIDER} not configured")
            return generate_fallback_explanation(document_risk, analysis)
        
        # Get LLM client
        client = get_llm_client(provider)
        
        # Build prompts
        system_prompt = get_system_prompt()
        user_prompt = build_explanation_prompt(document_risk, analysis)
        
        # Generate with JSON mode
        response_text = client.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            json_mode=True
        )
        
        # Parse and validate JSON response
        explanation = json.loads(response_text)
        
        # Validate structure
        if not validate_explanation_structure(explanation):
            logger.warning("Invalid explanation structure, using fallback")
            return generate_fallback_explanation(document_risk, analysis)
        
        return explanation
    
    except Exception as e:
        logger.error(f"Error generating AI explanation: {e}")
        return generate_fallback_explanation(document_risk, analysis)


def get_system_prompt() -> str:
    """Get system prompt with strict legal safety guardrails — kept minimal for Gemini"""
    return """You are a legal document assistant. You ONLY explain what the rule engine already found.

STRICT RULES:
1. Do NOT give legal advice or tell the user what to do.
2. Do NOT decide legality — the rule engine already did that.
3. Use plain simple English (Class 8 reading level).
4. Stay 100% grounded in the violations provided — do not add new ones.
5. Be very brief. No padding or repetition.

Respond ONLY with this exact JSON (no extra keys, no markdown):
{
  "executive_summary": "<2 sentences max summarising the contract risk>",
  "key_risks": ["<one sentence per violation found>"],
  "action_items": ["<one practical step per violation, no legal advice>"],
  "disclaimer": "This is automated analysis for information only, not legal advice."
}"""


def build_explanation_prompt(document_risk: Dict, analysis: List[Dict]) -> str:
    """
    Build user prompt with contract analysis data
    
    Args:
        document_risk: Overall risk summary
        analysis: Clause-by-clause analysis
    
    Returns:
        Formatted prompt string
    """
    # Extract high-risk violations
    violations = []
    for clause_result in analysis:
        legal_check = clause_result.get('legal_check', {})
        clause_violations = legal_check.get('violations', [])
        
        for violation in clause_violations:
            if violation.get('severity') in ['critical', 'high']:
                violations.append({
                    'clause': clause_result.get('clause_text', '')[:200],
                    'law': violation.get('law', ''),
                    'verdict': violation.get('verdict', ''),
                    'severity': violation.get('severity', ''),
                    'description': violation.get('description', '')
                })
    
    # Build prompt
    prompt = f"""Analyze this contract evaluation and provide an explanation in simple English.

OVERALL RISK SCORE: {document_risk.get('overall_risk', 0):.1f}/100

TOTAL CLAUSES ANALYZED: {len(analysis)}

VIOLATIONS FOUND: {len(violations)}

DETAILED VIOLATIONS:
"""
    
    for idx, v in enumerate(violations[:5], 1):  # Limit to top 5
        prompt += f"""
{idx}. CLAUSE SNIPPET: "{v['clause']}"
   LAW: {v['law']}
   VERDICT: {v['verdict']}
   SEVERITY: {v['severity']}
   ISSUE: {v['description']}
"""
    
    prompt += """

TASK: Explain these findings in simple language for a freelancer or startup founder who may not have legal expertise. Focus on helping them understand:
1. What are the main risks?
2. Why are they problematic under Indian law?
3. What should they do next? (without giving specific legal advice)

Remember: You are explaining the rule engine's determinations, not making your own legal judgments.

Provide your response as a valid JSON object following the structure in the system prompt."""
    
    return prompt


def validate_explanation_structure(explanation: Dict) -> bool:
    """
    Validate that explanation has required structure
    
    Args:
        explanation: Parsed JSON explanation
    
    Returns:
        True if valid structure
    """
    required_keys = ['executive_summary', 'key_risks', 'disclaimer']
    
    if not all(key in explanation for key in required_keys):
        return False
    
    if not isinstance(explanation.get('key_risks'), list):
        return False
    
    return True


def generate_fallback_explanation(document_risk: Dict, analysis: List[Dict]) -> Dict:
    """
    Generate template-based explanation when LLM is unavailable
    
    Args:
        document_risk: Risk summary
        analysis: Analysis results
    
    Returns:
        Structured explanation dict
    """
    # Count violations by severity
    severity_counts = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
    
    for clause_result in analysis:
        legal_check = clause_result.get('legal_check', {})
        for violation in legal_check.get('violations', []):
            severity = violation.get('severity', 'low')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
    
    total_violations = sum(severity_counts.values())
    risk_score = document_risk.get('overall_risk', 0)
    
    # Build summary
    if risk_score >= 70:
        risk_level = "HIGH RISK"
        summary = f"This contract has {total_violations} concerning clauses with a risk score of {risk_score:.0f}/100. Several clauses may be unenforceable under Indian law or create unfair obligations."
    elif risk_score >= 40:
        risk_level = "MEDIUM RISK"
        summary = f"This contract has {total_violations} issues with a risk score of {risk_score:.0f}/100. Some clauses require review and potential negotiation."
    else:
        risk_level = "LOW RISK"
        summary = f"This contract appears relatively fair with a risk score of {risk_score:.0f}/100. Minor issues were found but nothing critical."
    
    # Build key risks
    key_risks = []
    
    if severity_counts['critical'] > 0:
        key_risks.append({
            "title": "Critical Legal Violations Found",
            "explanation": f"{severity_counts['critical']} clause(s) violate fundamental Indian contract law provisions (e.g., Section 27 non-compete restrictions). These clauses are likely void and unenforceable.",
            "severity": "critical"
        })
    
    if severity_counts['high'] > 0:
        key_risks.append({
            "title": "High Risk Clauses Detected",
            "explanation": f"{severity_counts['high']} clause(s) contain unfair or excessive terms that courts may not uphold. These should be negotiated.",
            "severity": "high"
        })
    
    if severity_counts['medium'] > 0:
        key_risks.append({
            "title": "Moderate Concerns Present",
            "explanation": f"{severity_counts['medium']} clause(s) have potential issues. While not necessarily illegal, they may be one-sided or unclear.",
            "severity": "medium"
        })
    
    # Positive aspects
    positive_aspects = []
    safe_clauses = len(analysis) - total_violations
    if safe_clauses > 0:
        positive_aspects.append(f"{safe_clauses} clauses appear fair and compliant with Indian law")
    
    # Action items
    action_items = [
        "Review flagged clauses carefully with the detailed analysis",
        "Consult a qualified lawyer before signing, especially for critical violations",
        "Consider negotiating high-risk clauses",
        "Request clarification on vague or unclear terms"
    ]
    
    if total_violations == 0:
        action_items = [
            "Review the full contract details",
            "Consider consultation with a lawyer for final verification",
            "Ensure you understand all terms before signing"
        ]
    
    return {
        "executive_summary": summary,
        "risk_level": risk_level,
        "key_risks": key_risks,
        "positive_aspects": positive_aspects,
        "action_items": action_items,
        "disclaimer": "⚠️ This analysis is for educational purposes only and does not constitute legal advice. Always consult a qualified lawyer for advice specific to your situation. Laws and their interpretations may vary.",
        "llm_used": False,
        "provider": "template_fallback"
    }
