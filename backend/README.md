# AI Legal Sentinel for India - Backend

**Production-ready MVP** for analyzing freelance contracts against Indian law using a **deterministic rule engine** + **AI explanations**.

## 🎯 Core Philosophy

This is **NOT** a generic contract chatbot. This **IS** a statute-grounded legal compliance engine:

✅ **Rule engine makes legal decisions** (deterministic, based on Indian Contract Act)  
✅ **LLM generates explanations only** (ELI5, cites statutes, no legal advice)  
✅ **Zero persistent storage** (in-memory processing, TTL auto-delete)  
✅ **Modular JSON rules** (easily add new Indian laws without coding)

---

## 🚀 What's New (Enhanced Version)

### 1. **Modular JSON Rule System**
- All legal rules in `data/rules/` as JSON files
- Add new rules without touching code
- Hot-reload support for development
- See [Rule Management Guide](data/rules/README.md)

### 2. **Multi-LLM Provider Support**
- **DeepSeek** (default, recommended)
- **OpenAI** (GPT-4)
- **Google Gemini**
- Switch providers via environment variable
- Automatic fallback when LLM unavailable

### 3. **Advanced Entity Extraction**
- NLP-based extraction of:
  - Durations (years/months/days)
  - Amounts (crores/lakhs/rupees)
  - Percentages
  - Geographic scope
- Context-aware rule triggering

### 4. **Enhanced Legal Coverage**
- ✅ ICA Section 27 (Non-compete) - 4 rule variants
- ✅ ICA Section 23 (Unlawful object) - 3 rule variants
- ✅ ICA Section 74 (Excessive penalty) - 3 rule variants
- ✅ IP/Copyright overreach - 4 rule variants
- ✅ Unfair terms - 5 rule variants

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Upload PDF/DOCX│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Text Extraction │ (PyMuPDF/python-docx/OCR)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Clause Splitting │ (Regex + NLP)
└────────┬────────┘
         │
         ▼
┌─────────────────┐        ┌──────────────┐
│  RAG Retrieval  │◄───────┤ Indian Laws  │
│  (Vector Store) │        │   (ChromaDB) │
└────────┬────────┘        └──────────────┘
         │
         ▼
┌─────────────────┐        ┌──────────────┐
│ Entity Extract  │        │  JSON Rules  │
│ (NLP + Regex)   │        │ data/rules/  │
└────────┬────────┘        └──────┬───────┘
         │                         │
         ▼                         ▼
┌──────────────────────────────────┐
│   DETERMINISTIC RULE ENGINE      │ ◄── LEGAL DECISION MADE HERE
│ - Pattern matching (keywords)     │
│ - Condition checking (entities)   │
│ - Confidence scoring              │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Risk Scoring   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐        ┌──────────────┐
│ LLM Explanation │◄───────┤ DeepSeek/GPT │
│  (ELI5 only)    │        │    /Gemini   │
└────────┬────────┘        └──────────────┘
         │
         ▼
┌─────────────────┐
│ Return Results  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TTL Purge      │ (Auto-delete after 30 min)
└─────────────────┘
```

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd sharma-ka-backend
pip install -r requirements.txt
```

### 2. Install System Dependencies (for OCR)

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Required: Set your LLM API key**

```bash
# Choose provider (deepseek, openai, or gemini)
LLM_PROVIDER=deepseek

# Add your API key
DEEPSEEK_API_KEY=sk-your-key-here
```

**Get API Keys:**
- **DeepSeek**: https://platform.deepseek.com/ (Recommended, affordable)
- **OpenAI**: https://platform.openai.com/
- **Gemini**: https://ai.google.dev/

### 4. Run the Server

```bash
python app.py
```

Server runs at: `http://localhost:5000`

---

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Analyze Contract
```
POST /analyze-contract
Content-Type: multipart/form-data

Body:
- file: PDF or DOCX file
```

**Response:**
```json
{
  "session_id": "abc-123",
  "filename": "contract.pdf",
  "total_clauses": 15,
  "overall_risk_score": 67.5,
  "rule_based_summary": {...},
  "ai_risk_explanation": {...},
  "analysis": [
    {
      "clause_id": 1,
      "clause_text": "...",
      "legal_check": {
        "violations": [
          {
            "rule_id": "ICA_S27_NONCOMPETE_001",
            "type": "restraint_of_trade",
            "severity": "critical",
            "law": "Section 27, Indian Contract Act, 1872",
            "verdict": "Likely Void",
            "description": "...",
            "recommendation": "...",
            "confidence": "high"
          }
        ]
      },
      "risk_score": 85,
      "explanation": "..."
    }
  ]
}
```

### 3. Session Management
```
GET /session/<session_id>
DELETE /session/<session_id>
```

---

## 🎨 Rule Management

### Adding New Legal Rules

All rules are in `data/rules/` directory organized by category:

```
data/rules/
├── ica/          # Indian Contract Act rules
├── ip/           # Intellectual Property rules
├── general/      # General contract fairness rules
└── labour/       # Labour law rules (you can add)
```

### Example Rule (JSON)

```json
{
  "rule_id": "ICA_S27_NONCOMPETE_001",
  "statute": "Section 27, Indian Contract Act, 1872",
  "category": "restraint_of_trade",
  "severity": "critical",
  "patterns": {
    "required_keywords": ["non-compete", "not compete"],
    "exclusion_keywords": ["sale of business", "goodwill"]
  },
  "verdict": "Likely Void",
  "explanation_template": "Non-compete restrictions are void in India...",
  "recommendation": "Remove this clause entirely.",
  "enabled": true
}
```

**See full guide:** [data/rules/README.md](data/rules/README.md)

---

## 🔧 Configuration

Edit `config.py` or use environment variables:

```python
# LLM Provider
LLM_PROVIDER = "deepseek"  # or "openai" or "gemini"

# Session TTL
SESSION_TTL_MINUTES = 30

# File Upload
MAX_FILE_SIZE_MB = 10

# Risk Scoring Weights
RISK_WEIGHTS = {
    "legal_invalidity": 0.5,    # 50%
    "deviation_severity": 0.3,  # 30%
    "frequency_factor": 0.2     # 20%
}
```

---

## 🧪 Testing

### Test with Sample Contract

```bash
curl -X POST http://localhost:5000/analyze-contract \
  -F "file=@sample_contract.pdf"
```

### Run Test Suite

```bash
pytest test_rule_engine.py -v
pytest test_backend.py -v
```

---

## 📚 Legal Basis

### Indian Contract Act, 1872

| Section | Coverage | Rule Files |
|---------|----------|------------|
| **Section 27** | Restraint of Trade (Non-compete) | `ica/section_27.json` |
| **Section 23** | Unlawful Consideration/Object | `ica/section_23.json` |
| **Section 74** | Penalty Clauses | `ica/section_74.json` |
| **Section 16** | Undue Influence | `general/unfair_terms.json` |

### Other Acts

- **Copyright Act, 1957**: IP assignment rules (`ip/copyright.json`)
- **Code of Civil Procedure**: Jurisdiction clauses

---

## ⚠️ Privacy & Security

✅ **No persistent storage** - All processing in-memory  
✅ **Auto-delete** - Sessions expire after 30 minutes  
✅ **No logs of contract text** - Only metadata logged  
✅ **Stateless architecture** - No database storage  

⚠️ **For production, add:**
- JWT/OAuth authentication
- Rate limiting
- HTTPS/TLS
- Domain-restricted CORS

---

## 🚨 Legal Disclaimer

**This tool provides educational information, NOT legal advice.**

- Always consult a qualified lawyer before signing contracts
- Laws and interpretations may vary
- This is a first-line safety check, not a substitute for legal counsel
- The developers are not liable for any decisions made based on this tool

---

## 🛠️ Development

### Hot-Reload Rules (Dev Mode)

```python
from rule_loader import get_rule_loader
loader = get_rule_loader()
loader.reload_rules()
```

### Add New Rule Category

1. Create folder: `data/rules/your_category/`
2. Add JSON file with rules
3. Rules auto-load on server restart

### Switch LLM Provider

```bash
# In .env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
```

---

## 📈 Roadmap

- [ ] Add more Indian laws (Labour laws, POSH Act)
- [ ] Multilingual support (Hindi, Tamil, etc.)
- [ ] PDF report generation
- [ ] Comparison mode (compare two contracts)
- [ ] API authentication (JWT)
- [ ] Rate limiting
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/new-law`
3. Add rules in `data/rules/`
4. Test thoroughly
5. Submit Pull Request

---

## 📄 License

MIT License - See LICENSE file

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check documentation in `data/rules/README.md`
- Review sample rules in JSON files

---

**Built with ❤️ to empower Indian freelancers and startups**

## 🏗️ Architecture

```
backend/
├── app.py                  # Main Flask application
├── config.py               # Configuration & constants
├── extractor.py            # PDF/DOCX/OCR text extraction
├── clause_splitter.py      # Clause segmentation
├── law_dataset.py          # Indian law loader
├── vector_store.py         # ChromaDB semantic search
├── rule_engine.py          # Legal verification (CORE LOGIC)
├── deviation_engine.py     # Fair template comparison
├── risk_score.py           # Risk scoring
├── explanation.py          # ELI5 explanations
├── privacy_ttl.py          # Auto-delete sessions
├── utils.py                # Utility functions
├── requirements.txt        # Python dependencies
└── data/
    ├── indian_laws.json    # Indian law sections
    └── fair_contract.json  # Fair contract standards
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install System Dependencies (for OCR)

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### 3. Run the Server

```bash
python app.py
```

Server runs at: `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Analyze Contract
```
POST /analyze-contract
Content-Type: multipart/form-data

Body:
- file: PDF or DOCX file
```

**Response:**
```json
{
  "session_id": "abc-123",
  "filename": "contract.pdf",
  "total_clauses": 15,
  "overall_risk_score": 67.5,
  "analysis": [
    {
      "clause_id": 1,
      "clause_text": "...",
      "relevant_law": {...},
      "legal_check": {...},
      "deviation": {...},
      "risk_score": 85,
      "explanation": "..."
    }
  ]
}
```

### 3. Get Session
```
GET /session/<session_id>
```

### 4. Delete Session
```
DELETE /session/<session_id>
```

## 🔍 How It Works

### Step 1: Extract Text
- Extracts text from PDF/DOCX
- Falls back to OCR if needed
- In-memory processing (no files saved)

### Step 2: Split into Clauses
- Uses regex patterns to identify clause boundaries
- Filters out noise and headers
- Returns clean clause list

### Step 3: Legal Analysis (PER CLAUSE)

#### 3a. Find Relevant Law
- Uses sentence-transformers to embed clause
- Searches ChromaDB for most relevant Indian law section
- Returns Section 27, 23, 74, etc.

#### 3b. Rule Engine (CORE)
Checks for violations:
- **Section 27**: Non-compete (VOID in India)
- **Section 23**: Unlawful object
- **Section 74**: Excessive penalty
- **IP Overreach**: Too broad IP assignment
- **Unfair Terms**: One-sided clauses

#### 3c. Deviation Check
Compares against fair template:
- Duration (notice period, contract term)
- Penalties (percentages, amounts)
- IP scope
- Termination terms

#### 3d. Risk Score
Weighted combination:
- Legal invalidity: 50%
- Deviation: 30%
- Frequency: 20%

#### 3e. Explanation
Generates ELI5 explanation:
- What clause means
- Legal context
- Issues found
- Disclaimer

### Step 4: Return Results
- JSON response with all analysis
- Session stored with TTL (auto-delete after 30 min)

## 🎯 Key Features

### ✅ Privacy First
- **No persistent storage** - all in-memory
- **Auto-delete** - sessions expire after 30 minutes
- **No file saving** - documents processed in memory only

### ✅ Legal Accuracy
- Based on **Indian Contract Act, 1872**
- Deterministic rule engine (no AI hallucination)
- Citations to specific sections

### ✅ User-Friendly
- ELI5 explanations
- Risk scores (0-100)
- Color-coded severity
- Recommendations

## 🔧 Configuration

Edit `config.py` to customize:

```python
SESSION_TTL_MINUTES = 30  # Session expiry
MAX_FILE_SIZE_MB = 10     # Max upload size
RISK_WEIGHTS = {          # Risk calculation weights
    "legal_invalidity": 0.5,
    "deviation_severity": 0.3,
    "frequency_factor": 0.2
}
```

## 🧪 Testing

### Test with cURL

```bash
# Analyze a contract
curl -X POST http://localhost:5000/analyze-contract \
  -F "file=@contract.pdf"

# Check health
curl http://localhost:5000/health
```

### Test with Python

```python
import requests

url = "http://localhost:5000/analyze-contract"
files = {"file": open("contract.pdf", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## 📚 Legal Basis

### Sections Covered

1. **Section 10** - Valid contract requirements
2. **Section 16** - Undue influence
3. **Section 19** - Voidable contracts
4. **Section 23** - Unlawful consideration/object
5. **Section 27** - Restraint of trade (non-compete)
6. **Section 28** - Restraint of legal proceedings
7. **Section 74** - Penalty clauses
8. **Copyright Act** - IP assignment

## 🔒 Security Notes

- No API authentication (add JWT/OAuth for production)
- No rate limiting (add for production)
- CORS enabled (restrict domains for production)
- Input validation present
- No persistent logs of documents

## 🚨 Important Disclaimers

⚠️ **This tool provides educational information, NOT legal advice**

- Always consult a qualified lawyer
- Laws and interpretations may vary
- Contract analysis is complex
- This is a starting point, not final answer

## 🤝 Integration with Next.js Frontend

The backend is CORS-enabled and ready to connect to your Next.js frontend.

### Example Frontend Code:

```typescript
// Next.js API route or client component
const analyzeContract = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:5000/analyze-contract', {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};
```

## 📝 TODO / Future Enhancements

- [ ] Add authentication (JWT)
- [ ] Add rate limiting
- [ ] Integrate real LLM for explanations
- [ ] Add more Indian laws (Labour laws, etc.)
- [ ] Support more file formats
- [ ] Add clause comparison feature
- [ ] Generate reports (PDF export)
- [ ] Add analytics dashboard

## 📄 License

MIT License - See LICENSE file

## 👥 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues or questions, please open a GitHub issue.