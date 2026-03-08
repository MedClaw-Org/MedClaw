# MedClaw 容器 Agent 技能手册

容器 Agent 可用的技能（响应飞书、WhatsApp、Telegram 等消息时使用）。
从 `container/skills/` 加载，**不是** Claude Code CLI 技能。

---

## 通用工具

适用于日常生产力场景，不限于医疗领域。

| 技能 | 说明 |
|------|------|
| agent-browser | 浏览器自动化。可用于网页研究、阅读文章、与网页应用交互、填写表单、截图、提取数据、测试网页等。任何需要浏览器的场景均可使用。 |
| find-skills | 帮助用户发现和安装 Agent 技能。当用户询问"如何做 X"、"有没有能做 X 的技能"、"是否有 skill 可以……"或希望扩展 Agent 能力时触发。 |
| multi-search-engine | 多搜索引擎集成，支持 17 个引擎（8 个国内 + 9 个国际）。涵盖百度、Bing、360、搜狗、微信、Google、DuckDuckGo、WolframAlpha 等。支持高级搜索语法、时间过滤、站内搜索，无需 API Key。 |
| wikipedia-search | 通过 MediaWiki API 搜索并获取 Wikipedia 结构化内容，提供可靠的百科全书式信息。支持多语言查询。 |
| deep-research | 自主多步骤深度研究。搜索多个信息来源，阅读全文，综合分析后生成结构化报告。适用于综合调研、文献综述、竞品分析或对某一主题的深度挖掘。 |
| pdf | 全功能 PDF 工具包——提取文本和表格、创建新 PDF、合并/拆分文档、填写表单、OCR 扫描件。处理任何 .pdf 文件时使用。 |
| docx | 创建、编辑和分析 Word 文档（.docx）。支持修订追踪、批注、格式保留和文本提取。起草、审阅或提取 Word 文件内容时使用。 |
| xlsx | 电子表格创建、编辑与分析。支持公式、格式设置、数据分析和可视化。处理任何 .xlsx、.xlsm、.csv 或 .tsv 文件时使用。 |
| pptx | 演示文稿创建、编辑与分析。支持布局、演讲者备注、模板和设计定制。处理任何 .pptx 文件时使用。 |
| doc-coauthoring | 结构化文档协作撰写工作流。撰写文档、提案、技术规格、决策文件或类似结构化内容时使用。 |

---

## 医疗专用工具

专为医疗、临床和生物医学工作流设计的技能。

| 技能 | 说明 |
|------|------|
| pubmed-search | 搜索 PubMed 科学文献。当用户要求查找论文、搜索文献、查询研究、查找出版物或询问近期研究时触发。 |
| medical-research-toolkit | 查询 14+ 个生物医学数据库，用于药物再利用、靶点发现、临床试验和文献研究。通过统一 MCP 端点访问 ChEMBL、PubMed、ClinicalTrials.gov、OpenTargets、OpenFDA、OMIM、Reactome、KEGG、UniProt 等数据库。 |
| medical-specialty-briefs | 按医学专科生成每日或按需的医学研究简报。检索顶级期刊（NEJM、Lancet、JAMA、BMJ、Nature Medicine）最新研究，提供一句话要点摘要和直达链接。适用于内分泌、心脏病、肿瘤、神经等专科的医学资讯查询。 |
| usmle | 美国医师执照考试备考助手。提供进度追踪、薄弱点分析、题库管理和住院医匹配规划。涵盖 Step 1/2 CK/Step 3 考试结构、IMG 专项指导、分数预测和身心健康支持。 |
| medical-entity-extractor | 从患者消息中提取医学实体，包括症状、药物、检验值、诊断等。 |
| patiently-ai | 为患者简化医疗文件。将医生信件、检查报告、处方、出院小结和临床记录转化为清晰、个性化的通俗语言。 |
| biomedical-search | 综合生物医学信息搜索，整合 PubMed、预印本、临床试验和 FDA 药物标签。由 Valyu 语义搜索驱动，一站式检索多源生物医学数据。 |
| medical-imaging-review | 撰写医学影像 AI 研究的文献综述。适用于撰写综述论文、系统评价或影像相关主题的文献分析。 |
| fhir-developer-skill | FHIR API 开发指南，用于构建医疗数据端点（Patient、Observation、Encounter、Condition、MedicationRequest）。开发或集成 FHIR REST API 时使用。 |
| clinical-trial-protocol-skill | 为药物或医疗器械生成临床试验方案。适用于设计临床研究、编写 FDA 申报文件或制定试验性产品研究方案。 |
| prior-auth-review-skill | 自动化保险预授权（PA）审核。评估医疗必要性，对照覆盖政策进行验证，并生成预授权决定。 |
| clinical-reports | 撰写全面的临床报告——病例报告（CARE 指南）、诊断报告（放射/病理/检验）、临床试验报告（ICH-E3、CSR）及患者文档（SOAP、H&P、出院小结）。符合 HIPAA/FDA/ICH-GCP 规范。 |
| clinicaltrials-database | 通过 API v2 查询 ClinicalTrials.gov。按疾病、药物、地点、状态或分期检索试验，按 NCT ID 获取详情，导出数据用于临床研究和患者匹配。 |
| clinical-decision-support | 生成临床决策支持（CDS）文档，涵盖患者队列分析、治疗建议报告（含 GRADE 证据分级）、生物标志物整合及统计输出（风险比、生存曲线）。适用于药物研发和临床研究。 |
| tooluniverse-clinical-trial-design | 临床试验设计可行性评估。评估患者人群规模、生物标志物流行率、终点选择、对照组分析、安全监测和监管路径。规划 I/II 期试验或评估试验可行性时使用。 |
| tooluniverse-disease-research | 生成全面的疾病研究报告，覆盖流行病学、发病机制、诊断、治疗和在研临床试验。询问疾病、综合征或需要系统性疾病分析时使用。 |
| tooluniverse-literature-deep-research | 深度生物医学文献研究，含靶点消歧、证据分级和主题结构化提取。解析基因/蛋白 ID 及同义词，合成生物学模型并生成可检验假说。适用于深度文献综述或靶点画像。 |
| tooluniverse-clinical-guidelines | 检索 12+ 权威来源的临床实践指南（NICE、WHO、ADA、AHA/ACC、NCCN、SIGN、CPIC 等）。覆盖心脏病、肿瘤、糖尿病、药物基因组学等领域。询问治疗建议或诊疗标准时使用。 |
| tooluniverse-drug-research | 全面的药物研究报告，涵盖药物身份、药理、靶点、临床试验、安全性、药物基因组学和 ADMET 特性。适用于药物画像、安全性评估或临床研发研究。 |
| tooluniverse-drug-repurposing | 基于靶点、化合物和疾病驱动策略识别药物再利用候选。通过分析靶点、生物活性和安全档案，为已批准药物寻找新适应症。 |
| tooluniverse-drug-drug-interaction | 药物相互作用预测与风险评估。分析 CYP450/转运体机制、严重程度分级，提供管理策略。支持多药联用分析（3种以上）和替代用药推荐。 |
| tooluniverse-rare-disease-diagnosis | 基于表型和遗传数据的罕见病鉴别诊断。将症状映射至 HPO 术语，从 Orphanet/OMIM 识别候选疾病，解读意义不明变异（VUS）。 |
| tooluniverse-pharmacovigilance | 分析来自 FDA 不良事件报告、药品说明书警告和药物基因组数据的药物安全信号。计算 PRR/ROR，识别严重不良事件，评估药物基因组风险。 |
| tooluniverse-clinical-trial-matching | 精准医学和肿瘤学的患者-试验智能匹配。从 ClinicalTrials.gov 按分子入选标准、临床标准、生物标志物对齐和地理可及性对试验排序，输出量化试验匹配评分（0-100）。 |
| literature-review | 跨多数据库（PubMed、arXiv、bioRxiv、Semantic Scholar）的系统性文献综述。生成格式规范的报告，支持 APA、Nature、Vancouver 等多种引用格式。 |
| tooluniverse-precision-oncology | 基于肿瘤分子图谱提供可操作的治疗建议。解读肿瘤突变，识别 FDA 批准疗法、相关临床试验和耐药机制。 |
| tooluniverse-cancer-variant-interpretation | 肿瘤体细胞变异临床解读。给定基因+变异（如 EGFR L858R、BRAF V600E），评估致癌性、治疗意义和试验入组资格。 |
| tooluniverse-variant-analysis | VCF 文件处理与变异注释分析。解析 VCF，整合 ClinVar/gnomAD/COSMIC 注释，解读临床意义。 |
| tooluniverse-variant-interpretation | 系统性临床变异解读——从原始变异调用到 ACMG 分级建议，整合 ClinVar、gnomAD 和人群数据库证据。 |
| tooluniverse-structural-variant-analysis | 结构变异（SV/CNV）综合分析。分类 SV 类型，评估致病性，解读拷贝数变异的临床意义。 |
| tooluniverse-polygenic-risk-score | 基于 GWAS 汇总统计数据构建和解读多基因风险评分（PRS），计算遗传风险档案并解读 PRS 百分位数。 |
| tooluniverse-precision-medicine-stratification | 整合基因组、临床和治疗数据进行精准医学患者分层，识别治疗相关亚组和生物标志物驱动的治疗选项。 |
| tooluniverse-gwas-trait-to-gene | 利用 GWAS Catalog（50万+关联）和 Open Targets Genetics 的基因座-基因预测，发现与疾病/性状关联的基因。 |
| tooluniverse-gwas-drug-discovery | 将 GWAS 信号转化为药物靶点和再利用机会。执行基因座-基因映射、靶点成药性评估和已有药物识别。 |
| tooluniverse-gwas-study-explorer | 跨队列比较 GWAS 研究并评估可重复性。整合 NHGRI-EBI GWAS Catalog 和 Open Targets Genetics 进行跨研究荟萃分析。 |
| tooluniverse-gwas-finemapping | 通过统计精细定位鉴定 GWAS 基因座的因果变异，计算后验概率和可信集。 |
| tooluniverse-gwas-snp-interpretation | 整合 GWAS Catalog、Open Targets Genetics 和 ClinVar 解读 SNP 的性状关联和功能注释。 |
| tooluniverse-phylogenetics | 系统发育和序列分析——比对处理、进化树构建和进化度量，适用于病原体或物种进化研究。 |
| tooluniverse-epigenomics | 表观基因组数据处理——甲基化芯片分析（CpG 过滤、差异甲基化）、染色质可及性和组蛋白修饰分析。 |
| tooluniverse-rnaseq-deseq2 | 使用 PyDESeq2 进行 RNA-seq 差异表达分析——标准化、离散度估计、Wald 检验、LFC 收缩和通路富集。 |
| tooluniverse-single-cell | 使用 scanpy 进行单细胞 RNA 测序分析——QC、标准化、PCA、UMAP、Leiden 聚类、轨迹分析和细胞类型注释。 |
| tooluniverse-spatial-transcriptomics | 空间转录组学数据分析——在组织架构中映射基因表达，支持 10x Visium、MERFISH、seqFISH 和 Slide-seq 平台。 |
| tooluniverse-spatial-omics-analysis | 空间多组学数据整合分析框架——空间变异基因、空间域注释和组织分辨率多组学分析。 |
| tooluniverse-proteomics-analysis | 质谱蛋白质组学数据分析——蛋白定量、差异表达、翻译后修饰（PTM）和蛋白互作网络构建。 |
| tooluniverse-metabolomics | 代谢组学研究——代谢物鉴定并检索数据库（HMDB 22万+代谢物、MetaboLights、Metabolomics Workbench）。 |
| tooluniverse-metabolomics-analysis | 代谢组学数据分析——代谢物鉴定、定量、通路分析和代谢通量，处理 LC-MS、GC-MS 或 NMR 数据。 |
| tooluniverse-multi-omics-integration | 整合转录组、蛋白质组、表观基因组、基因组和代谢组数据，用于系统生物学和精准医学研究。 |
| tooluniverse-multiomic-disease-characterization | 整合基因组、转录组、蛋白质组、通路和治疗层面进行系统级疾病多组学表征。 |
| tooluniverse-expression-data-retrieval | 从 ArrayExpress 和 BioStudies 检索基因表达和组学数据集，含质量评估和结构化报告。 |
| tooluniverse-gene-enrichment | 基因集富集和通路分析——使用 gseapy、PANTHER、STRING、Reactome，支持 GO 富集、KEGG 通路和 40+ ToolUniverse 工具。 |
| tooluniverse-systems-biology | 系统生物学和通路分析——使用 Reactome、KEGG、WikiPathways、Pathway Commons 和 BioModels 进行网络建模与通路模拟。 |
| tooluniverse-protein-interactions | 使用 STRING、BioGRID 和 SASBDB 分析蛋白互作网络，含置信度评分和功能模块识别。 |
| tooluniverse-protein-structure-retrieval | 从 RCSB PDB、PDBe 和 AlphaFold 检索蛋白质结构数据，含质量评估和综合结构档案。 |
| tooluniverse-protein-therapeutic-design | AI 辅助蛋白质治疗药物从头设计（结合剂、酶、支架）——RFdiffusion 骨架生成、ProteinMPNN 序列设计和 ESM 评估。 |
| tooluniverse-antibody-engineering | 治疗性抗体工程与优化——人源化、亲和力成熟、可开发性评估和免疫原性预测。 |
| tooluniverse-immune-repertoire-analysis | TCR/BCR 免疫库测序数据分析——克隆性、多样性、V(D)J 基因使用、克隆扩增和抗原特异性预测。 |
| tooluniverse-immunotherapy-response-prediction | 整合多生物标志物预测患者对免疫检查点抑制剂（ICI）的响应——TMB、MSI、PD-L1、TIL 信号和 HLA 分型。 |
| tooluniverse-infectious-disease | 感染性疾病病原体表征与药物再利用分析——识别病原体分类、必需蛋白、结构靶点和治疗选项。 |
| tooluniverse-crispr-screen-analysis | CRISPR 功能筛选分析——汇集或阵列式筛选（敲除/激活/干扰）以鉴定必需基因和阳性 hit。 |
| tooluniverse-target-research | 综合药物靶点情报——蛋白信息、结构、互作、通路、表达、变异图谱和药物研发管线。 |
| tooluniverse-network-pharmacology | 化合物-靶点-疾病网络分析，用于药物再利用、多药理学发现和系统药理学研究。 |
| tooluniverse-statistical-modeling | 生物医学数据集统计建模——线性/逻辑回归、混合效应模型、生存分析和贝叶斯方法。 |
| tooluniverse-image-analysis | 生物医学显微镜图像分析——菌落形态测量、细胞计数、荧光定量和成像数据统计比较。 |
| literature-search | 跨 PubMed、arXiv、bioRxiv、medRxiv 的综合科学文献搜索，由 Valyu 语义搜索驱动，支持自然语言查询。 |
| medrxiv-search | 使用 Valyu 语义搜索检索 medRxiv 医学预印本，支持自然语言查询。 |
| clinical-trials-search | 通过 Valyu 自然语言查询 ClinicalTrials.gov——按疾病、入组状态和结局终点检索试验。 |
| drug-discovery-search | 整合 ChEMBL、DrugBank、靶点和 FDA 标签的端到端药物发现平台，Valyu 自然语言驱动。 |
| drug-labels-search | 通过 Valyu 自然语言查询 FDA 药品说明书——适应症、用法用量和安全性数据。 |
| chembl-search | 使用 Valyu 语义搜索检索 ChEMBL 生物活性分子数据库——化合物、实验数据和生物活性。 |
| open-targets-search | 通过 Valyu 语义搜索检索 Open Targets 药物-疾病关联和靶点验证数据。 |
| patents-search | 通过 Valyu 自然语言查询全球专利——先有技术、专利图谱和创新追踪。 |
| drugbank-search | 使用 Valyu 语义搜索检索 DrugBank 综合药物数据库——机制、相互作用和安全性数据。 |
| arxiv-search | 使用 Valyu 语义搜索检索 arXiv 预印本（生物、医学、AI 方向），支持自然语言查询。 |
| gwas-database | 查询 NHGRI-EBI GWAS Catalog 的 SNP-性状关联——按 rs ID、疾病/性状或基因检索，获取 p 值和汇总统计数据。 |
| scikit-survival | Python 生存分析与时间-事件建模工具——Kaplan-Meier 曲线、Cox 回归、log-rank 检验和删失数据处理（scikit-survival）。 |

---

### 药物安全与化学生物学

| 技能 | 说明 |
|------|------|
| tooluniverse-adverse-event-detection | 使用 FDA FAERS 数据、药品说明书和不均衡分析（PRR、ROR、IC）检测和分析药物不良事件信号，生成量化安全信号评分（0-100）。 |
| tooluniverse-binder-discovery | 使用基于结构和基于配体的方法为蛋白质靶点发现新型小分子结合剂，生成候选化合物、ADMET 档案和合成可行性报告。 |
| tooluniverse-chemical-compound-retrieval | 从 PubChem 和 ChEMBL 检索化合物信息，含消歧、交叉引用和质量评估，生成包含标识符、性质和生物活性的综合档案。 |
| tooluniverse-chemical-safety | 综合化学安全和毒理学评估，整合 ADMET-AI 预测、CTD 毒理基因组学、FDA 标签安全数据、DrugBank 安全档案和 STITCH 化学-蛋白相互作用。 |
| tooluniverse-drug-target-validation | 跨10个维度（消歧、疾病关联、成药性、化合物存量、临床先例、安全性、表达证据）计算验证药物靶点，用于早期药物发现。 |
| tooluniverse-sequence-retrieval | 从 NCBI 和 ENA 检索生物序列（DNA、RNA、蛋白质），含基因消歧、登录号类型处理和综合序列档案。 |

---

### 科学数据库（基因组与变异）

| 技能 | 说明 |
|------|------|
| clinvar-database | 查询 NCBI ClinVar 的变异临床意义。按基因/位置检索，解读致病性分类，通过 E-utilities API 或 FTP 访问，注释 VCF 文件，用于基因组医学。 |
| clinpgx-database | 访问 ClinPGx 药物基因组学数据（PharmGKB 的继承者）。查询基因-药物相互作用、CPIC 指南、等位基因功能，用于精准医学和基因型导向给药。 |
| cosmic-database | 访问 COSMIC 癌症突变数据库。查询体细胞突变、癌症基因普查、突变特征、基因融合，用于癌症研究和精准肿瘤学。需要认证。 |
| ensembl-database | 查询 Ensembl 基因组数据库 REST API（250+ 物种）。基因查询、序列检索、变异分析、比较基因组学、直系同源基因、VEP 预测。 |
| gene-database | 通过 E-utilities/Datasets API 查询 NCBI Gene。按符号/ID 检索，获取基因信息（RefSeq、GO、位置、表型），批量查询，用于基因注释。 |
| geo-database | 访问 NCBI GEO 基因表达/基因组数据。搜索/下载微阵列和 RNA-seq 数据集（GSE、GSM、GPL），检索 SOFT/Matrix 文件，用于转录组分析。 |
| ena-database | 通过 API/FTP 访问欧洲核酸数据库。按登录号检索 DNA/RNA 序列、原始测序数据（FASTQ）、基因组组装，用于基因组学和生物信息学流程。 |
| gget | 快速生物信息查询的 CLI/Python 工具包，访问 20+ 数据库：Ensembl、UniProt、AlphaFold、ARCHS4、Enrichr、OpenTargets、COSMIC、BLAST 等。 |
| pysam | 基因组文件工具包。读写 SAM/BAM/CRAM 比对、VCF/BCF 变异、FASTA/FASTQ 序列，提取区域，计算覆盖度，用于 NGS 数据处理流程。 |

---

### 科学数据库（蛋白质、通路与药物）

| 技能 | 说明 |
|------|------|
| alphafold-database | 访问 AlphaFold 2亿+预测蛋白质结构。按 UniProt ID 检索结构，下载 PDB/mmCIF 文件，分析置信度指标（pLDDT、PAE），用于药物发现和结构生物学。 |
| pdb-database | 访问 RCSB PDB 的三维蛋白质/核酸结构。按文本/序列/结构搜索，下载坐标（PDB/mmCIF），检索元数据，用于结构生物学和药物发现。 |
| uniprot-database | 直接 REST API 访问 UniProt。蛋白质检索、FASTA 获取、ID 映射、Swiss-Prot/TrEMBL。多数据库工作流推荐使用 bioservices（统一接口访问 40+ 服务）。 |
| string-database | 查询 STRING API 的蛋白质-蛋白质相互作用（5900万蛋白、200亿相互作用）。网络分析、GO/KEGG 富集、互作发现，支持 5000+ 物种，用于系统生物学。 |
| kegg-database | 直接 REST API 访问 KEGG（仅限学术用途）。通路分析、基因-通路映射、代谢通路、药物相互作用、ID 转换。 |
| reactome-database | 查询 Reactome REST API 进行通路分析、富集、基因-通路映射、疾病通路、分子相互作用，用于系统生物学研究。 |
| brenda-database | 通过 SOAP API 访问 BRENDA 酶数据库。检索动力学参数（Km、kcat）、反应方程、生物体数据和底物特异性酶信息，用于生化研究。 |
| hmdb-database | 访问人类代谢组数据库（22万+代谢物）。按名称/ID/结构检索，获取化学性质、生物标志物数据、NMR/MS 谱图、通路，用于代谢组学。 |
| metabolomics-workbench-database | 通过 REST API 访问 NIH 代谢组工作台（4200+ 研究）。查询代谢物、RefMet 命名、MS/NMR 数据、m/z 搜索，用于代谢组学和生物标志物发现。 |
| pubchem-database | 通过 PUG-REST API 查询 PubChem（1.1亿+化合物）。按名称/CID/SMILES 检索，获取性质、相似性/子结构搜索、生物活性，用于化学信息学。 |
| chembl-database | 查询 ChEMBL 生物活性分子和药物发现数据。按结构/性质检索化合物，获取生物活性数据（IC50、Ki），发现抑制剂，用于药物化学。 |
| drugbank-database | 访问 DrugBank 的综合药物信息，包括药物性质、相互作用、靶点、通路、化学结构和药理学数据。 |
| zinc-database | 访问 ZINC（2.3亿+可购买化合物）。按 ZINC ID/SMILES 检索，相似性搜索，3D-ready 结构用于对接，类似物发现，用于虚拟筛选。 |
| opentargets-database | 查询 Open Targets 平台的靶点-疾病关联、药物靶点发现、可成药性/安全性数据、遗传学/组学证据、已知药物，用于治疗靶点识别。 |
| fda-database | 查询 openFDA API 的药品、设备、不良事件、召回、监管申报（510k、PMA）、物质识别（UNII），用于 FDA 监管数据分析。 |
| pubmed-database | 直接 REST API 访问 PubMed。高级布尔/MeSH 查询、E-utilities API、批量处理、文献管理。 |
| openalex-database | 使用 OpenAlex 数据库查询和分析学术文献。搜索学术论文，分析研究趋势，按作者或机构查找作品。 |
| biorxiv-database | 按关键词、作者、日期范围或类别搜索 bioRxiv 预印本服务器，检索生命科学预印本的论文元数据。 |
| bioservices | 访问 40+ 生物信息学服务的首选 Python 工具。UniProt、KEGG、ChEMBL、PubChem、Reactome、QuickGO 的统一 API——推荐用于多数据库工作流。 |
| uspto-database | 访问 USPTO API 进行专利/商标搜索、审查历史（PEDS）、转让、引用、办公室行动，用于 IP 分析和先有技术检索。 |

---

### 生物信息学工具与流程

| 技能 | 说明 |
|------|------|
| biopython | 分子生物学的主要 Python 工具包：PubMed/NCBI 查询（Bio.Entrez）、序列操作、文件解析（FASTA、GenBank、FASTQ、PDB）、BLAST 工作流。 |
| scikit-bio | 生物学数据工具包。序列分析、比对、系统发育树、多样性指数（alpha/beta、UniFrac）、坐标分析（PCoA）、PERMANOVA，用于微生物组分析。 |
| etetoolkit | 系统发育树工具包（ETE）。树操作（Newick/NHX）、进化事件检测、直系同源/旁系同源、NCBI 分类、可视化（PDF/SVG），用于系统发育组学。 |
| deeptools | NGS 分析工具包。BAM 转 bigWig、QC（相关性、PCA、指纹）、热图/分布图（TSS、峰），用于 ChIP-seq、RNA-seq、ATAC-seq 可视化。 |
| nextflow-development | 在测序数据上运行 nf-core 生物信息学流程（rnaseq、sarek、atacseq）。处理 RNA-seq、WGS/WES 或 ATAC-seq，支持本地 FASTQ 或公共数据集（GEO/SRA）。 |
| fastq-analysis | SRA 下载、FASTQ 质控、STAR 比对、基因定量，以及单细胞 kallisto/bustools 流程，覆盖 bulk 和单细胞测序数据。 |
| geniml | 用于机器学习的基因组区间数据（BED 文件）。训练区域嵌入（Region2Vec、BEDspace），单细胞 ATAC-seq 分析。 |
| gtars | 基于 Rust 和 Python 绑定的高性能基因组区间分析工具。基因组区域、BED 文件、覆盖度轨道、重叠检测、ML 模型分词。 |
| arboreto | 使用 GRNBoost2 和 GENIE3 算法从基因表达数据推断基因调控网络（GRN）。适用于 bulk RNA-seq 和单细胞 RNA-seq 调控网络推断。 |
| lamindb | 用于生物学的开源数据框架，使 scRNA-seq、基因组学、影像等数据可查询、可追溯、可重现且符合 FAIR 原则。 |
| dnanexus-integration | DNAnexus 云基因组学平台。构建应用程序/小程序，管理数据（上传/下载），dxpy Python SDK，运行工作流，处理 FASTQ/BAM/VCF。 |
| latchbio-integration | Latch 生物信息学工作流平台。使用 Latch SDK、@workflow/@task 装饰器构建流程，部署无服务器工作流，支持 Nextflow/Snakemake 集成。 |

---

### 单细胞与空间组学

| 技能 | 说明 |
|------|------|
| anndata | 在 Python 中处理单细胞基因组学的注释数据矩阵，管理带元数据的实验测量数据和大规模组学数据。 |
| scanpy | 单细胞 RNA-seq 分析。加载 .h5ad/10X 数据，QC、标准化、PCA/UMAP/t-SNE、Leiden 聚类、标志基因、细胞类型注释、轨迹分析。 |
| scvi-tools | 单细胞分析的深度学习框架：数据整合/批次校正（scVI/scANVI）、ATAC-seq（PeakVI）、CITE-seq（totalVI）、多组学（MultiVI）、空间转录组解卷积（DestVI）。 |
| single-cell-rna-qc | 使用 scverse 最佳实践对单细胞 RNA-seq 数据（.h5ad 或 .h5 文件）进行 MAD-based 过滤和综合可视化质控。 |
| cellxgene-census | 查询 CZ CELLxGENE Census（6100万+细胞）。按细胞类型/组织/疾病过滤，检索表达数据，与 scanpy/PyTorch 集成，用于人群级单细胞分析。 |
| pydeseq2 | 使用 Python DESeq2 进行差异基因表达分析。从 bulk RNA-seq 计数识别差异表达基因，Wald 检验，FDR 校正，火山图/MA 图。 |
| bulk-combat-correction | 使用 pyComBat 去除合并 bulk RNA-seq 或微阵列队列中的批次效应，导出校正矩阵并生成校正前后对比可视化。 |
| bulk-deg-analysis | Bulk RNA-seq DEG 流程：基因 ID 映射、DESeq2 标准化、统计检验、可视化和通路富集（OmicVerse）。 |
| bulk-deseq2-analysis | 基于 PyDESeq2 的差异表达分析，含 ID 映射、差异检验、折叠变化阈值和富集可视化。 |
| bulk-stringdb-ppi | 通过 STRING 查询蛋白相互作用，使用 pyPPI 构建 PPI 图谱，为 bulk 基因列表生成网络图。 |
| bulk-to-single-deconvolution | 使用 Bulk2Single 工作流将 bulk RNA-seq 队列转换为合成单细胞数据集，进行细胞比例估计和 beta-VAE 生成。 |
| bulk-trajblend-interpolation | 使用 BulkTrajBlend 通过 beta-VAE 和 GNN 模型从 bulk RNA-seq 生成中间细胞，扩展 scRNA-seq 发育轨迹。 |
| bulk-wgcna-analysis | 在 OmicVerse 中运行 PyWGCNA——共表达模块构建、特征基因可视化和枢纽基因提取。 |
| single-annotation | 单细胞注释工作流：SCSA、MetaTiME、CellVote、CellMatch、GPTAnno 和加权 KNN 转移，用于跨模态细胞类型注释。 |
| single-cellphone-db | 在注释的单细胞数据上运行 CellPhoneDB v5，推断配体-受体网络并生成 CellChat 风格的可视化。 |
| single-clustering | 单细胞聚类工作流：QC、多方法聚类、主题建模、cNMF 和跨批次整合（OmicVerse）。 |
| single-downstream-analysis | OmicVerse 下游分析教程参考：AUCell 评分、metacell DEG 及相关导出。 |
| single-multiomics | OmicVerse 多组学教程：MOFA、GLUE 配对、SIMBA 整合、TOSICA 转移和 StaVIA 制图。 |
| single-preprocessing | OmicVerse 单细胞预处理教程：QC、标准化、HVG 检测、PCA/嵌入流程（CPU/GPU）。 |
| single-to-spatial-mapping | 使用 Single2Spatial 工作流将 scRNA-seq 图谱映射到空间转录组切片，进行深度森林训练和标志物可视化。 |
| single-trajectory | OmicVerse 轨迹分析工作流：PAGA、Palantir、VIA、速度耦合和命运评分。 |
| spatial-tutorials | 空间转录组学教程：跨 Visium、Visium HD、Stereo-seq 和 Slide-seq 平台的预处理、解卷积和下游建模。 |
| tcga-preprocessing | 将 TCGA 样本表、表达数据和临床数据导入 OmicVerse，初始化生存元数据并导出注释的 AnnData 文件。 |
| gsea-enrichment | OmicVerse 中的基因集富集分析，含正确的基因集格式处理，用于加载通路数据库和运行 GSEA。 |

---

### 化学信息学与药物发现

| 技能 | 说明 |
|------|------|
| rdkit | 精细分子控制的化学信息学工具包。SMILES/SDF 解析、描述符（MW、LogP、TPSA）、指纹、子结构搜索、2D/3D 生成、相似性计算。 |
| datamol | 具有简化接口的 Pythonic RDKit 封装，用于标准药物发现：SMILES 解析、标准化、描述符、指纹、聚类、3D 构象生成。 |
| medchem | 药物化学过滤器。应用药物样规则（Lipinski、Veber）、PAINS 过滤、结构警报、复杂度指标，用于化合物优先级排列和文库过滤。 |
| diffdock | 基于扩散的分子对接。从 PDB/SMILES 预测蛋白质-配体结合构象，置信度评分，虚拟筛选，用于基于结构的药物设计。 |
| molfeat | 用于 ML 的分子特征化（100+ 特征器）。ECFP、MACCS、描述符、预训练模型（ChemBERTa），将 SMILES 转换为特征，用于 QSAR 和分子 ML。 |
| deepchem | 分子机器学习工具包。性质预测（ADMET、毒性）、GNN（GCN、MPNN）、MoleculeNet 基准、预训练模型，用于药物发现 ML。 |
| torchdrug | 基于图的药物发现工具包。分子性质预测（ADMET）、蛋白质建模、知识图谱推理、分子生成、逆合成、GNN（GIN、GAT、SchNet）。 |
| torch_geometric | 图神经网络（PyG）。节点/图分类、链接预测、GCN、GAT、GraphSAGE、分子性质预测，用于药物发现中的几何深度学习。 |
| pytdc | 治疗学数据公共基准（TDC）。AI-ready 药物发现数据集（ADME、毒性、DTI）、基准、支架分割、分子预言机，用于治疗学 ML。 |
| cobrapy | 约束型代谢建模（COBRA）。FBA、FVA、基因敲除、通量采样、SBML 模型，用于系统生物学和代谢工程分析。 |

---

### 蛋白质组学与质谱

| 技能 | 说明 |
|------|------|
| matchms | 质谱光谱分析。处理 mzML/MGF/MSP 文件，光谱相似性（余弦、改良余弦），元数据协调，化合物鉴定，用于代谢组学和 MS 数据处理。 |
| pyopenms | OpenMS 的 Python 接口，用于 LC-MS/MS 蛋白质组学和代谢组学工作流。文件处理（mzML、mzXML、mzTab、pepXML、mzIdentML）和定量分析。 |
| flowio | 解析 FCS（流式细胞术标准）文件 v2.0-3.1。提取事件为 NumPy 数组，读取元数据/通道，转换为 CSV/DataFrame，用于流式细胞术数据预处理。 |

---

### 蛋白质结构与设计

| 技能 | 说明 |
|------|------|
| esm | ESM3 生成式多模态蛋白质设计（序列、结构、功能）和 ESM C 高效蛋白质嵌入。用于序列评分和嵌入的蛋白质语言模型。 |
| alphafold | 使用 AlphaFold2 结构预测验证蛋白质设计。验证设计序列折叠正确性，预测结合剂-靶点复合物结构，计算 pLDDT/PAE 指标。 |
| boltz | 使用 Boltz-1/Boltz-2 进行结构预测，这是一个开放的生物分子结构预测器，用于蛋白质复合物和结合剂验证。 |
| boltzgen | 使用 BoltzGen 扩散模型进行全原子蛋白质设计。从一开始就具有侧链感知的设计，可围绕小分子或配体进行设计。 |
| chai | 使用 Chai-1 基础模型进行蛋白质-蛋白质复合物结构预测、结合剂验证和蛋白质-小分子相互作用预测。 |
| rfdiffusion | 使用 RFdiffusion 扩散模型从头生成蛋白质骨架，用于结合剂支架设计和蛋白质从头设计。 |
| bindcraft | 使用 BindCraft 幻觉进行端到端结合剂设计，内置 AF2 验证，用于高质量结合剂设计活动。 |
| binder-design | 选择合适蛋白质结合剂设计工具（BoltzGen、BindCraft 或 RFdiffusion）并规划结合剂设计活动的指导。 |
| proteinmpnn | 使用 ProteinMPNN 逆折叠设计蛋白质序列，用于 RFdiffusion 骨架的序列设计、序列重设计和固定位置设计。 |
| ligandmpnn | 使用 LigandMPNN 进行配体感知蛋白质序列设计，围绕小分子设计序列、酶活性位点设计和结合口袋优化。 |
| solublempnn | 使用 SolubleMPNN 进行溶解性优化的蛋白质序列设计，用于大肠杆菌表达优化、减少聚集和溶解性改善。 |
| foldseek | 使用 Foldseek 进行结构相似性搜索，在 PDB/AFDB 数据库中查找相似结构，进行结构同源性搜索和进化关系发现。 |
| ipsae | 使用 ipSAE（来自对齐误差的蛋白间评分）对结合剂设计进行排名，用于对 BindCraft 或 RFdiffusion 输出进行筛选。 |
| pdb | 从 RCSB PDB 按 PDB ID 获取并分析蛋白质结构，搜索相似结构，为结合剂设计准备靶点。 |
| protein-design-workflow | 蛋白质设计流程的端到端指导，从项目启动到实验验证的逐步工作流指南。 |
| protein-qc | 蛋白质设计的质量控制指标和过滤阈值：pLDDT、PAE、ipTM，用于结合、表达和结构评估。 |
| cell-free-expression | 无细胞蛋白质合成（CFPS）优化指导、低产量/聚集故障排除和 DNA 模板设计优化。 |
| binding-characterization | SPR 和 BLI 结合表征实验指导，动力学数据解读和结合信号不良故障排除。 |

---

### 医学影像与病理

| 技能 | 说明 |
|------|------|
| pydicom | 用于处理 DICOM 医学影像文件的 Python 库。读取、写入、修改 DICOM 数据，提取像素数据，处理元数据和多帧文件。 |
| histolab | 全切片图像（WSI）数字病理学图像处理工具包。处理 H&E 或 IHC 染色组织图像，从吉像素切片中提取图块用于深度学习。 |
| pathml | 用于分析 WSI 和多参数影像数据的计算病理学工具包。支持 H&E 染色图像、多重免疫荧光和空间组学整合。 |
| omero-integration | 显微镜数据管理平台。通过 Python 访问图像，检索数据集，分析像素，管理 ROI/注释，用于高内容筛选工作流。 |
| neurokit2 | 综合生理信号处理工具包：ECG、EEG、EDA、RSP、PPG、EMG、EOG 信号。心血管信号分析、神经生理学和生理数据处理。 |
| neuropixels-analysis | Neuropixels 神经记录分析。加载 SpikeGLX/OpenEphys 数据，Kilosort4 峰值排序，质量指标，Allen/IBL 管理，用于神经科学研究。 |

---

### 医疗 ML 与临床 AI

| 技能 | 说明 |
|------|------|
| pyhealth | 用于临床数据（EHR、医保理赔）开发 ML 模型的综合医疗 AI 工具包。任务定义 API、模型训练、评估，用于临床 NLP 和预测。 |
| scikit-learn | Python 机器学习：监督学习（分类、回归）、无监督学习（聚类、降维）、模型评估、超参数调优，应用于医疗数据分析。 |
| transformers | 用于 NLP、计算机视觉、音频和多模态任务的预训练 Transformer 模型。文本生成、分类、问答和生物医学 NLP（BioBERT、ClinicalBERT）。 |
| shap | 使用 SHAP（沙普利加性解释）的模型可解释性。解释 ML 模型预测，计算特征重要性，生成生物医学模型的 SHAP 图。 |
| umap-learn | UMAP 降维。快速非线性流形学习，用于 2D/3D 可视化、聚类预处理（HDBSCAN），用于高维组学数据。 |

---

### 统计与数据分析

| 技能 | 说明 |
|------|------|
| statistical-analysis | 统计分析工具包。假设检验（t 检验、ANOVA、卡方）、回归、相关、贝叶斯统计、检验效能分析、假设检验、APA 报告。 |
| statsmodels | 统计建模工具包。OLS、GLM、逻辑回归、ARIMA、时间序列、假设检验、诊断、AIC/BIC，用于严格的统计推断。 |
| pymc | 使用 PyMC 进行贝叶斯建模。构建层次模型，MCMC（NUTS），变分推断，LOO/WAIC 比较，后验检验，用于概率编程。 |
| simpy | 基于过程的离散事件仿真框架，适用于临床系统建模：队列、资源、时间事件，用于医院工作流和患者流建模。 |
| exploratory-data-analysis | 对 200+ 格式的科学数据文件进行综合探索性数据分析——结构、内容、质量评估和可视化。 |
| data-stats-analysis | 统计检验、假设检验、相关分析和多重检验校正（OmicVerse，使用 scipy 和 statsmodels）。 |
| data-transform | 使用 pandas 和 numpy 转换、清洗、重塑和预处理生物数据（OmicVerse）。 |
| data-viz-plots | 使用 matplotlib 和 seaborn 创建出版质量的图表和可视化（OmicVerse）。 |
| scientific-visualization | 使用 matplotlib/seaborn/plotly 创建发表级图形。多面板布局、误差棒、显著性标记、色盲友好、PDF/EPS/TIFF 导出。 |

---

### 实验室自动化与集成

| 技能 | 说明 |
|------|------|
| opentrons-integration | Flex/OT-2 机器人实验室自动化平台。编写 Protocol API v2 协议、液体处理、硬件模块（加热振荡器、热循环仪）、耗材管理。 |
| pylabrobot | 实验室自动化工具包，控制移液工作站、酶标仪、泵、加热振荡器、培养箱、离心机和分析仪器。 |
| benchling-integration | Benchling R&D 平台集成。通过 API 访问注册表（DNA、蛋白质）、库存、ELN 条目、工作流，构建 Benchling App，用于实验室数据管理自动化。 |
| labarchive-integration | 电子实验记录本 API 集成。访问记录本、管理条目/附件、备份记录本，与 Protocols.io/Jupyter/REDCap 集成。 |
| protocolsio-integration | protocols.io API 集成，用于管理科学实验方案——搜索、创建、更新、发布方案，管理步骤和试剂。 |
| instrument-data-to-allotrope | 将实验室仪器输出文件（PDF、CSV、Excel、TXT）转换为 Allotrope Simple Model（ASM）JSON 格式，用于 LIMS 系统、数据湖和下游分析。 |

---

### 科学研究与写作

| 技能 | 说明 |
|------|------|
| scientific-writing | 用完整段落撰写科学稿件，采用两阶段流程：章节提纲然后正文。覆盖研究论文所有章节。 |
| scientific-critical-thinking | 评估研究严谨性。评估方法学、实验设计、统计有效性、偏倚、混杂因素、证据质量（GRADE、Cochrane ROB）。 |
| scientific-brainstorming | 研究构思伙伴。生成假说、探索跨学科联系、挑战假设、开发方法论、识别研究空白，用于创造性科学问题解决。 |
| hypothesis-generation | 生成可检验的假说。从观察中制定假设，设计实验，探索竞争性解释，发展预测，提出机制，用于跨学科科学探究。 |
| scientific-problem-selection | 帮助科学家进行研究问题选择、项目构思、解决停滞项目和战略性科学决策。 |
| peer-review | 系统性同行评审工具包。评估方法学、统计、设计、可重复性、伦理、图形完整性、报告标准，用于稿件和基金评审。 |
| citation-management | 综合文献引用管理。从 Google Scholar 和 PubMed 检索论文，提取准确元数据，验证引用，生成 BibTeX 条目。 |
| research-grants | 为 NSF、NIH、DOE 和 DARPA 撰写竞争性科研项目申请书。机构特定格式、评审标准、预算编制、广泛影响和意义陈述。 |
| research-lookup | 使用 Perplexity Sonar Pro Search 或 Sonar Reasoning Pro（通过 OpenRouter）查询当前研究信息，自动选择最适合查询复杂度的模型。 |
| biomni | 自主生物医学 AI 智能体框架，执行跨基因组学、药物发现、分子生物学和临床分析的复杂研究任务。 |
| treatment-plans | 为所有临床专科生成简洁（3-4页）的医疗治疗方案（LaTeX/PDF 格式），支持普通医学、康复治疗、心理健康和慢性病管理。 |

---

### 生物信息 — 临床数据库与变异分析

| 技能 | 描述 |
|------|------|
| bio-clinical-databases-clinvar-lookup | 查询ClinVar的临床变异分类、致病性断言和审查状态。 |
| bio-clinical-databases-dbsnp-queries | 查询dbSNP获取SNP频率、等位基因和功能注释数据。 |
| bio-clinical-databases-gnomad-frequencies | 从gnomAD获取群体等位基因频率，用于罕见变异解读。 |
| bio-clinical-databases-hla-typing | 从测序数据进行HLA分型。 |
| bio-clinical-databases-myvariant-queries | 批量查询MyVariant.info获取多数据库聚合变异注释。 |
| bio-clinical-databases-pharmacogenomics | PharmGKB/CPIC药物基因组学变异查询，用于药物-基因相互作用。 |
| bio-clinical-databases-polygenic-risk | 从GWAS汇总统计和基因型数据计算多基因风险评分。 |
| bio-clinical-databases-somatic-signatures | 从体细胞变异目录中提取和分类突变特征（COSMIC）。 |
| bio-clinical-databases-tumor-mutational-burden | 从体细胞变异调用计算肿瘤突变负荷（TMB）。 |
| bio-clinical-databases-variant-prioritization | 按致病性评分、遗传方式和表型匹配对候选变异进行排序和过滤。 |
| bio-variant-calling | 基于GATK的胚系变异检测流程（BAM/CRAM文件输入）。 |
| bio-variant-calling-clinical-interpretation | 依据ACMG指南在临床背景下解读变异调用结果。 |
| bio-variant-calling-deepvariant | DeepVariant深度学习变异检测器（短读长WGS/WES数据）。 |
| bio-variant-calling-filtering-best-practices | 对变异集应用VQSR和硬过滤最佳实践。 |
| bio-variant-calling-joint-calling | 多样本联合基因分型以提升变异发现能力。 |
| bio-variant-calling-structural-variant-calling | 从长读长或配对末端测序数据调用结构变异（SV）。 |
| bio-variant-annotation | 为VCF文件添加功能性、群体和临床后果注释。 |
| bio-variant-normalization | 标准化变异表示（左对齐、分解）以实现一致比较。 |
| bio-vcf-basics | 读取、写入和解析VCF文件；按质量、区域和样本过滤。 |
| bio-vcf-manipulation | 高级VCF操作：合并、拆分、重新格式化、子集提取。 |
| bio-vcf-statistics | 计算变异统计：转换/颠换比、杂合度、深度分布。 |
| bio-gatk-variant-calling | 端到端GATK HaplotypeCaller变异检测（含BQSR和联合基因分型）。 |
| bio-copy-number-cnv-annotation | 为CNV调用添加基因内容、数据库重叠和临床意义注释。 |
| bio-copy-number-cnv-visualization | 可视化WGS/WES数据的拷贝数谱和分段图。 |
| bio-copy-number-cnvkit-analysis | CNVKit靶向测序和WES数据拷贝数分析。 |
| bio-copy-number-gatk-cnv | GATK4体细胞拷贝数改变检测流程。 |
| bio-tumor-fraction-estimation | 从等位基因频率和拷贝数数据估计肿瘤纯度和倍性。 |
| bio-ctdna-mutation-detection | 从液体活检超深度测序检测循环肿瘤DNA突变。 |
| bio-cfdna-preprocessing | 处理无细胞DNA测序数据：接头修剪、去重、质控。 |
| bio-methylation-based-detection | 从cfDNA甲基化数据检测基于甲基化的癌症信号。 |
| bio-longitudinal-monitoring | 跨序列样本追踪体细胞变异进化和克隆动态。 |

---

### 生物信息 — 测序与读长质控

| 技能 | 描述 |
|------|------|
| bio-fastq-quality | 使用FastQC/MultiQC评估FASTQ读长质量并生成每样本QC报告。 |
| bio-read-qc-adapter-trimming | 使用Trimmomatic、Cutadapt或fastp修剪测序接头。 |
| bio-read-qc-contamination-screening | 使用FastQ Screen或Kraken筛查人类/微生物污染读长。 |
| bio-read-qc-fastp-workflow | fastp端到端读长质控和预处理（含UMI处理）。 |
| bio-read-qc-quality-filtering | 按质量评分和长度过滤去除低质量读长。 |
| bio-read-qc-quality-reports | 用MultiQC聚合多样本QC报告。 |
| bio-read-qc-umi-processing | 使用UMI-tools去除PCR重复以实现精确定量。 |
| bio-paired-end-fastq | 处理配对末端FASTQ文件：验证、交错、拆分。 |
| bio-alignment-io | 使用pysam和samtools读写SAM/BAM/CRAM比对文件。 |
| bio-alignment-msa-parsing | 解析和分析多序列比对（FASTA、ClustalW、Stockholm格式）。 |
| bio-alignment-msa-statistics | 计算MSA统计：保守性、缺口含量、熵。 |
| bio-alignment-pairwise | 使用Smith-Waterman、Needleman-Wunsch、BLAST进行两两序列比对。 |
| bio-longread-alignment | 使用minimap2比对长读长（ONT/PacBio）；排序和索引BAM文件。 |
| bio-longread-qc | 长读长测序质量控制：读长长度、N50、错误率。 |
| bio-longread-medaka | 使用Oxford Nanopore Medaka进行共识校正和变异检测。 |
| bio-longread-structural-variants | 使用Sniffles/PBSV从长读长数据调用大型结构变异。 |
| bio-basecalling | 使用Dorado/Guppy对原始ONT信号进行碱基识别；转换FAST5为FASTQ。 |
| bio-compressed-files | 处理压缩生物信息文件：bgzip、tabix、zstd、htslib。 |
| bio-format-conversion | 生物信息格式转换：FASTQ↔FASTA、BAM↔CRAM、BED↔GTF。 |
| bio-sequence-statistics | 计算序列统计：GC含量、长度分布、复杂度。 |
| bio-read-sequences | 从FASTA/FASTQ文件读取和遍历生物序列。 |
| bio-write-sequences | 将生物序列写入FASTA/FASTQ并保留元数据。 |
| bio-filter-sequences | 按长度、质量、模式或分类标签过滤序列。 |
| bio-batch-processing | 跨样本和队列批量处理大型生物信息数据集。 |
| bio-rnaseq-qc | RNA-seq专项质控：链特异性、rRNA污染、基因体覆盖度。 |
| bio-long-read-sequencing-clair3-variants | 使用Clair3深度学习模型从长读长测序调用变异。 |
| bio-long-read-sequencing-isoseq-analysis | Iso-Seq全长转录本分析用于亚型发现。 |
| bio-long-read-sequencing-nanopore-methylation | 使用Modbam2bed从Oxford Nanopore测序识别CpG甲基化。 |
| bio-splicing-qc | RNA剪接质量评估：连接读长覆盖度、新颖剪接位点。 |
| bio-splicing-quantification | 量化可变剪接事件：每亚型的PSI/包含率。 |
| bio-sashimi-plots | 生成Sashimi图以可视化特定位点的RNA-seq剪接。 |

---

### 生物信息 — 差异表达与转录组学

| 技能 | 描述 |
|------|------|
| bio-de-deseq2-basics | DESeq2差异表达分析：设计矩阵、大小因子、离散度。 |
| bio-de-edger-basics | EdgeR基于计数数据的差异表达（经验贝叶斯离散度）。 |
| bio-de-results | 提取、过滤和注释DESeq2/EdgeR结果表。 |
| bio-de-visualization | 差异表达结果的火山图、MA图和热图。 |
| bio-differential-expression-batch-correction | 使用ComBat/limma消除多队列差异表达分析的批次效应。 |
| bio-differential-expression-timeseries-de | 使用样条和混合模型进行时序差异表达分析。 |
| bio-differential-splicing | 使用rMATS或MAJIQ检测差异可变剪接事件。 |
| bio-isoform-switching | 使用DRIMSeq和IsoformSwitchAnalyzeR识别亚型切换事件。 |
| bio-ribo-seq-orf-detection | 使用RiboTaper/Ribo-TISH从核糖体图谱数据检测翻译ORF。 |
| bio-ribo-seq-riboseq-preprocessing | 核糖体图谱读长预处理：接头修剪、rRNA去除、比对。 |
| bio-ribo-seq-ribosome-periodicity | 评估Ribo-seq数据中的三联体周期性和核糖体足迹质量。 |
| bio-ribo-seq-ribosome-stalling | 从Ribo-seq图谱识别核糖体停滞位点和暂停。 |
| bio-ribo-seq-translation-efficiency | 从匹配的RNA-seq和Ribo-seq计算翻译效率比。 |

---

### 生物信息 — 通路与网络分析

| 技能 | 描述 |
|------|------|
| bio-pathway-go-enrichment | 使用clusterProfiler或g:Profiler进行基因本体富集分析。 |
| bio-pathway-gsea | 使用预排序或基于计数的统计进行基因集富集分析（GSEA）。 |
| bio-pathway-kegg-pathways | KEGG代谢/信号通路富集和可视化。 |
| bio-pathway-reactome | Reactome通路分析（层次富集和可视化）。 |
| bio-pathway-wikipathways | WikiPathways富集和网络可视化。 |
| bio-pathway-enrichment-visualization | 通路结果的点图、富集图和网络可视化。 |

---

### 生物信息 — 单细胞与空间组学

| 技能 | 描述 |
|------|------|
| bio-single-cell-batch-integration | 使用Harmony、BBKNN、scVI跨批次整合scRNA-seq数据集。 |
| bio-single-cell-cell-annotation | 使用标记基因和参考图谱注释单细胞簇。 |
| bio-single-cell-cell-communication | 使用CellChat或NicheNet推断配体-受体细胞间通讯。 |
| bio-single-cell-clustering | 在Scanpy/Seurat中使用Leiden/Louvain算法对单细胞聚类。 |
| bio-single-cell-data-io | 读写AnnData、Seurat和10x Genomics h5ad/h5格式。 |
| bio-single-cell-doublet-detection | 使用Scrublet或DoubletFinder从scRNA-seq去除双联体。 |
| bio-single-cell-lineage-tracing | 使用克隆条形码从scRNA-seq重建细胞谱系树。 |
| bio-single-cell-markers-annotation | 识别簇标记基因并自动注释细胞类型。 |
| bio-single-cell-metabolite-communication | 从scRNA-seq推断代谢物介导的细胞间通讯。 |
| bio-single-cell-multimodal-integration | 使用WNN/MultiVI整合scRNA-seq与ATAC、CITE-seq或空间数据。 |
| bio-single-cell-perturb-seq | 分析Perturb-seq / CROP-seq基因扰动筛选数据。 |
| bio-single-cell-preprocessing | 单细胞预处理：计数过滤、归一化、高变基因选择。 |
| bio-single-cell-scatac-analysis | scATAC-seq峰调用、TF基序富集和染色质可及性分析。 |
| bio-single-cell-splicing | 使用scVelo或Alevin进行RNA速度和剪接动态分析。 |
| bio-single-cell-trajectory-inference | 使用Monocle3、PAGA或Slingshot推断伪时间轨迹。 |
| bio-spatial-transcriptomics-image-analysis | 分析与空间转录组学数据共配准的组织学图像。 |
| bio-spatial-transcriptomics-spatial-communication | 具有空间背景的配体-受体通讯分析（COMMOT、SpatialDE）。 |
| bio-spatial-transcriptomics-spatial-data-io | 加载和处理Visium、Slide-seq、MERFISH和STARmap数据集。 |
| bio-spatial-transcriptomics-spatial-deconvolution | 使用RCTD、SPOTlight对空间点中的细胞类型比例进行解卷积。 |
| bio-spatial-transcriptomics-spatial-domains | 使用SpatialDE/BANKSY识别空间可变基因和组织域。 |
| bio-spatial-transcriptomics-spatial-multiomics | 将空间转录组学与蛋白质组学、代谢组学或成像整合。 |
| bio-spatial-transcriptomics-spatial-neighbors | 构建空间邻居图并进行邻域富集分析。 |
| bio-spatial-transcriptomics-spatial-preprocessing | 空间转录组学预处理：质控、归一化、点过滤。 |
| bio-spatial-transcriptomics-spatial-proteomics | 分析CODEX、IMC或MIBI平台的空间蛋白质组学数据。 |
| bio-spatial-transcriptomics-spatial-statistics | 空间统计：Moran's I、空间自相关、共定位。 |
| bio-spatial-transcriptomics-spatial-visualization | 可视化空间基因表达图和组织切片叠加层。 |

---

### 生物信息 — 表观基因组学与染色质

| 技能 | 描述 |
|------|------|
| bio-atac-seq-atac-peak-calling | 使用MACS2/MACS3调用ATAC-seq染色质可及性峰。 |
| bio-atac-seq-atac-qc | ATAC-seq质量控制：TSS富集、片段大小、FRiP评分。 |
| bio-atac-seq-differential-accessibility | 使用DESeq2/DiffBind进行条件间差异染色质可及性分析。 |
| bio-atac-seq-footprinting | 使用TOBIAS或HINT-ATAC从ATAC-seq数据进行TF足迹分析。 |
| bio-atac-seq-motif-deviation | 使用chromVAR对单细胞ATAC数据进行TF基序偏差评分。 |
| bio-atac-seq-nucleosome-positioning | 从ATAC-seq片段长度分布推断核小体定位。 |
| bio-chipseq-differential-binding | 使用DiffBind进行差异ChIP-seq结合分析。 |
| bio-chipseq-motif-analysis | 使用HOMER/MEME从ChIP-seq峰进行从头和已知基序发现。 |
| bio-chipseq-peak-annotation | 为ChIP-seq峰添加基因组特征和最近基因注释。 |
| bio-chipseq-peak-calling | 使用MACS2调用TF结合和组蛋白标记的ChIP-seq峰。 |
| bio-chipseq-qc | ChIP-seq质量指标：FRiP、SCC、phantompeakqualtools。 |
| bio-chipseq-super-enhancers | 使用ROSE从H3K27ac ChIP-seq识别超级增强子。 |
| bio-chipseq-visualization | 使用deepTools在峰区域生成热图和聚合图谱。 |
| bio-hi-c-analysis-compartment-analysis | 从Hi-C接触矩阵调用A/B区室。 |
| bio-hi-c-analysis-contact-pairs | 处理Hi-C接触对：过滤、去重、分箱。 |
| bio-hi-c-analysis-hic-data-io | 使用cooler/hicstuff读写Hi-C数据格式：.hic、cool、mcool。 |
| bio-hi-c-analysis-hic-differential | 条件间差异Hi-C相互作用分析。 |
| bio-hi-c-analysis-hic-visualization | 使用pyGenomeTracks可视化Hi-C接触图、TAD和环。 |
| bio-hi-c-analysis-loop-calling | 使用Mustache或HICCUPS从Hi-C数据检测染色质环。 |
| bio-hi-c-analysis-matrix-operations | 归一化Hi-C矩阵：ICE、KR、VC；计算观测/期望值。 |
| bio-hi-c-analysis-tad-detection | 从Hi-C数据识别拓扑相关域（TAD）。 |
| bio-methylation-bismark-alignment | 使用Bismark比对亚硫酸盐测序读长并提取CpG甲基化。 |
| bio-methylation-calling | 从WGBS/RRBS比对中调用CpG甲基化。 |
| bio-methylation-dmr-detection | 使用DSS或MethylKit识别差异甲基化区域（DMR）。 |
| bio-methylation-methylkit | MethylKit甲基化分析：CpG瓦片、DMR调用、注释。 |

---

### 生物信息 — 宏基因组学与微生物组

| 技能 | 描述 |
|------|------|
| bio-metagenomics-abundance | 从鸟枪法宏基因组学估计微生物分类丰度。 |
| bio-metagenomics-amr-detection | 使用AMRFinder或RGI/CARD检测抗菌素耐药基因。 |
| bio-metagenomics-functional-profiling | 使用HUMAnN3进行宏基因组功能分析（通路/基因家族）。 |
| bio-metagenomics-kraken | 使用Kraken2/Bracken进行宏基因组读长分类。 |
| bio-metagenomics-metaphlan | 使用MetaPhlAn4进行基于进化支特异性标记的微生物群落图谱分析。 |
| bio-metagenomics-strain-tracking | 使用StrainPhlan或inStrain跨样本追踪微生物菌株。 |
| bio-metagenomics-visualization | 使用Krona图和堆积柱状图可视化微生物组组成。 |
| bio-microbiome-amplicon-processing | 使用QIIME2或DADA2处理16S/ITS扩增子测序数据。 |
| bio-microbiome-differential-abundance | 使用ANCOM-BC、MaAsLin2或ALDEx2检验差异微生物丰度。 |
| bio-microbiome-diversity-analysis | Alpha/beta多样性分析：Shannon、PD、UniFrac、PCoA。 |
| bio-microbiome-functional-prediction | 使用PICRUSt2或Tax4Fun从16S数据预测功能能力。 |
| bio-microbiome-qiime2-workflow | 端到端QIIME2流程：去噪、多样性、差异丰度。 |
| bio-microbiome-taxonomy-assignment | 使用SILVA、GTDB或Greengenes2为ASV/OTU分配分类。 |

---

### 生物信息 — 免疫信息学与流式细胞术

| 技能 | 描述 |
|------|------|
| bio-immunoinformatics-epitope-prediction | 使用NetMHCpan/MHCflurry从蛋白质序列预测MHC-I/II表位。 |
| bio-immunoinformatics-immunogenicity-scoring | 为疫苗和新抗原优先排序评分肽段免疫原性。 |
| bio-immunoinformatics-mhc-binding-prediction | 预测多个等位基因的肽-MHC结合亲和力。 |
| bio-immunoinformatics-neoantigen-prediction | 从体细胞突变预测新抗原，用于个性化癌症疫苗。 |
| bio-immunoinformatics-tcr-epitope-binding | 使用ERGO、pMTnet或NetTCR预测TCR-表位结合。 |
| bio-tcr-bcr-analysis-immcantation-analysis | 使用Immcantation套件分析B/T细胞受体库。 |
| bio-tcr-bcr-analysis-mixcr-analysis | MiXCR V(D)J比对和克隆型组装用于免疫库分析。 |
| bio-tcr-bcr-analysis-repertoire-visualization | 可视化库多样性、克隆扩增和V基因使用情况。 |
| bio-tcr-bcr-analysis-scirpy-analysis | 使用Scirpy进行整合scRNA-seq的单细胞TCR/BCR分析。 |
| bio-tcr-bcr-analysis-vdjtools-analysis | 使用VDJtools进行免疫库统计和重叠分析。 |
| bio-flow-cytometry-bead-normalization | 使用校准珠对流式细胞仪数据进行归一化。 |
| bio-flow-cytometry-clustering-phenotyping | 使用FlowSOM、PhenoGraph或UMAP对细胞群体进行聚类和表型分析。 |
| bio-flow-cytometry-compensation-transformation | 应用补偿矩阵和双指数/arcsinh变换。 |
| bio-flow-cytometry-cytometry-qc | 流式/质谱细胞仪质量控制：信号漂移、溢出、异常值检测。 |
| bio-flow-cytometry-differential-analysis | 条件间细胞群体的统计比较。 |
| bio-flow-cytometry-doublet-detection | 检测和去除流式细胞仪数据中的双联体。 |
| bio-flow-cytometry-fcs-handling | 使用FlowCore/FlowKit读取、写入和操作FCS文件。 |
| bio-flow-cytometry-gating-analysis | 用于细胞群体鉴定的手动和算法门控策略。 |
| bio-imaging-mass-cytometry-cell-segmentation | 使用Mesmer或CellProfiler对IMC图像中的细胞进行分割。 |
| bio-imaging-mass-cytometry-data-preprocessing | 成像质谱细胞仪数据预处理：热像素去除、归一化。 |
| bio-imaging-mass-cytometry-interactive-annotation | 在IMC空间数据集中交互式注释细胞类型。 |
| bio-imaging-mass-cytometry-phenotyping | 从多标记IMC面板对免疫和肿瘤细胞进行表型分析。 |
| bio-imaging-mass-cytometry-quality-metrics | IMC采集质量指标：信噪比、组织覆盖度。 |
| bio-imaging-mass-cytometry-spatial-analysis | 成像质谱细胞仪数据的空间细胞邻域分析。 |

---

### 生物信息 — 多组学整合

| 技能 | 描述 |
|------|------|
| bio-multi-omics-data-harmonization | 协调多组学数据集：样本匹配、批次校正、特征对齐。 |
| bio-multi-omics-mixomics-analysis | 使用mixOmics进行多组学因子分析（DIABLO、MOFA、sPLS-DA）。 |
| bio-multi-omics-mofa-integration | 跨模态潜因子发现的多组学因子分析（MOFA+）。 |
| bio-multi-omics-similarity-network | 相似性网络融合（SNF）用于多组学患者分层。 |

---

### 生物信息 — 蛋白质组学与代谢组学

| 技能 | 描述 |
|------|------|
| bio-proteomics-data-import | 从MaxQuant、Proteome Discoverer、FragPipe导入DDA/DIA蛋白质组学数据。 |
| bio-proteomics-dia-analysis | 使用DIA-NN或Spectronaut进行DIA蛋白质组学分析。 |
| bio-proteomics-differential-abundance | 使用limma、MSstats或DEqMS进行差异蛋白丰度分析。 |
| bio-proteomics-peptide-identification | 肽段谱图匹配和数据库搜索结果解析。 |
| bio-proteomics-protein-inference | 蛋白质分组、简约性和蛋白质组学实验的FDR控制。 |
| bio-proteomics-proteomics-qc | 蛋白质组学质控：肽段计数、覆盖度、缺失值、CV。 |
| bio-proteomics-ptm-analysis | 翻译后修饰分析：磷酸化、泛素化、糖基化富集。 |
| bio-proteomics-quantification | 无标记、TMT/iTRAQ和SILAC定量工作流程。 |
| bio-proteomics-spectral-libraries | 构建和使用DIA数据分析的谱图库。 |
| bio-metabolomics-lipidomics | 脂质组学数据分析：脂质类别注释、脂肪酸组成。 |
| bio-metabolomics-metabolite-annotation | 使用HMDB、MZmine、SIRIUS或MetFrag注释质谱特征。 |
| bio-metabolomics-msdial-preprocessing | MS-DIAL的LC-MS/GC-MS数据预处理和峰检测。 |
| bio-metabolomics-normalization-qc | 代谢组学归一化：PQN、LOESS、中位数、批次校正。 |
| bio-metabolomics-pathway-mapping | 将鉴定的代谢物映射到KEGG、MetaCyc或Reactome通路。 |
| bio-metabolomics-statistical-analysis | 代谢组学的单变量/多变量统计：PCA、PLS-DA、ANOVA。 |
| bio-metabolomics-targeted-analysis | 靶向代谢组学（MRM/SRM）：校准曲线、定量。 |
| bio-metabolomics-xcms-preprocessing | XCMS的LC-MS峰检测、对齐和分组。 |

---

### 生物信息 — 结构生物学与化学信息学

| 技能 | 描述 |
|------|------|
| bio-structural-biology-alphafold-predictions | 使用AlphaFold2/3预测：模型质量评估、置信度评分。 |
| bio-structural-biology-modern-structure-prediction | 使用ESMFold、RoseTTAFold和OpenFold进行现代结构预测。 |
| bio-pdb-geometric-analysis | 蛋白质结构几何分析：距离、角度、接触、RMSD。 |
| bio-pdb-structure-io | 使用BioPython或Gemmi读写PDB/mmCIF结构文件。 |
| bio-pdb-structure-modification | 修改蛋白质结构：添加氢原子、突变残基、能量最小化。 |
| bio-pdb-structure-navigation | 导航和检查PDB结构：链、残基、原子选择。 |
| bio-molecular-descriptors | 计算分子描述符（RDKit）：MW、LogP、TPSA、指纹。 |
| bio-molecular-io | 使用RDKit读写化学结构格式：SDF、SMILES、MOL2、PDB。 |
| bio-reaction-enumeration | 从SMARTS反应模板枚举反应和产物。 |
| bio-similarity-searching | 分子相似性搜索：Tanimoto系数、基于指纹、骨架跳跃。 |
| bio-substructure-search | 使用SMARTS模式在化学数据库中进行子结构搜索。 |
| bio-virtual-screening | 虚拟筛选流程：对接、评分、姿态过滤（AutoDock/Vina）。 |
| bio-admet-prediction | 预测ADMET性质：吸收、分布、代谢、排泄、毒性。 |

---

### 生物信息 — 流行病学基因组学与因果基因组学

| 技能 | 描述 |
|------|------|
| bio-epidemiological-genomics-amr-surveillance | 来自基因组流行病学数据的抗菌素耐药性监测。 |
| bio-epidemiological-genomics-pathogen-typing | 病原体分子分型：MLST、wgMLST、cgMLST（用于暴发分析）。 |
| bio-epidemiological-genomics-phylodynamics | 系统动力学：分子钟、种群动态、BEAST2/TreeTime。 |
| bio-epidemiological-genomics-transmission-inference | 使用TransPhylo/outbreaker2从病原体基因组推断传播网络。 |
| bio-epidemiological-genomics-variant-surveillance | 从基因组监测追踪病原体变异出现和传播。 |
| bio-causal-genomics-colocalization-analysis | 使用coloc或eCAVIAR进行GWAS和eQTL信号的共定位分析。 |
| bio-causal-genomics-fine-mapping | 使用SuSiE或FINEMAP对GWAS位点的因果变异进行精细定位。 |
| bio-causal-genomics-mediation-analysis | 基因表达中间变量的因果中介分析。 |
| bio-causal-genomics-mendelian-randomization | 使用MR-Base/TwoSampleMR进行两样本孟德尔随机化。 |
| bio-causal-genomics-pleiotropy-detection | 在MR分析中检测水平多效性和异质性。 |
| bio-genome-engineering-base-editing-design | 设计碱基编辑器（CBE/ABE）用于精确单碱基纠正。 |
| bio-genome-engineering-grna-design | 使用Cas-OFFinder和CRISPOR设计和评分CRISPR引导RNA。 |
| bio-genome-engineering-hdr-template-design | 通过同源定向修复设计精确敲入的HDR模板。 |
| bio-genome-engineering-off-target-prediction | 在全基因组范围内预测CRISPR脱靶位点用于安全性评估。 |
| bio-genome-engineering-prime-editing-design | 为引物编辑实验设计pegRNA和切口酶gRNA。 |
| bio-crispr-screens-base-editing-analysis | 分析碱基编辑筛选：引导效率、编辑结果。 |
| bio-crispr-screens-batch-correction | 纠正跨重复实验CRISPR筛选数据的批次效应。 |
| bio-crispr-screens-crispresso-editing | 使用CRISPResso2从扩增子测序量化编辑结果。 |
| bio-crispr-screens-hit-calling | 使用MAGeCK、BAGEL2或casTLE从CRISPR筛选中调用命中基因。 |
| bio-crispr-screens-jacks-analysis | 使用JACKS层次贝叶斯模型进行CRISPR筛选分析。 |
| bio-crispr-screens-library-design | 设计CRISPR筛选文库：引导选择、对照、覆盖度。 |
| bio-crispr-screens-mageck-analysis | MAGeCK MLE/RRA分析用于CRISPR pooled筛选。 |
| bio-crispr-screens-screen-qc | CRISPR筛选质量控制：基尼指数、读长分布。 |

---

### 健康与健康管理分析

| 技能 | 描述 |
|------|------|
| nutrition-analyzer | 全面营养分析：宏量/微量营养素追踪、膳食评估、餐食规划、食物数据查询和营养建议。 |
| mental-health-analyzer | 心理健康数据分析：情绪追踪、症状模式、PHQ/GAD评分、行为洞察和健康建议。 |
| sleep-analyzer | 睡眠质量分析：睡眠阶段、时长、效率指标、昼夜节律评估和睡眠卫生建议。 |
| rehabilitation-analyzer | 康复进度追踪：功能评估、运动方案、康复里程碑和物理/职业治疗结局测量。 |
| fitness-analyzer | 健身表现分析：运动追踪、力量/有氧指标、训练负荷、VO2max估算和周期化规划。 |
| health-trend-analyzer | 纵向健康趋势分析：生命体征追踪、生物标志物趋势、风险因素监测和预测性健康洞察。 |
| weightloss-analyzer | 体重管理分析：热量平衡、体成分追踪、进度监测和循证减重策略。 |
| goal-analyzer | 健康目标追踪与分析：SMART目标设定、进度指标、习惯养成和健康目标的激励洞察。 |
| occupational-health-analyzer | 职业健康评估：工作场所人体工程学、暴露风险、工作相关疾病监测和复工规划。 |
| travel-health-analyzer | 旅行医学：目的地健康风险、疫苗接种要求、疟疾预防、高原反应和旅行者健康准备。 |
| family-health-analyzer | 家庭健康管理：儿科发育里程碑、家族病史、预防性筛查时间表和多代健康追踪。 |
| tcm-constitution-analyzer | 中医体质分析：中医体质评估、证型辨别、草药建议和生活方式指导。 |
| emergency-card | 生成包含关键健康数据、药物、过敏和紧急联系人的急救医疗信息卡，用于患者安全。 |
| ai-analyzer | AI驱动的全面健康数据解读，结合多个生物标志物和健康指标进行整体健康评估。 |
| oral-health-analyzer | 口腔健康评估：牙科症状分析、牙周风险、口腔癌筛查意识和预防性牙科护理指导。 |
| skin-health-analyzer | 皮肤科健康分析：皮肤状况追踪、皮损记录、紫外线暴露评估和护肤方案优化。 |
| sexual-health-analyzer | 性健康评估：性传播感染风险评估、生殖健康追踪、避孕指导和性健康教育。 |
| food-database-query | 查询综合食物数据库获取营养成分、配料表、过敏原信息和饮食兼容性。 |
| wellally-tech | WellAlly健康分析平台的技术框架：集成模式、数据管道和健康AI基础设施。 |

---

### 分析师人格

| 技能 | 描述 |
|------|------|
| biologist-analyst | 生物学家分析师人格，用于解读生物实验、测序数据、细胞生物学测定和分子生物学研究。 |
| chemist-analyst | 化学家分析师人格，用于解读化学数据、合成路线、光谱结果、反应机制和实验室分析。 |
| epidemiologist-analyst | 流行病学家分析师人格，用于研究设计、队列分析、风险因素评估、公共卫生监测和因果推断。 |
| psychologist-analyst | 心理学家分析师人格，用于行为数据分析、心理评估解读、临床案例制定和心理健康研究。 |

---

### 心理健康与危机干预

| 技能 | 描述 |
|------|------|
| crisis-detection-intervention-ai | 使用NLP和心理健康情感分析检测危机信号。实现自杀意念检测、自动升级和危机资源整合，用于心理健康应用和康复平台。 |
| crisis-response-protocol | 安全处理心理健康危机情况：危机检测、安全协议、紧急升级、自杀预防和热线整合，适用于AI辅导应用。 |
| hipaa-compliance | 处理PHI时确保HIPAA合规。用于健康数据应用的审计日志、数据访问控制、安全事件追踪和合规验证。 |
| clinical-diagnostic-reasoning | 通过系统性错误分析、鉴别诊断框架和临床判断改进，识别和抵制医疗决策中的认知偏见。 |
| speech-pathology-ai | AI驱动的言语语言病理学：音素分析、构音可视化、嗓音障碍评估、流利度干预、AAC和口吃治疗支持。 |
| hrv-alexithymia-expert | 心率变异性生物特征和情绪意识训练。HRV分析、内感受训练、生物反馈、迷走神经张力评估和自主神经系统评价。 |
| adhd-daily-planner | ADHD优化的日常规划：时间盲友好的日程安排、执行功能支持、多巴胺感知任务设计和神经多样性友好的生产力系统。 |
| grief-companion | 富有同理心的丧亲支持、纪念创作、悲伤教育和在非线性失落旅程中提供治愈引导。 |
| jungian-psychologist | 荣格分析心理学：阴影工作、原型分析、梦境解析、积极想象、通过深层心理学视角的成瘾/康复和个体化过程。 |
| modern-drug-rehab-computer | 综合成瘾康复知识系统：循证治疗（CBT、DBT、MI、EMDR、MAT）、康复资源、危机干预和戒毒机构的家庭系统。 |
| recovery-community-moderator | 成瘾康复社区的创伤知情AI主持：减少伤害、12步传统、冲突检测和危机帖子识别。 |

---

### 癌症基因组数据库

| 技能 | 描述 |
|------|------|
| cbioportal-database | 查询cBioPortal的癌症基因组数据：体细胞突变、拷贝数、基因表达和数百项癌症研究的生存数据。癌症靶点验证、癌基因分析和患者级基因组图谱。 |
| depmap | 查询癌症依赖图谱（DepMap）的癌细胞系基因依赖评分（CRISPR Chronos）、药物敏感性和基因效应图谱。识别癌症特异性脆弱性和合成致死相互作用。 |
| imaging-data-commons | 查询和下载NCI成像数据共享平台的公共癌症成像数据。访问放射学（CT、MR、PET）和病理数据集用于AI训练或研究。无需身份验证。 |

---

### 基因组与分子数据库

| 技能 | 描述 |
|------|------|
| bindingdb-database | 查询BindingDB获取药物-靶点结合亲和力数据（Ki、Kd、IC50、EC50）。药物发现、先导化合物优化、多药理学和SAR研究。 |
| gnomad-database | 查询gnomAD获取群体等位基因频率、变异约束评分（pLI、LOEUF）和功能丧失不耐受性。变异致病性解读和罕见病遗传学。 |
| gtex-database | 查询GTEx获取组织特异性基因表达、eQTL和sQTL。将GWAS变异与基因调控联系起来并解释非编码变异效应。 |
| interpro-database | 查询InterPro获取蛋白质家族、结构域和功能位点注释。整合Pfam、PANTHER、PRINTS、SMART等11+数据库进行蛋白质功能预测。 |
| jaspar-database | 查询JASPAR获取转录因子结合位点图谱（PWM/PFM）。调控基因组学、基序分析和GWAS调控变异解读。 |
| monarch-database | 查询Monarch Initiative知识图谱获取疾病-基因-表型关联。整合OMIM、ORPHANET、HPO、ClinVar用于罕见病基因发现。 |
| tiledbvcf | 使用TileDB进行可扩展的VCF/BCF摄取、存储和并行查询，用于大规模群体基因组学。 |

---

### 结构生物学与药物发现

| 技能 | 描述 |
|------|------|
| molecular-dynamics | 使用OpenMM和MDAnalysis运行和分析分子动力学模拟。蛋白质/小分子系统、力场、能量最小化、RMSD/RMSF分析、自由能面计算。 |
| glycoengineering | 分析和工程化蛋白质糖基化。预测N/O-糖基化位点，访问糖工程化工具（NetOGlyc、GlycoShield）。治疗性抗体优化和疫苗设计。 |
| adaptyv | 自动化蛋白质测试的云实验室平台：结合测定、表达测试、热稳定性、酶活性。使用NetSolP、SoluProt、ESM进行蛋白质序列优化。 |
| ginkgo-cloud-lab | 在Ginkgo Bioworks云实验室提交和管理协议，实现自主实验室执行。无细胞蛋白质表达、协议工作流程和生物技术自动化。 |

---

### 单细胞与轨迹分析

| 技能 | 描述 |
|------|------|
| scvelo | RNA速度分析。从未剪接/剪接mRNA动态估计细胞状态转变，推断轨迹方向，计算潜伏时间，识别scRNA-seq数据中的驱动基因。 |

---

### 系统发育与网络分析

| 技能 | 描述 |
|------|------|
| phylogenetics | 使用MAFFT、IQ-TREE 2和FastTree构建和分析系统发育树。进化分析、微生物基因组学、病毒系统动力学和分子钟研究。 |
| networkx | Python网络和图分析。生物网络分析、蛋白质相互作用网络、通路图、社区检测和中心性度量。 |
| torch-geometric | 用于分子属性预测、药物-靶点相互作用建模和生物图几何深度学习的图神经网络（PyG）。 |

---

### 医疗器械与监管

| 技能 | 描述 |
|------|------|
| iso-13485-certification | 医疗器械ISO 13485质量管理体系文档综合工具包：差距分析、质量手册、程序、医疗器械档案。涵盖FDA QMSR、EU MDR合规要求。 |

---

### 公共卫生与时序分析

| 技能 | 描述 |
|------|------|
| datacommons-client | 访问Google Data Commons的公共健康统计数据：疾病流行率、人口统计数据、全球来源的健康指标。 |
| timesfm-forecasting | 使用Google TimesFM进行零样本时序预测。适用于生命体征趋势、健康传感器数据和纵向健康监测，无需自定义模型训练。 |
| aeon | 时序机器学习：分类、回归、聚类、异常检测、分割，适用于时序健康数据和连续临床测量。 |

---

### 科学文献与参考管理

| 技能 | 描述 |
|------|------|
| bgpt-paper-search | 使用BGPT MCP服务器搜索科学论文。每篇论文返回25+结构化字段：方法、结果、样本量、质量评分。用于文献综述和证据综合。 |
| pyzotero | 通过Zotero Web API v3以编程方式与Zotero参考文献库交互。检索、创建、更新条目，导出引用，上传PDF，构建研究自动化工作流程。 |
| open-notebook | 自托管NotebookLM替代品。摄取PDF、视频、网页、文档；生成AI驱动的笔记；与研究材料对话；支持16+AI提供商。 |

---

### 数据处理与科学计算

| 技能 | 描述 |
|------|------|
| dask | 用于超出RAM的基因组/组学数据集的分布式计算。扩展pandas/NumPy超过内存限制，并行文件处理，分布式ML。 |
| polars | 快速内存DataFrame库（1-100GB）。生物医学数据ETL和分析管道的更快pandas替代品。 |
| vaex | 数十亿行数据的核外DataFrame操作。大型基因组和临床数据集的快速统计和可视化。 |
| zarr-python | 云存储的分块N维数组。压缩数组、并行I/O、S3/GCS集成，用于大规模组学数据。 |
| pytorch-lightning | 生物医学AI的结构化PyTorch深度学习：多GPU训练、回调、日志记录、临床/基因组模型的分布式训练。 |

---

### 科学可视化与科研传播

| 技能 | 描述 |
|------|------|
| matplotlib | 全定制的低级绘图库。用于科学手稿和期刊的出版质量图形。 |
| seaborn | 带pandas集成的统计可视化。用于生物医学数据探索的箱线图、小提琴图、热图、配对图。 |
| plotly | 交互式可视化。悬停信息、缩放、探索性生物医学分析和演示的仪表板。 |
| infographics | 使用迭代AI精炼创建专业科学信息图表。支持10种信息图类型和8种行业风格。 |
| scientific-schematics | 出版质量的科学图表：神经网络架构、生物通路、系统图、流程图。 |
| scientific-slides | 为会议、研讨会、论文答辩构建研究演示幻灯片。支持PowerPoint和LaTeX Beamer。 |
| latex-posters | 使用LaTeX（beamerposter、tikzposter）创建专业研究海报。多栏布局的会议海报。 |
| pptx-posters | 可导出为PDF或PPTX的HTML/CSS研究海报。现代网页式海报设计。 |
| markdown-mermaid-writing | 使用Markdown和24种Mermaid图表类型进行科学文档编写。9种科学报告文档模板。 |
| paper-2-web | 将学术论文转换为交互式网站、演示视频和会议海报（Paper2Web、Paper2Video、Paper2Poster）。 |

---

### 生物信息学编排与管道 (ClawBio)

| 技能 | 描述 |
|------|------|
| bio-orchestrator | 将生物信息学请求路由到专业子技能的元代理。处理文件类型检测（VCF、FASTQ、BAM、PDB、h5ad）、分析规划、报告生成和可重现性导出。 |
| scrna-orchestrator | 本地Scanpy单细胞RNA-seq管道：QC、聚类、标记基因发现和从原始计数.h5ad文件进行两组差异表达分析。 |
| seq-wrangler | 序列QC、比对和BAM处理。封装FastQC、BWA/Bowtie2、SAMtools实现自动化读长转BAM管道。 |
| vcf-annotator | 使用VEP、ClinVar、gnomAD频率和祖先背景注释VCF变异。生成优先级排列的变异报告。 |
| repro-enforcer | 将生物信息学分析导出为可重现包，包含Conda环境、Singularity容器定义和Nextflow管道。 |
| galaxy-bridge | Galaxy工具发现、推荐和执行 — 来自usegalaxy.org的8,000+生物信息学工具，多信号评分和工作流程建议。 |

---

### 基因组学、祖先分析与药物基因组学 (ClawBio)

| 技能 | 描述 |
|------|------|
| gwas-lookup | 跨9个基因组数据库的联合变异查询：GWAS Catalog、Open Targets、PheWeb（UKB、FinnGen、BBJ）、GTEx、eQTL Catalogue等。 |
| gwas-prs | 使用PGS Catalog从DTC基因数据（23andMe/AncestryDNA）计算多基因风险评分。 |
| pharmgx-reporter | 来自DTC基因数据的药物基因组报告 — 12个基因、31个SNP、51种药物，含CPIC指南和个性化剂量卡。 |
| nutrigx_advisor | 营养基因组顾问 — 基于SNP的13个营养领域个性化饮食建议。 |
| clinpgx | 查询ClinPGx API获取药物基因组基因-药物数据、临床注释、CPIC指南和FDA药品标签。 |
| drug-photo | 通过Claude视觉从药品包装照片识别药物，然后检索基因型知情的剂量指导。 |
| claw-ancestry-pca | 与西蒙斯基因组多样性项目（345个样本，164个全球群体）的祖先分解PCA分析。 |
| genome-compare | 通过IBS和EM混合将基因组与参考个体比较并估计祖先组成。 |
| equity-scorer | 从VCF或祖先数据计算HEIM多样性和公平性指标。生成杂合度、FST、PCA图和HEIM公平评分报告。 |
| claw-metagenomics | 鸟枪法宏基因组分析：分类（Kraken2/Bracken）、耐药组（CARD/RGI）和功能通路（HUMAnN3）。 |
| ukb-navigator | UK Biobank 12,000+数据字段和出版物的语义搜索 — 为研究问题找到合适的变量。 |

---

### 结构生物学与文献综合 (ClawBio)

| 技能 | 描述 |
|------|------|
| struct-predictor | 使用AlphaFold、Boltz或Chai进行本地蛋白质结构预测。比较结构、计算RMSD、可视化3D模型。 |
| lit-synthesizer | 搜索PubMed和bioRxiv，用LLM摘要论文，构建引用图，生成文献综述章节。 |
| claw-semantic-sim | 使用PubMedBERT嵌入计算疾病研究文献的语义相似性指数。计算研究公平性指标（HEIM）。 |
| labstep | 通过Labstep API与电子实验记录本交互。查询实验、协议、资源和库存。 |
| profile-report | 生成结构化生物信息学分析概要报告。 |

---

### BioOS 扩展生物信息工具套件

> 以下技能来自 BioOS 项目，涵盖完整的生物信息学分析链路。中文描述详见英文文档对应章节。

#### 序列与比对 (22个技能)
bio-alignment-sorting / bio-alignment-filtering / bio-alignment-indexing / bio-alignment-validation / bio-alignment-files-bam-statistics / bio-sam-bam-basics / bio-duplicate-handling / bio-pileup-generation / bio-reference-operations / bio-blast-searches / bio-local-blast / bio-entrez-search / bio-entrez-fetch / bio-entrez-link / bio-uniprot-access / bio-geo-data / bio-sra-data / bio-batch-downloads / bio-seq-objects / bio-sequence-properties / bio-sequence-similarity / bio-sequence-slicing

#### 序列功能分析 (12个技能)
bio-motif-search / bio-codon-usage / bio-transcription-translation / bio-reverse-complement / bio-primer-design-primer-basics / bio-primer-design-primer-validation / bio-primer-design-qpcr-primers / bio-restriction-sites / bio-restriction-mapping / bio-restriction-fragment-analysis / bio-restriction-enzyme-selection / bio-read-alignment-bwa-alignment

#### 基因组组装 (8个技能)
bio-genome-assembly-long-read-assembly / bio-genome-assembly-hifi-assembly / bio-genome-assembly-short-read-assembly / bio-genome-assembly-metagenome-assembly / bio-genome-assembly-assembly-qc / bio-genome-assembly-assembly-polishing / bio-genome-assembly-scaffolding / bio-genome-assembly-contamination-detection

#### 基因组区间与注释 (7个技能)
bio-genome-intervals-bed-file-basics / bio-genome-intervals-interval-arithmetic / bio-genome-intervals-proximity-operations / bio-genome-intervals-coverage-analysis / bio-genome-intervals-bigwig-tracks / bio-genome-intervals-gtf-gff-handling / bio-bedgraph-handling

#### RNA定量与表达矩阵 (8个技能)
bio-rna-quantification-featurecounts-counting / bio-rna-quantification-alignment-free-quant / bio-rna-quantification-tximport-workflow / bio-rna-quantification-count-matrix-qc / bio-expression-matrix-counts-ingest / bio-expression-matrix-gene-id-mapping / bio-expression-matrix-metadata-joins / bio-expression-matrix-sparse-handling

#### 表观转录组与CLIP-seq (10个技能)
bio-epitranscriptomics系列5个(m6A甲基化分析) / bio-clip-seq系列5个(RNA结合蛋白结合位点)

#### 小RNA-seq (5个技能)
bio-small-rna-seq-smrna-preprocessing / bio-small-rna-seq-mirdeep2-analysis / bio-small-rna-seq-mirge3-analysis / bio-small-rna-seq-target-prediction / bio-small-rna-seq-differential-mirna

#### 群体遗传学与单体型分析 (10个技能)
bio-population-genetics系列6个 / bio-phasing-imputation系列4个

#### 比较基因组与系统进化 (10个技能)
bio-comparative-genomics系列5个 / bio-phylo系列5个

#### 系统生物学与代谢建模 (5个技能)
bio-systems-biology-flux-balance-analysis / bio-systems-biology-metabolic-reconstruction / bio-systems-biology-gene-essentiality / bio-systems-biology-context-specific-models / bio-systems-biology-model-curation

#### 实验设计、机器学习与报告 (16个技能)
bio-experimental-design系列4个 / bio-machine-learning系列6个 / bio-reporting系列5个 / bio-research-tools-biomarker-signature-studio

#### 端到端工作流管道 (37个技能)
bio-workflows-*系列33个全流程管道 + bio-splicing-pipeline / bio-liquid-biopsy-pipeline / bio-workflow-management系列4个(Snakemake/Nextflow/CWL/WDL)

#### 生信数据可视化 (11个技能)
bio-data-visualization系列11个：热图聚类/火山图/环形图/基因组轨迹/ggplot2/交互可视化/UpSet图/多面板图/颜色调色板/特化组学图

---

### 肿瘤学与精准医学智能体 (21个)
autonomous-oncology-agent, precision-oncology-agent, pan-cancer-multiomics-agent, tumor-clonal-evolution-agent, tumor-heterogeneity-agent, tumor-mutational-burden-agent, chromosomal-instability-agent, cancer-metabolism-agent, liquid-biopsy-analytics-agent, ctdna-dynamics-mrd-agent, mrd-edge-detection-agent, hrd-analysis-agent, computational-pathology-agent, multimodal-radpath-fusion-agent, radiomics-pathomics-fusion-agent, radgpt-radiology-reporter, organoid-drug-response-agent, pdx-model-analysis-agent, deep-visual-proteomics-agent, exosome-ev-analysis-agent, microbiome-cancer-agent

---

### 血液学与血液病 (7个)
myeloma-mrd-agent, mpn-progression-monitor-agent, mpn-research-assistant, bone-marrow-ai-agent, hemoglobinopathy-analysis-agent, chip-clonal-hematopoiesis-agent, coagulation-thrombosis-agent

---

### 免疫学与细胞治疗 (9个)
cart-design-optimizer-agent, armored-cart-design-agent, tcell-exhaustion-analysis-agent, nk-cell-therapy-agent, tcr-pmhc-prediction-agent, tcr-repertoire-analysis-agent, immune-checkpoint-combination-agent, tme-immune-profiling-agent, cytokine-storm-analysis-agent

---

### 单细胞与空间组学智能体 (15个)
cellagent-annotation, universal-single-cell-annotator, scfoundation-model-agent, rna-velocity-agent, spatial-transcriptomics-agent, spatial-transcriptomics-analysis, spatial-agent, nicheformer-spatial-agent, spatial-epigenomics-agent, bioinformatics-singlecell, scrna-qc, compbioagent-explorer, simo-multiomics-integration-agent, epigenomics-methylgpt-agent, biomaster-workflows

---

### 药物发现与分子设计 (35个)
agentd-drug-discovery, chematagent-drug-discovery, chemcrow-drug-discovery, medea-therapeutic-discovery, molecule-evolution-agent, molecular-glue-discovery-agent, protac-design-agent, tpd-ternary-complex-agent, mage-antibody-generator, antibody-design-agent, aav-vector-design-agent, protein-structure-prediction, crispr-guide-design, crispr-offtarget-predictor, chemical-property-lookup, chemistry-agent, cryoem-ai-drug-design-agent, time-resolved-cryoem-agent, cnv-caller-agent, popeve-variant-predictor-agent, varcadd-pathogenicity, variant-interpretation-acmg, gene-panel-design-agent, pharmacogenomics-agent, multi-ancestry-prs-agent, prs-net-deep-learning-agent, cellfree-rna-agent, long-read-sequencing-agent, bayesian-optimizer

---

### 临床AI与医疗 (20个)
chatehr-clinician-assistant, clinical-note-summarization, clinical-nlp-extractor, ehr-fhir-integration, fhir-development, digital-twin-clinical-agent, trial-eligibility-agent, trialgpt-matching, wearable-analysis-agent, multimodal-medical-imaging, prior-auth-coworker, care-coordination, claims-appeals, lab-results, drug-interaction-checker, regulatory-drafter, regulatory-drafting, biomedical-data-analysis, data-visualization-biomedical

---

### 研究基础设施与智能体框架 (20个)
biomni-general-agent, biomni-research-agent, biokernel, biomcp-server, mcpmed-bioinformatics-server, kragen-knowledge-graph, leads-literature-mining, knowledge-synthesis, deep-research-swarm, research-literature, search-strategy, scientific-manuscript, cellular-senescence-agent, ngs-analysis, opentrons-protocol-agent, virtual-lab-agent, data-visualization-expert, lobster-bioinformatics

---

### 医疗器械软件 (AminAlam/meddev-agent-skills, 47个技能)

#### 法规标准
| 技能 | 描述 |
|------|------|
| iec-62304 | IEC 62304医疗器械软件生命周期：A/B/C类控制、开发计划、验证。 |
| iso-14971 | ISO 14971风险管理：危害识别、风险控制、追溯矩阵、剩余风险。 |
| fda-premarket | FDA上市前申请（510k/PMA）软件文档、SBOM、网络安全要求。 |
| eu-mdr | EU MDR软件要求：Rule 11、UDI、GSPR、临床评价、上市后监督。 |
| iec-62443 | 联网医疗器械IEC 62443工业网络安全：区域、管道、SL等级。 |
| 21-cfr-part-11 | 21 CFR Part 11电子记录和签名：审计追踪、访问控制、验证。 |

#### 架构与安全设计 (5个)
safety-classification / separation-of-concerns / state-machines / fault-tolerance / defensive-design

#### 固件 (6个)
embedded-c / embedded-cpp / rtos-patterns / hardware-abstraction / interrupt-handling / power-management

#### 连接性 (4个)
ble-medical / wifi-medical / usb-medical / interoperability

#### 安全性 (6个)
authentication / encryption / secure-boot / secure-ota / key-management / threat-modeling

#### 测试与验证 (7个)
unit-testing / integration-testing / static-analysis / dynamic-analysis / fuzz-testing / code-coverage / hardware-in-loop

#### 文档与数据合规 (9个)
design-docs / test-docs / traceability / code-comments / inline-docs / change-control / phi-handling / data-integrity / audit-logging

#### CI/CD (3个)
pipeline-design / automated-testing / release-management

---

### 补充科学工具

| 技能 | 描述 |
|------|------|
| pymoo | 多目标优化（PYMOO）：药物设计参数优化、帕累托前沿分析、进化算法。 |
| markitdown | 将文档（PDF、DOCX、PPTX、HTML、图像）转换为Markdown进行处理和分析。 |
| perplexity-search | 通过Perplexity进行AI驱动的科学信息实时检索。 |
| geopandas | 地理空间数据分析：流行病学制图、疾病分布、空间健康分析。 |
| hypogenic | 对表格数据集进行自动假设生成和检验，结合文献洞察与数据驱动验证。 |
| pdf-processing | 高级PDF处理：文本提取、表格解析、注释、表单填写。 |
| pdf-processing-pro | 专业PDF处理：增强型OCR、多栏布局处理、批量处理。 |
| pdf-anthropic | Anthropic优化的PDF分析，用于科学和医学文档理解。 |
| xlsx-official | 官方Excel/XLSX技能：电子表格创建、分析和数据管理。 |
| docx-official | 官方Word/DOCX技能：文档创建、编辑和格式化。 |
| pptx-official | 官方PowerPoint/PPTX技能：演示文稿创建和编辑。 |

---

### 计算模拟与本体论 (HeshamFS/materials-simulation-skills, 17个)

| 技能 | 描述 |
|------|------|
| ontology-validator | 验证生物医学本体结构（HPO、GO、MeSH、SNOMED、OBO）的术语关系。 |
| ontology-explorer | 浏览和查询生物医学本体：术语层次、注释、交叉引用。 |
| ontology-mapper | 跨生物医学本体映射：HPO↔OMIM、GO↔UniProt、疾病↔表型交叉本体。 |
| slurm-job-script-generator | 为HPC基因组学/生物信息管道作业生成优化的SLURM sbatch脚本。 |
| numerical-integration | 为生物学模型模拟选择和配置ODE/PDE时间积分方法（刚性系统、IMEX）。 |
| nonlinear-solvers | 为生物网络优化、参数拟合和FBA配置非线性求解器。 |
| parameter-optimization | 实验设计、灵敏度分析、贝叶斯优化用于生物模型校准。 |
| linear-solvers | 为大规模生物网络和代谢模型计算选择线性求解器。 |
| numerical-stability | 分析时变生物模拟的数值稳定性（CFL准则、刚性检测）。 |
| simulation-orchestrator | 编排多模拟活动：参数扫描、批量作业、结果聚合。 |
| simulation-validator | 验证模拟：预飞检查、运行时监控、收敛性、NaN/Inf检测。 |
| convergence-study | 使用Richardson外推法进行模拟验证的空间/时间收敛性分析。 |
| post-processing | 提取、分析和可视化模拟输出：时间序列、场分布、统计摘要。 |
| performance-profiling | 识别计算瓶颈，分析扩展行为，优化HPC模拟作业。 |
| differentiation-schemes | 为生物模型PDE离散化选择有限差分/有限体积/谱方法。 |
| time-stepping | 生物动力学自适应时间步控制：CFL约束、检查点调度。 |
| mesh-generation | 数值模拟的网格生成：分辨率、质量指标、自适应细化。 |

---

### 开发工作流技能 (obra/superpowers, 14个)

test-driven-development / systematic-debugging / dispatching-parallel-agents / writing-plans / executing-plans / brainstorming / writing-skills / verification-before-completion / requesting-code-review / receiving-code-review / subagent-driven-development / using-git-worktrees / finishing-a-development-branch / using-superpowers
