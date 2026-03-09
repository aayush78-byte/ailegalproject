"""
Rule Loader Module
Loads and validates JSON-based legal rules from the rule directory
Also loads from external database folder if configured
"""
import json
import os
from typing import List, Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class RuleLoader:
    """Loads and manages legal rules from JSON files"""
    
    def __init__(self, rules_base_path: str = "data/rules",
                 external_rules_path: Optional[str] = None):
        self.rules_base_path = Path(rules_base_path)
        self.external_rules_path = Path(external_rules_path) if external_rules_path else None
        self.rules_cache: Dict[str, List[Dict]] = {}
        self.all_rules: List[Dict] = []
        self._load_all_rules()
    
    def _load_all_rules(self):
        """Load all rule files from the rules directory and optional external path"""
        # Load built-in rules
        if self.rules_base_path.exists():
            self._load_from_directory(self.rules_base_path, base_for_relative=self.rules_base_path)
        else:
            logger.warning(f"Rules directory not found: {self.rules_base_path}")

        # Load external database rules (e.g. /Project/database/)
        if self.external_rules_path and self.external_rules_path.exists():
            logger.info(f"Loading external rules from: {self.external_rules_path}")
            self._load_from_directory(
                self.external_rules_path,
                base_for_relative=self.external_rules_path,
                category_override="external"
            )
        elif self.external_rules_path:
            logger.warning(f"External rules path not found: {self.external_rules_path}")
        
        logger.info(f"Total rules loaded: {len(self.all_rules)}")

    def _load_from_directory(self, directory: Path, base_for_relative: Path,
                              category_override: Optional[str] = None):
        """Load all rule JSON files from a directory (recursive)"""
        rule_files = list(directory.rglob("*.json"))
        rule_files = [f for f in rule_files if f.name != "schema.json"]
        
        logger.info(f"Found {len(rule_files)} rule files in {directory}")
        
        for rule_file in rule_files:
            try:
                with open(rule_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    if "rules" in data:
                        rules = data["rules"]
                        # Filter only enabled rules
                        enabled_rules = [r for r in rules if r.get("enabled", True)]
                        
                        # Add source file information
                        for rule in enabled_rules:
                            try:
                                rel = str(rule_file.relative_to(base_for_relative))
                            except ValueError:
                                rel = str(rule_file)
                            rule["_source_file"] = rel
                        
                        # Category-based caching
                        category = category_override if category_override else rule_file.parent.name
                        
                        if category not in self.rules_cache:
                            self.rules_cache[category] = []
                        
                        self.rules_cache[category].extend(enabled_rules)
                        self.all_rules.extend(enabled_rules)
                        
                        logger.info(f"Loaded {len(enabled_rules)} rules from {rule_file.name}")
                    else:
                        logger.warning(f"No 'rules' key found in {rule_file}")
            
            except Exception as e:
                logger.error(f"Error loading rule file {rule_file}: {e}")
    
    def get_all_rules(self) -> List[Dict]:
        """Get all loaded rules"""
        return self.all_rules
    
    def get_rules_by_category(self, category: str) -> List[Dict]:
        """Get rules filtered by category"""
        return [r for r in self.all_rules if r.get("category") == category]
    
    def get_rules_by_severity(self, severity: str) -> List[Dict]:
        """Get rules filtered by severity level"""
        return [r for r in self.all_rules if r.get("severity") == severity]
    
    def get_rule_by_id(self, rule_id: str) -> Optional[Dict]:
        """Get a specific rule by its ID"""
        for rule in self.all_rules:
            if rule.get("rule_id") == rule_id:
                return rule
        return None
    
    def search_rules(self, statute: Optional[str] = None, 
                    category: Optional[str] = None,
                    severity: Optional[str] = None) -> List[Dict]:
        """Search rules with multiple filters"""
        results = self.all_rules
        
        if statute:
            results = [r for r in results if statute.lower() in r.get("statute", "").lower()]
        
        if category:
            results = [r for r in results if r.get("category") == category]
        
        if severity:
            results = [r for r in results if r.get("severity") == severity]
        
        return results
    
    def reload_rules(self):
        """Reload all rules from disk (useful for development)"""
        self.rules_cache.clear()
        self.all_rules.clear()
        self._load_all_rules()
        logger.info("Rules reloaded from disk")
    
    def get_statistics(self) -> Dict:
        """Get rule loading statistics"""
        stats = {
            "total_rules": len(self.all_rules),
            "by_category": {},
            "by_severity": {},
            "by_source": {}
        }
        
        for rule in self.all_rules:
            category = rule.get("category", "unknown")
            stats["by_category"][category] = stats["by_category"].get(category, 0) + 1
            
            severity = rule.get("severity", "unknown")
            stats["by_severity"][severity] = stats["by_severity"].get(severity, 0) + 1
            
            source = rule.get("_source_file", "unknown")
            stats["by_source"][source] = stats["by_source"].get(source, 0) + 1
        
        return stats


# Singleton instance
_rule_loader_instance = None


def get_rule_loader(rules_base_path: str = "data/rules",
                    external_rules_path: Optional[str] = None) -> RuleLoader:
    """Get or create the singleton RuleLoader instance.
    
    On first call, reads EXTERNAL_RULES_PATH from config if external_rules_path
    is not explicitly provided.
    """
    global _rule_loader_instance
    if _rule_loader_instance is None:
        if external_rules_path is None:
            try:
                from config import EXTERNAL_RULES_PATH
                external_rules_path = EXTERNAL_RULES_PATH
            except (ImportError, AttributeError):
                pass
        _rule_loader_instance = RuleLoader(rules_base_path, external_rules_path)
    return _rule_loader_instance
