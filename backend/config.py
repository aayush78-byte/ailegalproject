import os

# Session TTL (Time To Live)
SESSION_TTL_MINUTES = 30  # Auto-delete after 30 minutes

# File upload limits
MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc'}

# Vector store settings
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHROMA_PERSIST_DIR = "./chroma_db"
CHROMA_COLLECTION_NAME = "indian_laws"

# Risk scoring weights — legal violations drive 70% of score
RISK_WEIGHTS = {
    "legal_invalidity": 0.70,   # primary signal
    "deviation_severity": 0.20,
    "frequency_factor": 0.10
}

# Risk thresholds
RISK_LEVELS = {
    "low": (0, 30),
    "medium": (30, 55),
    "high": (55, 80),
    "critical": (80, 100)
}

# Scores by severity level (matches rule 'severity' field)
SEVERITY_SCORES = {
    "critical": 95,
    "high": 75,
    "medium": 40,
    "low": 15,
    # Legacy category-based keys kept for backward compat
    "section_27_violation": 90,
    "section_23_violation": 95,
    "section_74_violation": 70,
    "ip_overreach": 60,
    "unfair_terms": 55,
    "unclear_terms": 40,
    "restraint_of_trade": 90,
    "unlawful_consideration": 95,
    "excessive_penalty": 70,
    "jurisdiction": 50,
    "no_violation": 0
}

# Deviation thresholds (compared to fair template)
DEVIATION_THRESHOLDS = {
    "duration_months": 12,  # Fair: ≤12 months
    "penalty_percentage": 10,  # Fair: ≤10% of salary
    "notice_period_days": 30,  # Fair: 30 days
}

# LLM Provider Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "deepseek")  # deepseek|openai|gemini
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "500"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))

# Rule System Paths
RULES_BASE_PATH = os.path.join(os.path.dirname(__file__), "data", "rules")
RULE_SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "data", "rules", "schema.json")

# Clause splitting parameters
MIN_CLAUSE_LENGTH = 30  # Minimum characters for valid clause
MAX_CLAUSE_LENGTH = 2000  # Maximum characters per clause

# Indian law data files
INDIAN_LAWS_JSON = os.path.join(os.path.dirname(__file__), "data", "indian_laws.json")
FAIR_CONTRACT_JSON = os.path.join(os.path.dirname(__file__), "data", "fair_contract.json")

# External rules database - Simplified to None as rules are consolidated
EXTERNAL_RULES_PATH = None

# Logging
LOG_LEVEL = "INFO"