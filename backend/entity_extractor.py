"""
Entity Extractor Module
Extracts legal entities from contract text using NLP and regex patterns
Handles: durations, amounts, percentages, dates, geographic scope
"""
import re
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class EntityExtractor:
    """Extracts structured entities from legal text"""
    
    # Duration patterns
    DURATION_PATTERNS = [
        (r'(\d+)\s*years?', lambda x: int(x) * 365),
        (r'(\d+)\s*months?', lambda x: int(x) * 30),
        (r'(\d+)\s*weeks?', lambda x: int(x) * 7),
        (r'(\d+)\s*days?', lambda x: int(x)),
    ]
    
    # Amount patterns (INR)
    AMOUNT_PATTERNS = [
        (r'(\d+(?:\.\d+)?)\s*crores?', lambda x: float(x) * 10000000),
        (r'(\d+(?:\.\d+)?)\s*lakhs?', lambda x: float(x) * 100000),
        (r'(?:Rs\.?|INR|₹)\s*([\\d,]+(?:\.\d+)?)', lambda x: float(x.replace(',', ''))),
    ]
    
    # Percentage patterns
    PERCENTAGE_PATTERNS = [
        r'(\d+(?:\.\d+)?)\s*(?:%|percent|percentage)',
    ]
    
    # Geographic scope keywords
    GEOGRAPHIC_KEYWORDS = {
        'city': ['city', 'town', 'downtown', 'within city limits'],
        'state': ['state', 'province', 'region'],
        'country': ['india', 'country', 'nationwide', 'nationally'],
        'worldwide': ['worldwide', 'globally', 'international', 'anywhere in the world', 'any country'],
    }
    
    def extract_durations(self, text: str) -> List[Dict]:
        """
        Extract duration mentions from text
        Returns list of {value_days, text, confidence}
        """
        text_lower = text.lower()
        durations = []
        
        for pattern, converter in self.DURATION_PATTERNS:
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                try:
                    value = converter(match.group(1))
                    durations.append({
                        'value_days': value,
                        'text': match.group(0),
                        'confidence': 'high',
                        'position': match.span()
                    })
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing duration: {e}")
        
        # Remove duplicates based on value
        seen_values = set()
        unique_durations = []
        for d in durations:
            if d['value_days'] not in seen_values:
                seen_values.add(d['value_days'])
                unique_durations.append(d)
        
        return sorted(unique_durations, key=lambda x: x['value_days'], reverse=True)
    
    def extract_amounts(self, text: str) -> List[Dict]:
        """
        Extract monetary amounts from text (in INR)
        Returns list of {value_inr, text, confidence}
        """
        amounts = []
        
        for pattern, converter in self.AMOUNT_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    value = converter(match.group(1))
                    amounts.append({
                        'value_inr': value,
                        'text': match.group(0),
                        'confidence': 'high',
                        'position': match.span()
                    })
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing amount: {e}")
        
        # Remove duplicates
        seen_values = set()
        unique_amounts = []
        for a in amounts:
            if a['value_inr'] not in seen_values:
                seen_values.add(a['value_inr'])
                unique_amounts.append(a)
        
        return sorted(unique_amounts, key=lambda x: x['value_inr'], reverse=True)
    
    def extract_percentages(self, text: str) -> List[Dict]:
        """
        Extract percentage values from text
        Returns list of {value, text, confidence}
        """
        percentages = []
        
        for pattern in self.PERCENTAGE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    value = float(match.group(1))
                    percentages.append({
                        'value': value,
                        'text': match.group(0),
                        'confidence': 'high',
                        'position': match.span()
                    })
                except (ValueError, IndexError) as e:
                    logger.debug(f"Error parsing percentage: {e}")
        
        # Remove duplicates
        seen_values = set()
        unique_percentages = []
        for p in percentages:
            if p['value'] not in seen_values:
                seen_values.add(p['value'])
                unique_percentages.append(p)
        
        return sorted(unique_percentages, key=lambda x: x['value'], reverse=True)
    
    def extract_geographic_scope(self, text: str) -> List[str]:
        """
        Extract geographic scope indicators
        Returns list of scope levels: ['city', 'state', 'country', 'worldwide']
        """
        text_lower = text.lower()
        scopes = []
        
        for scope_level, keywords in self.GEOGRAPHIC_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if scope_level not in scopes:
                        scopes.append(scope_level)
                    break
        
        return scopes
    
    def extract_all_entities(self, text: str) -> Dict:
        """
        Extract all entity types from text
        Returns comprehensive entity dictionary
        """
        entities = {
            'durations': self.extract_durations(text),
            'amounts': self.extract_amounts(text),
            'percentages': self.extract_percentages(text),
            'geographic_scopes': self.extract_geographic_scope(text),
        }
        
        # Add summary flags
        entities['has_duration'] = len(entities['durations']) > 0
        entities['has_amount'] = len(entities['amounts']) > 0
        entities['has_percentage'] = len(entities['percentages']) > 0
        entities['has_geographic_scope'] = len(entities['geographic_scopes']) > 0
        
        # Get max values for easy access
        if entities['durations']:
            entities['max_duration_days'] = entities['durations'][0]['value_days']
            entities['max_duration_text'] = entities['durations'][0]['text']
        
        if entities['amounts']:
            entities['max_amount_inr'] = entities['amounts'][0]['value_inr']
            entities['max_amount_text'] = entities['amounts'][0]['text']
        
        if entities['percentages']:
            entities['max_percentage'] = entities['percentages'][0]['value']
            entities['max_percentage_text'] = entities['percentages'][0]['text']
        
        return entities
    
    def format_duration_text(self, days: int) -> str:
        """Convert days to human-readable format"""
        if days >= 365:
            years = days / 365
            if years == int(years):
                return f"{int(years)} year{'s' if years != 1 else ''}"
            else:
                return f"{years:.1f} years"
        elif days >= 30:
            months = days / 30
            if months == int(months):
                return f"{int(months)} month{'s' if months != 1 else ''}"
            else:
                return f"{months:.1f} months"
        else:
            return f"{days} day{'s' if days != 1 else ''}"
    
    def format_amount_text(self, inr: float) -> str:
        """Convert INR amount to human-readable format"""
        if inr >= 10000000:  # Crores
            crores = inr / 10000000
            return f"₹{crores:.2f} crores"
        elif inr >= 100000:  # Lakhs
            lakhs = inr / 100000
            return f"₹{lakhs:.2f} lakhs"
        else:
            return f"₹{inr:,.2f}"


# Singleton instance
_entity_extractor_instance = None


def get_entity_extractor() -> EntityExtractor:
    """Get or create the singleton EntityExtractor instance"""
    global _entity_extractor_instance
    if _entity_extractor_instance is None:
        _entity_extractor_instance = EntityExtractor()
    return _entity_extractor_instance
