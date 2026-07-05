import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { config } from "../config.js";

export const alphaVantageQuery = betaZodTool({
  name: "alphavantage_query",
  description:
    "Call the Alpha Vantage API directly for market data, FX rates, or economic indicators " +
    '(e.g. function=REAL_GDP, function=TREASURY_YIELD, function=CPI, function=FX_DAILY). ' +
    "Returns real, dated data only.",
  inputSchema: z.object({
    function_name: z
      .string()
      .describe(
        'Alpha Vantage "function" parameter, e.g. "REAL_GDP", "TREASURY_YIELD", "CPI", "FEDERAL_FUNDS_RATE", "FX_DAILY"',
      ),
    extra_params: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        'Any additional query params the function needs, e.g. {"interval": "quarterly"} or {"from_symbol": "EUR", "to_symbol": "USD"}',
      ),
  }),
  run: async ({ function_name, extra_params }) => {
    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", function_name);
    url.searchParams.set("apikey", config.alphaVantageApiKey);
    for (const [k, v] of Object.entries(extra_params ?? {})) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url);
    if (!res.ok) {
      return `Alpha Vantage API error ${res.status} for function ${function_name}: ${await res.text()}`;
    }
    const data = await res.json();
    if (data["Error Message"] || data["Note"] || data["Information"]) {
      return `Alpha Vantage returned no usable data: ${JSON.stringify(data)}`;
    }
    return JSON.stringify({
      source: "Alpha Vantage",
      function: function_name,
      retrieved_at: new Date().toISOString(),
      data,
    });
  },
});
