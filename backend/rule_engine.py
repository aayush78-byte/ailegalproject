"""
Enhanced Rule Engine with JSON-based Rules
Deterministic legal verification against Indian Contract Act
Uses entity extraction and pattern matching for accurate detection
"""
import re
import logging
import warnings
from typing import Dict, List, Optional
from config import SEVERITY_SCORES
from rule_loader import get_rule_loader
from entity_extractor import get_entity_extractor

logger = logging.getLogger(__name__)


class PatternMatcher:
    """Advanced pattern matching for legal clauses"""
    
    @staticmethod
    def matches_keywords(text: str, required_keywords: List[str] = None,
                        required_all_keywords: List[str] = None,
                        optional_keywords: List[str] = None,
                        exclusion_keywords: List[str] = None) -> Dict:
        """
        Check if text matches keyword patterns
        Returns: {matched: bool, confidence: float, matched_keywords: list}
        """
        text_lower = text.lower()
        result = {
            'matched': False,
            'confidence': 0.0,
            'matched_keywords': []
        }
        
        # Check exclusion keywords first (disqualifiers)
        if exclusion_keywords:
            for keyword in exclusion_keywords:
                if keyword.lower() in text_lower:
                    logger.debug(f"Exclusion keyword found: {keyword}")
                    return result  # Early exit, no match
        
        # Check required_all_keywords (AND logic)
        if required_all_keywords:
            all_found = all(kw.lower() in text_lower for kw in required_all_keywords)
            if not all_found:
                return result  # Must have ALL required keywords
            result['matched_keywords'].extend([kw for kw in required_all_keywords if kw.lower() in text_lower])
        
        # Check required_keywords (OR logic)
        if required_keywords:
            found_any = False
            for keyword in required_keywords:
                if keyword.lower() in text_lower:
                    found_any = True
                    result['matched_keywords'].append(keyword)
            
            if not found_any:
                return result  # Not matched
        
        # If we get here, basic requirements are met
        result['matched'] = True
        result['confidence'] = 0.7  # Base confidence
        
        # Boost confidence with optional keywords
        if optional_keywords:
            optional_matches = sum(1 for kw in optional_keywords if kw.lower() in text_lower)
            if optional_matches > 0:
                boost = min(0.3, optional_matches * 0.1)
                result['confidence'] += boost
                result['matched_keywords'].extend([kw for kw in optional_keywords if kw.lower() in text_lower])
        
        result['confidence'] = min(1.0, result['confidence'])
        return result
    
    @staticmethod
    def matches_regex(text: str, patterns: List[str]) -> Dict:
        """
        Check if text matches regex patterns
        Returns: {matched: bool, matched_patterns: list}
        """
        result = {
            'matched': False,
            'matched_patterns': []
        }
        
        for pattern in patterns:
            try:
                if re.search(pattern, text, re.IGNORECASE):
                    result['matched'] = True
                    result['matched_patterns'].append(pattern)
            except re.error as e:
                logger.error(f"Invalid regex pattern: {pattern}, error: {e}")
        
        return result


def verify_clause(clause_text: str, relevant_law: Optional[Dict] = None) -> Dict:
    """
    CORE LEGAL VERIFICATION ENGINE
    Uses JSON-based rules and entity extraction
    
    Args:
        clause_text: Contract clause to verify
        relevant_law: Most relevant law from vector store
    
    Returns:
        dict: {
            is_valid: bool,
            violations: list of violation dicts,
            risk_level: str,
            applicable_sections: list
        }
    """
    rule_loader = get_rule_loader()
    entity_extractor = get_entity_extractor()
    matcher = PatternMatcher()
    
    # Extract entities from clause
    entities = entity_extractor.extract_all_entities(clause_text)
    
    violations = []
    applicable_sections = []
    
    # Get all rules
    all_rules = rule_loader.get_all_rules()
    
    for rule in all_rules:
        violation = check_rule(clause_text, rule, entities, matcher)
        if violation:
            violations.append(violation)
            
            # Track applicable statute
            statute = rule.get('statute', '')
            if statute and statute not in applicable_sections:
                applicable_sections.append(statute)
    
    # Determine overall validity
    critical_violations = [v for v in violations if v['severity'] in ['critical', 'high']]
    is_valid = len(critical_violations) == 0
    
    # Calculate risk level
    risk_level = calculate_risk_level(violations)
    
    return {
        "is_valid": is_valid,
        "violations": violations,
        "risk_level": risk_level,
        "applicable_sections": applicable_sections,
        "total_violations": len(violations),
        "entities_found": entities
    }


def check_rule(clause_text: str, rule: Dict, entities: Dict, matcher: PatternMatcher) -> Optional[Dict]:
    """
    Check if a single rule is violated
    
    Args:
        clause_text: The clause text
        rule: Rule definition from JSON
        entities: Extracted entities
        matcher: Pattern matcher instance
    
    Returns:
        Violation dict if rule is triggered, None otherwise
    """
    patterns = rule.get('patterns', {})
    conditions = rule.get('conditions', {})
    
    # Step 1: Check keyword patterns
    keyword_match = matcher.matches_keywords(
        clause_text,
        required_keywords=patterns.get('required_keywords'),
        required_all_keywords=patterns.get('required_all_keywords'),
        optional_keywords=patterns.get('optional_keywords'),
        exclusion_keywords=patterns.get('exclusion_keywords')
    )
    
    if not keyword_match['matched']:
        return None  # Keywords don't match
    
    # Step 2: Check regex patterns (optional boost — if regex matches, confidence goes up;
    #          if no regex at all or no match, keyword match is still sufficient to flag)
    regex_patterns = patterns.get('regex_patterns', [])
    if regex_patterns:
        regex_match = matcher.matches_regex(clause_text, regex_patterns)
        if regex_match['matched']:
            keyword_match['confidence'] = min(1.0, keyword_match['confidence'] + 0.15)
    
    # Step 3: Check entity-based conditions
    if not check_entity_conditions(entities, conditions):
        return None  # Conditions not met
    
    # Rule is triggered! Build violation
    violation = build_violation(rule, entities, keyword_match['confidence'])
    
    return violation


def check_entity_conditions(entities: Dict, conditions: Dict) -> bool:
    """
    Check if extracted entities meet rule conditions
    
    Args:
        entities: Extracted entities
        conditions: Rule conditions
    
    Returns:
        True if conditions are met
    """
    if not conditions:
        return True  # No conditions to check
    
    # Duration conditions
    if 'min_duration_days' in conditions:
        if not entities.get('has_duration'):
            return False
        if entities['max_duration_days'] < conditions['min_duration_days']:
            return False
    
    if 'max_duration_days' in conditions:
        if entities.get('has_duration'):
            if entities['max_duration_days'] > conditions['max_duration_days']:
                return False
    
    # Percentage conditions
    if 'min_percentage' in conditions:
        if not entities.get('has_percentage'):
            return False
        if entities['max_percentage'] < conditions['min_percentage']:
            return False
    
    if 'max_percentage' in conditions:
        if entities.get('has_percentage'):
            if entities['max_percentage'] > conditions['max_percentage']:
                return False
    
    # Amount conditions
    if 'min_amount_inr' in conditions:
        if not entities.get('has_amount'):
            return False
        if entities['max_amount_inr'] < conditions['min_amount_inr']:
            return False
    
    # Geographic scope conditions
    if 'geographic_scope' in conditions:
        required_scopes = conditions['geographic_scope']
        found_scopes = entities.get('geographic_scopes', [])
        if not any(scope in found_scopes for scope in required_scopes):
            return False
    
    return True


def build_violation(rule: Dict, entities: Dict, confidence: float) -> Dict:
    """
    Build violation dictionary from triggered rule
    
    Args:
        rule: Rule definition
        entities: Extracted entities
        confidence: Match confidence score
    
    Returns:
        Violation dictionary
    """
    # Build explanation with entity substitution
    explanation_template = rule.get('explanation_template', '')
    explanation = substitute_entities(explanation_template, entities)
    
    violation = {
        "rule_id": rule.get('rule_id'),
        "type": rule.get('category'),
        "severity": rule.get('severity'),
        "law": rule.get('statute'),
        "verdict": rule.get('verdict'),
        "description": explanation,
        "recommendation": rule.get('recommendation', ''),
        "confidence": rule.get('confidence', 'medium'),
        "match_confidence": confidence,
        "legal_reference": rule.get('legal_reference', ''),
        "source_file": rule.get('_source_file', 'unknown')
    }
    
    return violation


def substitute_entities(template: str, entities: Dict) -> str:
    """
    Substitute entity placeholders in explanation template
    
    Placeholders:
        {duration_text} - Human readable duration
        {amount_text} - Human readable amount
        {percentage_text} - Percentage value
        {geographic_text} - Geographic scope
    
    Args:
        template: Template string with placeholders
        entities: Extracted entities
    
    Returns:
        Substituted string
    """
    extractor = get_entity_extractor()
    result = template
    
    # Duration substitution
    if '{duration_text}' in result:
        if entities.get('has_duration'):
            duration_days = entities['max_duration_days']
            duration_str = f" for {extractor.format_duration_text(duration_days)}"
        else:
            duration_str = ""
        result = result.replace('{duration_text}', duration_str)
    
    # Amount substitution
    if '{amount_text}' in result:
        if entities.get('has_amount'):
            amount_inr = entities['max_amount_inr']
            amount_str = f" of {extractor.format_amount_text(amount_inr)}"
        else:
            amount_str = ""
        result = result.replace('{amount_text}', amount_str)
    
    # Percentage substitution
    if '{percentage_text}' in result:
        if entities.get('has_percentage'):
            percentage = entities['max_percentage']
            percentage_str = f" ({percentage}%)"
        else:
            percentage_str = ""
        result = result.replace('{percentage_text}', percentage_str)
    
    # Geographic substitution
    if '{jurisdiction}' in result or '{geographic_text}' in result:
        if entities.get('has_geographic_scope'):
            scopes = entities['geographic_scopes']
            geographic_str = f" ({', '.join(scopes)})"
        else:
            geographic_str = ""
        result = result.replace('{jurisdiction}', geographic_str)
        result = result.replace('{geographic_text}', geographic_str)
    
    return result


def calculate_risk_level(violations: List[Dict]) -> str:
    """
    Calculate overall risk level based on violations
    
    Args:
        violations: List of violation dicts
    
    Returns:
        Risk level string: critical, high, medium, low
    """
    if not violations:
        return "low"
    
    # Calculate max severity score
    severity_map = {
        "critical": 100,
        "high": 75,
        "medium": 50,
        "low": 25
    }
    
    max_severity = 0
    for violation in violations:
        severity = violation.get('severity', 'low')
        score = severity_map.get(severity, 0)
        max_severity = max(max_severity, score)
    
    # Map to risk level
    if max_severity >= 85:
        return "critical"
    elif max_severity >= 60:
        return "high"
    elif max_severity >= 30:
        return "medium"
    else:
        return "low"


# Backward compatibility functions (keep existing API)
def check_section_27(clause_text: str) -> Optional[Dict]:
    """Legacy function - now uses JSON rules"""
    warnings.warn("check_section_27 is deprecated, use verify_clause instead", DeprecationWarning)
    result = verify_clause(clause_text)
    section_27_violations = [v for v in result['violations'] if 'Section 27' in v.get('law', '')]
    return section_27_violations[0] if section_27_violations else None


def check_section_23(clause_text: str) -> Optional[Dict]:
    """Legacy function - now uses JSON rules"""
    import warnings
    warnings.warn("check_section_23 is deprecated, use verify_clause instead", DeprecationWarning)
    result = verify_clause(clause_text)
    section_23_violations = [v for v in result['violations'] if 'Section 23' in v.get('law', '')]
    return section_23_violations[0] if section_23_violations else None


def check_section_74(clause_text: str) -> Optional[Dict]:
    """Legacy function - now uses JSON rules"""
    import warnings
    warnings.warn("check_section_74 is deprecated, use verify_clause instead", DeprecationWarning)
    result = verify_clause(clause_text)
    section_74_violations = [v for v in result['violations'] if 'Section 74' in v.get('law', '')]
    return section_74_violations[0] if section_74_violations else None


def check_ip_overreach(clause_text: str) -> Optional[Dict]:
    """Legacy function - now uses JSON rules"""
    import warnings
    warnings.warn("check_ip_overreach is deprecated, use verify_clause instead", DeprecationWarning)
    result = verify_clause(clause_text)
    ip_violations = [v for v in result['violations'] if v.get('type') == 'ip_overreach']
    return ip_violations[0] if ip_violations else None


def check_unfair_terms(clause_text: str) -> Optional[Dict]:
    """Legacy function - now uses JSON rules"""
    import warnings
    warnings.warn("check_unfair_terms is deprecated, use verify_clause instead", DeprecationWarning)
    result = verify_clause(clause_text)
    unfair_violations = [v for v in result['violations'] if v.get('type') == 'unfair_terms']
    return unfair_violations[0] if unfair_violations else None


def check_clarity(clause_text: str) -> Optional[Dict]:
    """Legacy function - now uses JSON rules"""
    import warnings
    warnings.warn("check_clarity is deprecated, use verify_clause instead", DeprecationWarning)
    result = verify_clause(clause_text)
    clarity_violations = [v for v in result['violations'] if v.get('type') == 'unclear_terms']
    return clarity_violations[0] if clarity_violations else None