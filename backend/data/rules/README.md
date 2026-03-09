# Legal Rule Management Guide

## Overview

The AI Legal Sentinel uses a **modular JSON-based rule system** that allows you to easily add, modify, and manage legal rules without touching the codebase.

All rules are stored in the `data/rules/` directory, organized by legal category.

## Directory Structure

```
data/rules/
├── schema.json                  # JSON schema definition
├── ica/                        # Indian Contract Act rules
│   ├── section_27.json         # Restraint of trade
│   ├── section_23.json         # Unlawful consideration
│   └── section_74.json         # Penalty clauses
├── ip/                         # Intellectual Property rules
│   └── copyright.json          # Copyright assignment
├── general/                    # General contract rules
│   └── unfair_terms.json       # Unfair/one-sided terms
└── labour/                     # Labour law rules (add your own)
```

## Rule JSON Format

Each rule file follows this structure:

```json
{
  "rules": [
    {
      "rule_id": "UNIQUE_RULE_ID",
      "statute": "Legal statute reference",
      "category": "rule_category",
      "severity": "critical|high|medium|low",
      "patterns": {
        "required_keywords": ["must", "contain", "one"],
        "required_all_keywords": ["must", "contain", "all"],
        "optional_keywords": ["boost", "confidence"],
        "exclusion_keywords": ["negate", "rule"],
        "regex_patterns": ["pattern1", "pattern2"]
      },
      "conditions": {
        "min_duration_days": 365,
        "min_percentage": 20,
        "min_amount_inr": 100000
      },
      "verdict": "Likely Void",
      "confidence": "high",
      "explanation_template": "Text with {duration_text} {amount_text} placeholders",
      "recommendation": "What to do about this violation",
      "legal_reference": "Full statute text or link",
      "examples": ["Example clause 1", "Example clause 2"],
      "enabled": true
    }
  ]
}
```

## Rule Schema Fields

### Required Fields

- **rule_id**: Unique identifier (e.g., `ICA_S27_NONCOMPETE_001`)
- **statute**: Legal reference (e.g., `"Section 27, Indian Contract Act, 1872"`)
- **category**: Rule category from allowed list (see below)
- **severity**: `critical`, `high`, `medium`, or `low`
- **patterns**: Pattern matching configuration
- **verdict**: Legal verdict string

### Pattern Matching

- **required_keywords** (OR logic): At least ONE keyword must be present
- **required_all_keywords** (AND logic): ALL keywords must be present
- **optional_keywords**: Boost confidence if present
- **exclusion_keywords**: Rule doesn't apply if these are found
- **regex_patterns**: Regular expressions for advanced matching

### Entity-Based Conditions

- **min_duration_days**: Minimum duration threshold (in days)
- **max_duration_days**: Maximum duration threshold
- **min_percentage**: Minimum percentage threshold
- **max_percentage**: Maximum percentage threshold
- **min_amount_inr**: Minimum amount threshold (in INR)
- **geographic_scope**: Geographic scope indicators

### Explanation Templates

Use placeholders in `explanation_template`:
- `{duration_text}` - Auto-filled with extracted duration (e.g., "for 2 years")
- `{amount_text}` - Auto-filled with extracted amount (e.g., "of ₹5 lakhs")
- `{percentage_text}` - Auto-filled with percentage (e.g., "(25%)")
- `{geographic_text}` - Auto-filled with geographic scope

## Allowed Categories

```
- restraint_of_trade
- unlawful_consideration
- excessive_penalty
- ip_overreach
- unfair_terms
- unclear_terms
- payment_terms
- jurisdiction
- indemnity
- labour_rights
- termination
- confidentiality
```

## How to Add a New Rule

### Step 1: Choose or Create Rule File

Navigate to `data/rules/` and choose the appropriate subdirectory:
- ICA rules → `ica/`
- IP rules → `ip/`
- General rules → `general/`
- Create new category → Create new folder

### Step 2: Edit  JSON File

```json
{
  "rules": [
    ... existing rules ...,
    {
      "rule_id": "YOUR_NEW_RULE_001",
      "statute": "Relevant Indian Law",
      "category": "appropriate_category",
      "severity": "high",
      "patterns": {
        "required_keywords": ["keyword1", "keyword2"],
        "exclusion_keywords": ["exception keyword"]
      },
      "verdict": "High Risk",
      "explanation_template": "Simple explanation of the issue",
      "recommendation": "What should be done",
      "enabled": true
    }
  ]
}
```

### Step 3: Test Your Rule

1. Start the backend: `python app.py`
2. Upload a test contract containing your target clause
3. Check if the rule fires correctly
4. Adjust patterns, keywords, or conditions as needed

### Step 4: Hot Reload (Development)

The rule loader caches rules on startup. To reload without restarting:
```python
from rule_loader import get_rule_loader
loader = get_rule_loader()
loader.reload_rules()
```

## Best Practices

### 1. Unique Rule IDs
Use format: `CATEGORY_SECTION_DESCRIPTION_NUMBER`
```
✅ ICA_S27_NONCOMPETE_001
✅ IP_COPYRIGHT_OVERREACH_002
❌ rule1
❌ noncompete
```

### 2. Specific Keywords
Use precise legal terminology:
```json
✅ "required_keywords": ["non-compete", "covenant not to compete", "restriction on employment"]
❌ "required_keywords": ["work", "job"]
```

### 3. Use Exclusion Keywords

Prevent false positives:
```json
{
  "required_keywords": ["non-compete"],
  "exclusion_keywords": ["sale of business", "goodwill"]
}
```

### 4. Set Appropriate Severity
- **critical**: Void/completely unenforceable (Section 27, 23)
- **high**: Likely unenforceable, serious risk
- **medium**: Unfair but not necessarily void
- **low**: Minor concerns, review recommended

### 5. Clear Explanations
Write for non-lawyers:
```
✅ "This clause prevents you from working in your field after leaving, which is illegal in India."
❌ "Clause violates ICA §27 restraint provisions per precedent."
```

## Entity Extraction Examples

The system automatically extracts:

**Durations:**
- "2 years" → 730 days
- "18 months" → 540 days  
- "90 days" → 90 days

**Amounts:**
- "Rs. 5,00,000" → 500000 INR
- "2 crores" → 20000000 INR
- "10 lakhs" → 1000000 INR

**Percentages:**
- "25% of salary" → 25
- "50 percent" → 50

**Geographic Scope:**
- Detects: city, state, country, worldwide

## Common Patterns

### Non-Compete Detection
```json
{
  "patterns": {
    "required_keywords": ["non-compete", "not compete", "shall not engage"],
    "optional_keywords": ["competitors", "competitive business"],
    "regex_patterns": ["shall\\s+not\\s+(work|engage|join)"]
  },
  "conditions": {
    "min_duration_days": 1
  }
}
```

### Excessive Penalty Detection
```json
{
  "patterns": {
    "required_keywords": ["penalty", "liquidated damages"],
    "regex_patterns": ["(\\d+)\\s*(%|percent)\\s*of\\s*salary"]
  },
  "conditions": {
    "min_percentage": 20
  }
}
```

### IP Overreach Detection
```json
{
  "patterns": {
    "required_keywords": ["intellectual property", "copyright"],
    "optional_keywords": ["all work", "personal projects", "off-duty"],
    "exclusion_keywords": ["during employment only"]
  }
}
```

## Troubleshooting

### Rule Not Firing

1. **Check keywords**: Are they in the clause text?
2. **Check conditions**: Are entities being extracted?
3. **Check exclusions**: Are exclusion keywords present?
4. **Enable logging**: Set `LOG_LEVEL=DEBUG` in `.env`

### False Positives

1. **Add exclusion keywords**
2. **Make required_keywords more specific**
3. **Add entity conditions** (duration, amount thresholds)
4. **Use regex patterns** for precise matching

### Low Confidence Scores

1. **Add more optional keywords**
2. **Use regex patterns**
3. **Increase pattern specificity**

## Example: Adding a Payment Terms Rule

Create: `data/rules/general/payment_terms.json`

```json
{
  "rules": [
    {
      "rule_id": "PAYMENT_DELAYED_001",
      "statute": "General Contract Principles",
      "category": "payment_terms",
      "severity": "medium",
      "patterns": {
        "required_keywords": ["payment", "disbursement"],
        "optional_keywords": ["delayed", "after completion", "net 90"],
        "regex_patterns": ["net\\s+(\\d+)\\s+days"]
      },
      "conditions": {
        "min_duration_days": 60
      },
      "verdict": "Review Needed",
      "confidence": "medium",
      "explanation_template": "Payment terms require waiting{duration_text}, which may cause cash flow issues for freelancers. Standard practice is net 30-45 days.",
      "recommendation": "Negotiate for shorter payment terms (net 30 days) or request milestone-based payments.",
      "enabled": true
    }
  ]
}
```

## Validation

Before deployment, validate your rules:

```bash
# Check JSON syntax
python -c "import json; json.load(open('data/rules/ica/section_27.json'))"

# Run tests
pytest test_rule_engine.py
```

## Questions?

For issues or questions about rule creation, refer to:
- Main README.md
- Implementation plan
- Example rules in existing files
