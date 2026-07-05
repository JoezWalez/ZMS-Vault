# Macro Agent

Ask an economics question, get a fact-checked report saved as a plain Markdown
note in your `Macro Reports` folder (right alongside your other vault notes).

## How it works

1. **Researcher** — a Claude agent acting as an economist. It pulls real data
   from FRED, Alpha Vantage, and Financial Modeling Prep, runs any
   correlations/regressions itself (via code execution), and writes a report.
2. **Fact-checker** — a second, independent Claude agent that re-fetches every
   number itself and checks it against the draft. It is specifically told to
   treat any placeholder or made-up number as a critical failure.
3. If the fact-checker finds problems, the researcher gets one or two chances
   to fix them. If it still fails, the report is saved anyway but with a
   large warning banner at the top — it's never silently presented as good.

## One-time setup

1. Install [Bun](https://bun.sh) if you don't have it: `curl -fsSL https://bun.sh/install | bash`
2. From this folder, run: `bun install`
3. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
4. Open `.env` and fill in your keys:
   - `FRED_API_KEY` — free, from https://fred.stlouisfed.org/docs/api/api_key.html
   - `ALPHAVANTAGE_API_KEY` — free, from https://www.alphavantage.co/support/#api-key
   - `FMP_API_KEY` — from https://site.financialmodelingprep.com/developer/docs
   - `ANTHROPIC_API_KEY` — only needed if you haven't already logged in with
     `ant auth login` on this machine. Get one at https://platform.claude.com.
5. Never commit `.env` or paste its contents anywhere — it's already excluded
   via `.gitignore`.

## Running it

```
bun run ask "How has the labor market affected GDP growth this year?"
```

The report shows up as a new file in `Macro Reports/` a few minutes later.
Each run costs a few cents to a few dollars in API usage depending on how much
research and fact-checking it takes.
