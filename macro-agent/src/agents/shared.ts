import { fredGetSeries } from "../tools/fred.js";
import { alphaVantageQuery } from "../tools/alphavantage.js";
import { fmpQuery } from "../tools/fmp.js";

// Server-side tools: Anthropic executes these, no code on our end.
export const serverTools = [
  { type: "web_search_20260209", name: "web_search" },
  { type: "web_fetch_20260209", name: "web_fetch" },
  { type: "code_execution_20260521", name: "code_execution" },
] as const;

// Custom tools: real, live data sources. Every agent gets the same three.
export const dataTools = [fredGetSeries, alphaVantageQuery, fmpQuery];

export const DATA_INTEGRITY_RULES = `
STRICT DATA INTEGRITY RULES — these are non-negotiable and override any instinct to be "helpful" by filling gaps:
- Every number you report must come from an actual tool call result you made in this conversation. Never invent, estimate, extrapolate, or use illustrative/example/placeholder numbers and present them as if they were real.
- If you cannot retrieve real data for something, say so explicitly ("data unavailable for X") instead of substituting a plausible-sounding number.
- If you use code execution to compute a derived figure (a correlation, a regression coefficient, a growth rate), the inputs to that computation must themselves be real data you fetched via a tool — never synthetic/sample data, even as a placeholder while you figure out the real query.
- Any hypothetical or illustrative scenario must be clearly labeled "HYPOTHETICAL" and never mixed into the same table or sentence as real observed figures.
- Cite every figure with its source (FRED series ID, Alpha Vantage function, or FMP endpoint) and the retrieval timestamp returned by the tool.
- If a tool call fails or returns an error, report the failure — do not silently work around it with an estimate.
`.trim();
