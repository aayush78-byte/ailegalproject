# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies

```bash
cd sharma-ka-backend
pip install -r requirements.txt
```

### 2. Get Your DeepSeek API Key

1. Visit: https://platform.deepseek.com/
2. Sign up for an account
3. Generate an API key
4. Copy the key (starts with `sk-`)

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and paste your API key:
```bash
DEEPSEEK_API_KEY=sk-your-actual-key-here
```

### 4. Run the Server

```bash
python app.py
```

Server starts at `http://localhost:5000`

### 5. Test It!

```bash
curl -X POST http://localhost:5000/analyze-contract \
  -F "file=@sample_contract.pdf"
```

---

## 📍 Where to Find Everything

### DeepSeek API Configuration
- **File**: `.env`  
- **Variable**: `DEEPSEEK_API_KEY=your_key_here`
- **To switch providers**: Change `LLM_PROVIDER=deepseek` to `openai` or `gemini`

### JSON Rule Files
- **Location**: `data/rules/`
- **Structure**:
  ```
  data/rules/
  ├── ica/      ← Add Indian Contract Act rules here
  ├── ip/       ← Add IP/Copyright rules here
  ├── general/  ← Add general contract rules here
  └── labour/   ← Add labour law rules here (create files)
  ```

### Adding a New Rule

1. **Choose category** (or create new folder in `data/rules/`)
2. **Edit JSON file** in that category folder
3. **Follow the schema** in `data/rules/schema.json`
4. **Test** by uploading a contract

**Example new rule**:
```json
{
  "rules": [
    {
      "rule_id": "YOUR_RULE_ID",
      "statute": "Relevant Law Reference",
      "category": "appropriate_category",
      "severity": "high",
      "patterns": {
        "required_keywords": ["keyword1", "keyword2"]
      },
      "verdict": "High Risk",
      "explanation_template": "Simple explanation",
      "recommendation": "What to do",
      "enabled": true
    }
  ]
}
```

See complete guide: [data/rules/README.md](data/rules/README.md)

---

## 🔧 Common Configurations

### Use OpenAI Instead of DeepSeek

In `.env`:
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
```

### Use Google Gemini

In `.env`:
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
```

### Disable LLM (Template-based explanations only)

Just leave API keys blank - system will use fallback explanations.

### Change Session Timeout

In `.env`:
```bash
SESSION_TTL_MINUTES=60  # 1 hour instead of 30 minutes
```

---

## 📂 File Structure (What Does What)

| File | Purpose |
|------|---------|
| `app.py` | Main Flask application, API endpoints |
| `rule_engine.py` | Deterministic legal rule checking |
| `rule_loader.py` | Loads JSON rules from `data/rules/` |
| `entity_extractor.py` | Extracts durations, amounts, percentages |
| `llm_config.py` | Multi-provider LLM configuration |
| `ai_engine.py` | Generates AI explanations (ELI5) |
| `config.py` | Global configuration settings |
| `data/rules/*.json` | **← EDIT THESE TO ADD/MODIFY RULES** |

---

## ❓ Troubleshooting

### Server won't start

**Error**: `ModuleNotFoundError`  
**Fix**: `pip install -r requirements.txt`

**Error**: `DEEPSEEK_API_KEY not found`  
**Fix**: Create `.env` file with your API key

### Rule not firing

1. Check keywords match your clause text
2. Enable debug logging: `LOG_LEVEL=DEBUG` in `.env`
3. Verify JSON is valid: `python -c "import json; json.load(open('data/rules/ica/section_27.json'))"`

### LLM errors

- Check API key is correct
- Check internet connection
- System will fall back to template explanations if LLM fails

---

## 🎓 Next Steps

1. ✅ **Test with your contracts** - Upload real freelance contracts
2. ✅ **Add custom rules** - Create rules for specific clauses you care about
3. ✅ **Integrate with frontend** - Connect to your Next.js/React app
4. ✅ **Add more legal sections** - Expand coverage to labour laws, etc.

---

## 📚 Full Documentation

- **Main README**: [README.md](README.md)
- **Rule Creation Guide**: [data/rules/README.md](data/rules/README.md)
- **Implementation Plan**: Check artifacts folder

Happy analyzing! 🎉
