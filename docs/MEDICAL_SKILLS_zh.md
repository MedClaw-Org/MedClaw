# NanoClaw 容器 Agent 技能手册

容器 Agent 可用的技能（响应飞书、WhatsApp、Telegram 等消息时使用）。
从 `container/skills/` 加载，**不是** Claude Code CLI 技能。

---

## 可用技能

| 技能 | 说明 |
|------|------|
| agent-browser | 浏览器自动化。可用于网页研究、阅读文章、与网页应用交互、填写表单、截图、提取数据、测试网页等。任何需要浏览器的场景均可使用。 |
| find-skills | 帮助用户发现和安装 Agent 技能。当用户询问"如何做 X"、"有没有能做 X 的技能"、"是否有 skill 可以……"或希望扩展 Agent 能力时触发。 |
| pubmed-search | 搜索 PubMed 科学文献。当用户要求查找论文、搜索文献、查询研究、查找出版物或询问近期研究时触发。 |
| medical-research-toolkit | 查询 14+ 个生物医学数据库，用于药物再利用、靶点发现、临床试验和文献研究。通过统一 MCP 端点访问 ChEMBL、PubMed、ClinicalTrials.gov、OpenTargets、OpenFDA、OMIM、Reactome、KEGG、UniProt 等数据库。 |
| medical-specialty-briefs | 按医学专科生成每日或按需的医学研究简报。检索顶级期刊（NEJM、Lancet、JAMA、BMJ、Nature Medicine）最新研究，提供一句话要点摘要和直达链接。适用于内分泌、心脏病、肿瘤、神经等专科的医学资讯查询。 |
| usmle | 美国医师执照考试备考助手。提供进度追踪、薄弱点分析、题库管理和住院医匹配规划。涵盖 Step 1/2 CK/Step 3 考试结构、IMG 专项指导、分数预测和身心健康支持。 |
| medical-entity-extractor | 从患者消息中提取医学实体，包括症状、药物、检验值、诊断等。 |
| patiently-ai | 为患者简化医疗文件。将医生信件、检查报告、处方、出院小结和临床记录转化为清晰、个性化的通俗语言。 |
| multi-search-engine | 多搜索引擎集成，支持 17 个引擎（8 个国内 + 9 个国际）。涵盖百度、Bing、360、搜狗、微信、Google、DuckDuckGo、WolframAlpha 等。支持高级搜索语法、时间过滤、站内搜索，无需 API Key。 |
| wikipedia-search | 通过 MediaWiki API 搜索并获取 Wikipedia 结构化内容，提供可靠的百科全书式信息。支持多语言查询。 |
