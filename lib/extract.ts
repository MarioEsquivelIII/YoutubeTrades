import type { Source } from "./types";

// Rules-based extraction (no LLM): pull stock tickers and any cited source out of
// a video's title + description + transcript. Deliberately conservative — it
// favours precision (a known ticker or an explicit $CASHTAG) over guessing, so
// the board isn't polluted by every uppercase word.

/** Investment themes the "Trends" dropdown offers. */
export const TRENDS: { id: string; label: string }[] = [
  { id: "ai", label: "Artificial Intelligence" },
  { id: "semiconductors", label: "Semiconductors" },
  { id: "quantum", label: "Quantum Computing" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "cloud", label: "Cloud & Software" },
  { id: "ev", label: "Electric Vehicles" },
  { id: "space", label: "Space & Aerospace" },
  { id: "biotech", label: "Biotech & GLP-1" },
  { id: "dividend", label: "Dividend & Blue-chip" },
  { id: "robotics", label: "Robotics & Automation" },
  { id: "crypto", label: "Crypto & Blockchain" },
];

type KnownEntry = {
  name: string;
  aliases: string[];
  /** Security class for the ETF/Index-fund filters. Absent = common stock. */
  type?: "etf" | "index";
  /** Theme ids from TRENDS this ticker belongs to. */
  trends?: string[];
};

// Curated universe of tickers finance creators actually talk about, with the
// display name + lowercase name aliases used for name-based detection, plus
// optional ETF/index classification and theme tags.
export const KNOWN: Record<string, KnownEntry> = {
  // ── Core stocks ──────────────────────────────────────────────────────────
  NVDA: { name: "NVIDIA", aliases: ["nvidia"], trends: ["ai", "semiconductors", "robotics"] },
  AMD: { name: "Advanced Micro Devices", aliases: ["advanced micro"], trends: ["ai", "semiconductors"] },
  INTC: { name: "Intel", aliases: ["intel"], trends: ["semiconductors"] },
  MU: { name: "Micron Technology", aliases: ["micron"], trends: ["ai", "semiconductors"] },
  AVGO: { name: "Broadcom", aliases: ["broadcom"], trends: ["ai", "semiconductors"] },
  ARM: { name: "Arm Holdings", aliases: ["arm holdings"], trends: ["ai", "semiconductors"] },
  TSM: { name: "Taiwan Semiconductor", aliases: ["taiwan semi", "tsmc"], trends: ["ai", "semiconductors"] },
  SMCI: { name: "Super Micro Computer", aliases: ["supermicro", "super micro"], trends: ["ai", "semiconductors"] },
  QCOM: { name: "Qualcomm", aliases: ["qualcomm"], trends: ["semiconductors"] },
  MRVL: { name: "Marvell Technology", aliases: ["marvell"], trends: ["semiconductors"] },
  ASML: { name: "ASML Holding", aliases: ["asml"], trends: ["semiconductors"] },
  LRCX: { name: "Lam Research", aliases: ["lam research"], trends: ["semiconductors"] },
  AMAT: { name: "Applied Materials", aliases: ["applied materials"], trends: ["semiconductors"] },
  AAPL: { name: "Apple", aliases: ["apple"] },
  MSFT: { name: "Microsoft", aliases: ["microsoft"], trends: ["ai", "cloud"] },
  GOOGL: { name: "Alphabet", aliases: ["alphabet", "google"], trends: ["ai", "quantum", "cloud"] },
  AMZN: { name: "Amazon", aliases: ["amazon"], trends: ["ai", "cloud"] },
  META: { name: "Meta Platforms", aliases: ["meta platforms", "facebook"], trends: ["ai"] },
  TSLA: { name: "Tesla", aliases: ["tesla"], trends: ["ev", "robotics"] },
  NFLX: { name: "Netflix", aliases: ["netflix"] },
  PLTR: { name: "Palantir Technologies", aliases: ["palantir"], trends: ["ai"] },
  CRM: { name: "Salesforce", aliases: ["salesforce"], trends: ["cloud"] },
  ORCL: { name: "Oracle", aliases: ["oracle"], trends: ["cloud"] },
  ADBE: { name: "Adobe", aliases: ["adobe"], trends: ["cloud"] },
  NOW: { name: "ServiceNow", aliases: ["servicenow"], trends: ["cloud"] },
  SNOW: { name: "Snowflake", aliases: ["snowflake"], trends: ["cloud"] },
  DDOG: { name: "Datadog", aliases: ["datadog"], trends: ["cloud"] },
  NET: { name: "Cloudflare", aliases: ["cloudflare"], trends: ["cybersecurity", "cloud"] },
  PANW: { name: "Palo Alto Networks", aliases: ["palo alto"], trends: ["cybersecurity"] },
  CRWD: { name: "CrowdStrike", aliases: ["crowdstrike"], trends: ["cybersecurity"] },
  ZS: { name: "Zscaler", aliases: ["zscaler"], trends: ["cybersecurity"] },
  FTNT: { name: "Fortinet", aliases: ["fortinet"], trends: ["cybersecurity"] },
  OKTA: { name: "Okta", aliases: ["okta"], trends: ["cybersecurity"] },
  S: { name: "SentinelOne", aliases: ["sentinelone", "sentinel one"], trends: ["cybersecurity"] },
  SOFI: { name: "SoFi Technologies", aliases: ["sofi"] },
  HOOD: { name: "Robinhood Markets", aliases: ["robinhood"], trends: ["crypto"] },
  COIN: { name: "Coinbase Global", aliases: ["coinbase"], trends: ["crypto"] },
  MSTR: { name: "MicroStrategy", aliases: ["microstrategy", "strategy inc"], trends: ["crypto"] },
  RIOT: { name: "Riot Platforms", aliases: ["riot platforms"], trends: ["crypto"] },
  MARA: { name: "Marathon Digital", aliases: ["marathon digital", "mara holdings"], trends: ["crypto"] },
  CLSK: { name: "CleanSpark", aliases: ["cleanspark"], trends: ["crypto"] },
  PYPL: { name: "PayPal", aliases: ["paypal"] },
  SQ: { name: "Block", aliases: ["block inc"] },
  RKLB: { name: "Rocket Lab", aliases: ["rocket lab"], trends: ["space"] },
  ASTS: { name: "AST SpaceMobile", aliases: ["ast spacemobile", "ast space"], trends: ["space"] },
  LUNR: { name: "Intuitive Machines", aliases: ["intuitive machines"], trends: ["space"] },
  RDW: { name: "Redwire", aliases: ["redwire"], trends: ["space"] },
  LMT: { name: "Lockheed Martin", aliases: ["lockheed"], trends: ["space"] },
  IONQ: { name: "IonQ", aliases: ["ionq"], trends: ["quantum"] },
  RGTI: { name: "Rigetti Computing", aliases: ["rigetti"], trends: ["quantum"] },
  QBTS: { name: "D-Wave Quantum", aliases: ["d-wave", "d wave"], trends: ["quantum"] },
  QUBT: { name: "Quantum Computing Inc", aliases: ["quantum computing inc"], trends: ["quantum"] },
  IBM: { name: "IBM", aliases: ["ibm"], trends: ["quantum"] },
  COHR: { name: "Coherent", aliases: ["coherent"] },
  SNDK: { name: "SanDisk", aliases: ["sandisk"] },
  DELL: { name: "Dell Technologies", aliases: ["dell"] },
  UBER: { name: "Uber Technologies", aliases: ["uber"] },
  ABNB: { name: "Airbnb", aliases: ["airbnb"] },
  SHOP: { name: "Shopify", aliases: ["shopify"] },
  DIS: { name: "Walt Disney", aliases: ["disney"] },
  BA: { name: "Boeing", aliases: ["boeing"], trends: ["space"] },
  F: { name: "Ford Motor", aliases: ["ford motor"] },
  GM: { name: "General Motors", aliases: ["general motors"] },
  NIO: { name: "NIO", aliases: ["nio inc"], trends: ["ev"] },
  RIVN: { name: "Rivian Automotive", aliases: ["rivian"], trends: ["ev"] },
  LCID: { name: "Lucid Group", aliases: ["lucid motors", "lucid group"], trends: ["ev"] },
  XPEV: { name: "XPeng", aliases: ["xpeng"], trends: ["ev"] },
  LI: { name: "Li Auto", aliases: ["li auto"], trends: ["ev"] },
  ISRG: { name: "Intuitive Surgical", aliases: ["intuitive surgical"], trends: ["robotics"] },
  ROK: { name: "Rockwell Automation", aliases: ["rockwell"], trends: ["robotics"] },
  PATH: { name: "UiPath", aliases: ["uipath"], trends: ["robotics"] },
  SYM: { name: "Symbotic", aliases: ["symbotic"], trends: ["robotics"] },
  ABB: { name: "ABB Ltd", aliases: ["abb ltd"], trends: ["robotics"] },
  JPM: { name: "JPMorgan Chase", aliases: ["jpmorgan", "jp morgan"] },
  BAC: { name: "Bank of America", aliases: ["bank of america"] },
  V: { name: "Visa", aliases: ["visa inc"] },
  MA: { name: "Mastercard", aliases: ["mastercard"] },
  WMT: { name: "Walmart", aliases: ["walmart"] },
  COST: { name: "Costco Wholesale", aliases: ["costco"], trends: ["dividend"] },
  KO: { name: "Coca-Cola", aliases: ["coca-cola", "coca cola"], trends: ["dividend"] },
  PEP: { name: "PepsiCo", aliases: ["pepsi"], trends: ["dividend"] },
  PG: { name: "Procter & Gamble", aliases: ["procter & gamble", "procter and gamble"], trends: ["dividend"] },
  JNJ: { name: "Johnson & Johnson", aliases: ["johnson & johnson", "johnson and johnson"], trends: ["dividend"] },
  MCD: { name: "McDonald's", aliases: ["mcdonald"], trends: ["dividend"] },
  HD: { name: "Home Depot", aliases: ["home depot"], trends: ["dividend"] },
  ABBV: { name: "AbbVie", aliases: ["abbvie"], trends: ["dividend"] },
  O: { name: "Realty Income", aliases: ["realty income"], trends: ["dividend"] },
  LLY: { name: "Eli Lilly", aliases: ["eli lilly"], trends: ["biotech"] },
  NVO: { name: "Novo Nordisk", aliases: ["novo nordisk"], trends: ["biotech"] },
  AMGN: { name: "Amgen", aliases: ["amgen"], trends: ["biotech"] },
  REGN: { name: "Regeneron", aliases: ["regeneron"], trends: ["biotech"] },
  VRTX: { name: "Vertex Pharmaceuticals", aliases: ["vertex pharma"], trends: ["biotech"] },
  MRNA: { name: "Moderna", aliases: ["moderna"], trends: ["biotech"] },
  CRSP: { name: "CRISPR Therapeutics", aliases: ["crispr"], trends: ["biotech"] },
  BNTX: { name: "BioNTech", aliases: ["biontech"], trends: ["biotech"] },
  AMC: { name: "AMC Entertainment", aliases: ["amc entertainment"] },
  GME: { name: "GameStop", aliases: ["gamestop"] },

  // ── Extended theme coverage ──────────────────────────────────────────────
  // Semiconductors
  TXN: { name: "Texas Instruments", aliases: ["texas instruments"], trends: ["semiconductors"] },
  ADI: { name: "Analog Devices", aliases: ["analog devices"], trends: ["semiconductors"] },
  MCHP: { name: "Microchip Technology", aliases: ["microchip technology"], trends: ["semiconductors"] },
  NXPI: { name: "NXP Semiconductors", aliases: ["nxp semi"], trends: ["semiconductors"] },
  ON: { name: "ON Semiconductor", aliases: ["onsemi", "on semiconductor"], trends: ["semiconductors"] },
  SWKS: { name: "Skyworks Solutions", aliases: ["skyworks"], trends: ["semiconductors"] },
  QRVO: { name: "Qorvo", aliases: ["qorvo"], trends: ["semiconductors"] },
  MPWR: { name: "Monolithic Power", aliases: ["monolithic power"], trends: ["semiconductors"] },
  WOLF: { name: "Wolfspeed", aliases: ["wolfspeed"], trends: ["semiconductors"] },
  TER: { name: "Teradyne", aliases: ["teradyne"], trends: ["semiconductors", "robotics"] },
  // AI
  AI: { name: "C3.ai", aliases: ["c3.ai", "c3 ai"], trends: ["ai"] },
  BBAI: { name: "BigBear.ai", aliases: ["bigbear"], trends: ["ai"] },
  SOUN: { name: "SoundHound AI", aliases: ["soundhound"], trends: ["ai"] },
  // Cloud / Software
  MDB: { name: "MongoDB", aliases: ["mongodb"], trends: ["cloud"] },
  TEAM: { name: "Atlassian", aliases: ["atlassian"], trends: ["cloud"] },
  TWLO: { name: "Twilio", aliases: ["twilio"], trends: ["cloud"] },
  ZM: { name: "Zoom Video", aliases: ["zoom video"], trends: ["cloud"] },
  GTLB: { name: "GitLab", aliases: ["gitlab"], trends: ["cloud"] },
  ESTC: { name: "Elastic", aliases: ["elastic nv"], trends: ["cloud"] },
  // Cybersecurity
  CYBR: { name: "CyberArk", aliases: ["cyberark"], trends: ["cybersecurity"] },
  TENB: { name: "Tenable", aliases: ["tenable"], trends: ["cybersecurity"] },
  RPD: { name: "Rapid7", aliases: ["rapid7"], trends: ["cybersecurity"] },
  QLYS: { name: "Qualys", aliases: ["qualys"], trends: ["cybersecurity"] },
  // EV
  CHPT: { name: "ChargePoint", aliases: ["chargepoint"], trends: ["ev"] },
  EVGO: { name: "EVgo", aliases: ["evgo"], trends: ["ev"] },
  BLNK: { name: "Blink Charging", aliases: ["blink charging"], trends: ["ev"] },
  QS: { name: "QuantumScape", aliases: ["quantumscape"], trends: ["ev"] },
  // Space & Aerospace
  VSAT: { name: "Viasat", aliases: ["viasat"], trends: ["space"] },
  IRDM: { name: "Iridium Communications", aliases: ["iridium"], trends: ["space"] },
  PL: { name: "Planet Labs", aliases: ["planet labs"], trends: ["space"] },
  KTOS: { name: "Kratos Defense", aliases: ["kratos"], trends: ["space"] },
  NOC: { name: "Northrop Grumman", aliases: ["northrop"], trends: ["space"] },
  RTX: { name: "RTX Corp", aliases: ["raytheon", "rtx corp"], trends: ["space"] },
  GD: { name: "General Dynamics", aliases: ["general dynamics"], trends: ["space"] },
  HEI: { name: "Heico", aliases: ["heico"], trends: ["space"] },
  // Quantum
  ARQQ: { name: "Arqit Quantum", aliases: ["arqit"], trends: ["quantum"] },
  LAES: { name: "SEALSQ", aliases: ["sealsq"], trends: ["quantum"] },
  // Crypto / Blockchain
  BITF: { name: "Bitfarms", aliases: ["bitfarms"], trends: ["crypto"] },
  HUT: { name: "Hut 8", aliases: ["hut 8"], trends: ["crypto"] },
  WULF: { name: "TeraWulf", aliases: ["terawulf"], trends: ["crypto"] },
  CIFR: { name: "Cipher Mining", aliases: ["cipher mining"], trends: ["crypto"] },
  BTBT: { name: "Bit Digital", aliases: ["bit digital"], trends: ["crypto"] },
  GLXY: { name: "Galaxy Digital", aliases: ["galaxy digital"], trends: ["crypto"] },
  // Robotics & Automation
  IRBT: { name: "iRobot", aliases: ["irobot"], trends: ["robotics"] },
  ZBRA: { name: "Zebra Technologies", aliases: ["zebra tech"], trends: ["robotics"] },
  SERV: { name: "Serve Robotics", aliases: ["serve robotics"], trends: ["robotics"] },
  // Biotech & GLP-1
  GILD: { name: "Gilead Sciences", aliases: ["gilead"], trends: ["biotech"] },
  BIIB: { name: "Biogen", aliases: ["biogen"], trends: ["biotech"] },
  NTLA: { name: "Intellia Therapeutics", aliases: ["intellia"], trends: ["biotech"] },
  BEAM: { name: "Beam Therapeutics", aliases: ["beam therapeutics"], trends: ["biotech"] },
  RXRX: { name: "Recursion Pharma", aliases: ["recursion"], trends: ["biotech"] },
  PFE: { name: "Pfizer", aliases: ["pfizer"], trends: ["biotech"] },
  // Dividend & Blue-chip
  T: { name: "AT&T", aliases: ["at&t", "at and t"], trends: ["dividend"] },
  VZ: { name: "Verizon", aliases: ["verizon"], trends: ["dividend"] },
  XOM: { name: "Exxon Mobil", aliases: ["exxon"], trends: ["dividend"] },
  CVX: { name: "Chevron", aliases: ["chevron"], trends: ["dividend"] },
  CAT: { name: "Caterpillar", aliases: ["caterpillar"], trends: ["dividend"] },
  HON: { name: "Honeywell", aliases: ["honeywell"], trends: ["dividend"] },

  // ── Index-tracking ETFs ("Index funds") ──────────────────────────────────
  SPY: { name: "SPDR S&P 500 ETF", aliases: ["spdr s&p"], type: "index" },
  VOO: { name: "Vanguard S&P 500 ETF", aliases: ["vanguard s&p", "vanguard 500"], type: "index" },
  IVV: { name: "iShares Core S&P 500 ETF", aliases: ["ishares core s&p", "ishares s&p 500"], type: "index" },
  QQQ: { name: "Invesco QQQ (Nasdaq-100)", aliases: ["nasdaq 100", "invesco qqq"], type: "index" },
  VTI: { name: "Vanguard Total Stock Market ETF", aliases: ["vanguard total stock", "total stock market"], type: "index" },
  DIA: { name: "SPDR Dow Jones ETF", aliases: ["dow jones etf"], type: "index" },
  IWM: { name: "iShares Russell 2000 ETF", aliases: ["russell 2000"], type: "index" },
  SCHD: { name: "Schwab US Dividend Equity ETF", aliases: ["schwab dividend"], type: "index", trends: ["dividend"] },
  VUG: { name: "Vanguard Growth ETF", aliases: ["vanguard growth"], type: "index" },
  VTV: { name: "Vanguard Value ETF", aliases: ["vanguard value"], type: "index" },

  // ── Thematic / sector ETFs ────────────────────────────────────────────────
  ARKK: { name: "ARK Innovation ETF", aliases: ["ark innovation", "cathie wood"], type: "etf" },
  SMH: { name: "VanEck Semiconductor ETF", aliases: ["vaneck semiconductor"], type: "etf", trends: ["semiconductors"] },
  SOXX: { name: "iShares Semiconductor ETF", aliases: ["ishares semiconductor"], type: "etf", trends: ["semiconductors"] },
  XLK: { name: "Technology Select Sector SPDR", aliases: ["technology select"], type: "etf" },
  XLV: { name: "Health Care Select Sector SPDR", aliases: ["health care select", "healthcare select"], type: "etf" },
  XLE: { name: "Energy Select Sector SPDR", aliases: ["energy select"], type: "etf" },
  TQQQ: { name: "ProShares UltraPro QQQ (3x)", aliases: ["tqqq", "3x nasdaq"], type: "etf" },
  SOXL: { name: "Direxion Semiconductor Bull 3x", aliases: ["semiconductor bull"], type: "etf", trends: ["semiconductors"] },
  IBIT: { name: "iShares Bitcoin Trust", aliases: ["ishares bitcoin"], type: "etf", trends: ["crypto"] },
  ICLN: { name: "iShares Global Clean Energy ETF", aliases: ["clean energy etf"], type: "etf" },
  TAN: { name: "Invesco Solar ETF", aliases: ["invesco solar", "solar etf"], type: "etf" },
};

const TICKER_SET = new Set(Object.keys(KNOWN));

// Uppercase words that look like tickers but usually aren't, in finance talk.
const STOPWORDS = new Set([
  "A", "I", "AI", "AN", "AND", "ALL", "API", "ATH", "BUY", "CAT", "CEO", "CFO",
  "COO", "CPI", "DD", "DIA", "EPS", "ETF", "EU", "EV", "FED", "FOMO", "FOR",
  "GDP", "HD", "HOLD", "HOW", "IPO", "IT", "ITM", "LI", "NEW", "NOW", "OK",
  "ON", "OTM", "PE", "PEG", "PG", "PL", "PR", "Q1", "Q2", "Q3", "Q4", "ROI",
  "SEC", "SELL", "TAN", "TEAM", "THE", "TOP", "TV", "UK", "US", "USA", "USD",
  "WHY", "YOLO", "YOY", "YT",
]);

// Longest aliases first so "advanced micro" wins before any shorter substring.
const NAME_INDEX: { needle: string; ticker: string }[] = Object.entries(KNOWN)
  .flatMap(([ticker, { aliases }]) => aliases.map((needle) => ({ needle, ticker })))
  .sort((a, b) => b.needle.length - a.needle.length);

/** Extract tickers from free text. Returns de-duped uppercase symbols. */
export function extractTickers(text: string): string[] {
  const found = new Set<string>();

  // 1) Explicit cashtags ($NVDA) — highest confidence, kept even if not in KNOWN.
  for (const m of text.matchAll(/\$([A-Za-z]{1,5})\b/g)) {
    found.add(m[1].toUpperCase());
  }

  // 2) Bare uppercase tokens — only if they're a known ticker (avoids noise).
  for (const m of text.matchAll(/\b([A-Z]{2,5})\b/g)) {
    const t = m[1];
    if (TICKER_SET.has(t) && !STOPWORDS.has(t)) found.add(t);
  }

  // 3) Company names ("Micron", "Palantir") → ticker.
  const lower = text.toLowerCase();
  for (const { needle, ticker } of NAME_INDEX) {
    if (lower.includes(needle)) found.add(ticker);
  }

  return [...found];
}

// Source detection: first matching rule wins (Video.source holds one source).
const SOURCE_RULES: { pattern: RegExp; source: Source }[] = [
  { pattern: /bloomberg/i, source: { name: "Bloomberg", url: "https://www.bloomberg.com" } },
  { pattern: /reuters/i, source: { name: "Reuters", url: "https://www.reuters.com" } },
  { pattern: /\bcnbc\b/i, source: { name: "CNBC", url: "https://www.cnbc.com" } },
  { pattern: /wall street journal|\bwsj\b/i, source: { name: "The Wall Street Journal", url: "https://www.wsj.com" } },
  { pattern: /the information/i, source: { name: "The Information", url: "https://www.theinformation.com" } },
  { pattern: /financial times|\bft\.com\b/i, source: { name: "Financial Times", url: "https://www.ft.com" } },
  { pattern: /earnings call|earnings report|quarterly (results|earnings)|reported earnings/i, source: { name: "Earnings call" } },
  { pattern: /10-?q|10-?k|8-?k|sec filing|annual report/i, source: { name: "SEC filing", url: "https://www.sec.gov/edgar/search/" } },
  { pattern: /morgan stanley/i, source: { name: "Morgan Stanley note" } },
  { pattern: /goldman sachs|\bgoldman\b/i, source: { name: "Goldman Sachs note" } },
  { pattern: /jp ?morgan|jpmorgan/i, source: { name: "JPMorgan note" } },
  { pattern: /press release/i, source: { name: "Company press release" } },
];

/** Detect a single cited source in the text, if any. */
export function extractSource(text: string): Source | undefined {
  for (const rule of SOURCE_RULES) {
    if (rule.pattern.test(text)) return rule.source;
  }
  return undefined;
}
