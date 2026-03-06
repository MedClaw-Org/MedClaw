# NanoClaw Container Agent Skills Reference

Skills available to the container agent (responding to Feishu, WhatsApp, Telegram, etc. messages).
These are loaded from `container/skills/` and are **not** Claude Code CLI skills.

---

## Available Skills

| Skill | Description |
|-------|-------------|
| agent-browser | Browse the web for any task — research topics, read articles, interact with web apps, fill forms, take screenshots, extract data, and test web pages. Use whenever a browser would be useful. |
| find-skills | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. |
| pubmed-search | Search PubMed for scientific literature. Use when the user asks to find papers, search literature, look up research, find publications, or asks about recent studies. |
| medical-research-toolkit | Query 14+ biomedical databases for drug repurposing, target discovery, clinical trials, and literature research. Access ChEMBL, PubMed, ClinicalTrials.gov, OpenTargets, OpenFDA, OMIM, Reactome, KEGG, UniProt, and more through a unified MCP endpoint. |
| medical-specialty-briefs | Generate daily or on-demand medical research briefs for any medical specialty. Searches latest research from top-tier journals (NEJM, Lancet, JAMA, BMJ, Nature Medicine), delivers concise summaries with 1-sentence takeaways and direct links. Use when user asks for medical news, research updates, or specialty-specific updates (endocrinology, cardiology, oncology, neurology, etc.). |
| usmle | Prepare for US medical licensing exams with progress tracking, weak area analysis, question bank management, and residency match planning. Covers Step 1/2 CK/Step 3, IMG-specific guidance, score prediction, and wellbeing support. |
| medical-entity-extractor | Extract medical entities (symptoms, medications, lab values, diagnoses) from patient messages. |
| patiently-ai | Simplifies medical documents for patients. Takes doctor's letters, test results, prescriptions, discharge summaries, and clinical notes and explains them in clear, personalised language. |
| multi-search-engine | Multi search engine integration with 17 engines (8 CN + 9 Global). Supports Baidu, Bing, 360, Sogou, WeChat, Google, DuckDuckGo, WolframAlpha and more. Supports advanced operators, time filters, site search. No API keys required. |
| wikipedia-search | Search and fetch structured content from Wikipedia using the MediaWiki API for reliable, encyclopedic information. Supports multi-language queries. |
