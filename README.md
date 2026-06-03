# YouTubeTrades

A stock-hype dashboard that ranks tickers by **what finance YouTubers are actually talking about this week**. It scrapes a configurable set of finance creators, reads their recent videos (titles, descriptions, and spoken transcripts), extracts the stocks they mention, attaches live prices, and ranks everything by aggregate view count — all in a dark, YouTube-red UI.

> 100% live data. Every stock on the board traces back to a real video; click a row to see which videos drove it and which mentions came from the spoken transcript.

---

## Features

- **YouTube-driven leaderboard** — stocks ranked by total views of the videos mentioning them.
- **Manage tracked YouTubers** — add any channel by `@handle` or URL, **remove** it, or **pause/enable** it with a click. Your list is saved in the browser (localStorage) and survives restarts. A **Reset** button restores the defaults.
- **Price range filter** — a dual-handle slider spanning **$0–$10,000**.
- **Quick-filter categories** — `Low cost` / `Medium` / `Expensive` price presets, plus **ETFs** and **Index funds**.
- **Trends dropdown** — filter the board to an investment theme (AI, Semiconductors, Quantum, Cybersecurity, Cloud, EV, Space, Biotech/GLP-1, Dividend, Robotics, Crypto).
- **Sort toggle** — rank by **Hype** (aggregate views) or **Price move** (daily % change).
- **Source attribution** — videos that cite a source (Bloomberg, an earnings call, an SEC filing, etc.) show a "via …" chip.
- **🎙 transcript marker** — flags mentions that came from the spoken transcript rather than just the title/description.
- **Per-stock trend blurb** — a one-line note blending price move + buzz.
- **Refresh** — re-pull the latest (results are cached ~30 min between pulls).

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **YouTube Data API v3** — channel video lists + view counts
- **yt-dlp** (primary) / **youtubei.js** (fallback) — video transcripts (keyless)
- **Finnhub** — live quotes
- Rules-based ticker & source extraction (no LLM)

---

## How it works

```
app/api/stocks/route.ts        orchestrates everything, caches per channel (30 min)
  ├─ lib/youtube.ts            YouTube Data API: recent uploads + view counts per channel
  ├─ lib/transcript.ts         transcripts: yt-dlp → youtubei.js, cached to disk by video id
  ├─ lib/extract.ts            rules: $CASHTAGS + ~115 known tickers + company names;
  │                            cited-source detection; trend/ETF classification (KNOWN, TRENDS)
  ├─ lib/finnhub.ts            live quotes (cached 10 min to respect the free 60/min limit)
  └─ lib/aggregate.ts          groups videos by ticker → Stock[] with type/trends attached

app/page.tsx                   client UI: tracked channels, filters, sort, fetches /api/stocks
components/                    Header, FilterBar, CategoryFilter, ChannelManager,
                               PriceRangeSlider, StockList, StockRow, Sparkline, VideoList …
```

**Pipeline per request:** for each enabled channel → fetch its recent uploads (titles/descriptions/views) → fetch transcripts for the most recent few videos → extract tickers and sources from the text → fetch live prices → group by ticker, rank by views, classify by trend → return JSON the UI renders.

To keep it fast and within rate limits, the route bounds concurrency (≈4 channels at once), reads many videos by title/description but only transcribes the most recent few, caches transcripts to disk, and caches Finnhub quotes.

---

## Getting started

### Prerequisites

- **Node.js 18+** and **npm**
- **yt-dlp** (for transcripts) — on Windows: `winget install yt-dlp.yt-dlp`
  (without it, youtubei.js is used as a fallback, and extraction still works from titles/descriptions)
- A **YouTube Data API v3** key and a **Finnhub** key (both free — see below)

### 1. Install

```bash
npm install
```

### 2. Add your API keys

Copy the example env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

```ini
# .env.local
YOUTUBE_API_KEY=AIza...        # Google Cloud Console → APIs & Services → Credentials
FINNHUB_API_KEY=...            # https://finnhub.io → free sign-up → dashboard

# Optional: override the tracked channels (comma-separated @handles).
# Leave blank to use the built-in finance-creator defaults.
YOUTUBE_CHANNELS=@MeetKevin,@GrahamStephan,@AndreiJikh
```

**Get a YouTube Data API key** (free, no billing needed):
1. https://console.cloud.google.com/ → create a project.
2. Enable **YouTube Data API v3** (APIs & Services → Library).
3. APIs & Services → Credentials → **Create credentials → API key**.

**Get a Finnhub key** (free, no card): sign up at https://finnhub.io and copy the key from your dashboard.

> `.env.local` is gitignored — your keys stay on your machine.

### 3. Run

```bash
npm run dev      # http://localhost:3000
```

The first load scrapes your tracked channels (~15–30s with a loading skeleton), then caches the results. Subsequent loads — and even server restarts — are fast.

```bash
npm run build    # production build (also full type-check)
npm run start    # serve the production build
```

---

## Configuration

- **Tracked channels** — manage them right in the app (add / remove / pause), or set defaults via `YOUTUBE_CHANNELS` in `.env.local`, or edit the seed list in `lib/channels.ts`.
- **Recognized tickers & trends** — extend the `KNOWN` map and `TRENDS` list in `lib/extract.ts` to cover more stocks/themes.
- **Scrape depth & limits** — tune `MAX_VIDEOS_PER_CHANNEL` / `TRANSCRIBE_RECENT` / `CHANNEL_CONCURRENCY` in `app/api/stocks/route.ts`, and `MAX_STOCKS` / `PRICE_TOP` in `lib/aggregate.ts`.

---

## Known limitations

- **Transcripts need a residential IP.** YouTube blocks transcript scraping from datacenter/CI IPs, so transcripts only work when the app runs on a normal home/office connection (e.g. your own machine).
- **Category coverage reflects reality.** A trend filter only shows stocks the tracked creators actually mentioned. Popular themes (AI, semiconductors, cloud) fill out well; niche themes (EV, biotech, crypto) can be sparse with general-finance channels — add a channel focused on that theme to populate it.
- **Finnhub free tier** is rate-limited (60 calls/min) and its quotes can be delayed; the board prices the top ~60 tickers and shows others as "—".
- **Channel handles must be exact** (`@handle`). A wrong handle simply returns nothing (no crash) — fix it in the app or `lib/channels.ts`.
- Some default channel handles are best-guesses and may need correcting.

---

## Project status

This is a personal/demo project, not financial advice. Prices and mentions are informational only.
