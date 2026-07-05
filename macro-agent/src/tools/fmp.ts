import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { config } from "../config.js";

export const fmpQuery = betaZodTool({
  name: "fmp_query",
  description:
    "Call the Financial Modeling Prep (FMP) API for company financials, market data, " +
    "the economic calendar, or Treasury rates. Pass the exact FMP endpoint path " +
    '(e.g. "economic-calendar", "treasury-rates", "quote/AAPL", "historical-price-eod/full").',
  inputSchema: z.object({
    endpoint_path: z
      .string()
      .describe(
        'FMP v3/stable endpoint path, without leading slash, e.g. "treasury-rates" or "quote/SPY"',
      ),
    extra_params: z
      .record(z.string(), z.string())
      .optional()
      .describe('Additional query params, e.g. {"symbol": "AAPL", "from": "2024-01-01"}'),
  }),
  run: async ({ endpoint_path, extra_params }) => {
    const url = new URL(`https://financialmodelingprep.com/stable/${endpoint_path}`);
    url.searchParams.set("apikey", config.fmpApiKey);
    for (const [k, v] of Object.entries(extra_params ?? {})) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url);
    if (!res.ok) {
      return `FMP API error ${res.status} for endpoint ${endpoint_path}: ${await res.text()}`;
    }
    const data = await res.json();
    return JSON.stringify({
      source: "Financial Modeling Prep",
      endpoint: endpoint_path,
      retrieved_at: new Date().toISOString(),
      data,
    });
  },
});
