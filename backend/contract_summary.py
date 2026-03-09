"""
Contract Summary Generator
Generates overall contract risk summary from clause analysis results
"""
from typing import Dict, List


def generate_contract_summary(results: List[Dict], overall_risk: float) -> Dict:
    """
    Generate a summary of the entire contract analysis
    
    Args:
        results: List of clause analysis results
        overall_risk: Overall risk score (0-100)
    
    Returns:
        Dictionary containing contract summary
    """
    # Count violations by severity
    severity_counts = {
        'critical': 0,
        'high': 0,
        'medium': 0,
        'low': 0
    }
    
    total_violations = 0
    
    for clause_result in results:
        legal_check = clause_result.get('legal_check', {})
        violations = legal_check.get('violations', [])
        
        for violation in violations:
            severity = violation.get('severity', 'low')
            if severity in severity_counts:
                severity_counts[severity] += 1
            total_violations += 1
    
    # Determine overall risk level
    if overall_risk >= 70:
        risk_level = "HIGH"
        risk_category = "Critical Risk"
    elif overall_risk >= 40:
        risk_level = "MEDIUM"
        risk_category = "Moderate Risk"
    else:
        risk_level = "LOW"
        risk_category = "Low Risk"
    
    # Generate key findings
    key_findings = []
    
    if severity_counts['critical'] > 0:
        key_findings.append(
            f"{severity_counts['critical']} critical violation(s) found - likely unenforceable under Indian law"
        )
    
    if severity_counts['high'] > 0:
        key_findings.append(
            f"{severity_counts['high']} high-risk clause(s) detected - should be negotiated"
        )
    
    if severity_counts['medium'] > 0:
        key_findings.append(
            f"{severity_counts['medium']} moderate concern(s) - review recommended"
        )
    
    if total_violations == 0:
        key_findings.append("No major violations detected - contract appears compliant")
    
    # Calculate safety percentage
    safe_clauses = len(results) - total_violations
    safety_percentage = (safe_clauses / len(results) * 100) if results else 0
    
    return {
        "overall_risk": overall_risk,
        "risk_level": risk_level,
        "risk_category": risk_category,
        "total_clauses": len(results),
        "total_violations": total_violations,
        "severity_breakdown": severity_counts,
        "safe_clauses": safe_clauses,
        "safety_percentage": round(safety_percentage, 1),
        "key_findings": key_findings,
        "recommendation": _get_recommendation(overall_risk, severity_counts)
    }


def _get_recommendation(overall_risk: float, severity_counts: Dict) -> str:
    """
    Get recommendation based on risk analysis
    
    Args:
        overall_risk: Overall risk score
        severity_counts: Count of violations by severity
    
    Returns:
        Recommendation string
    """
    if severity_counts['critical'] > 0:
        return "DO NOT SIGN - Consult a lawyer immediately. Critical violations found."
    elif overall_risk >= 70:
        return "HIGH RISK - Do not sign without major revisions and legal consultation."
    elif overall_risk >= 40:
        return "PROCEED WITH CAUTION - Negotiate problematic clauses before signing."
    else:
        return "LOOKS REASONABLE - Still recommend legal review before signing."
