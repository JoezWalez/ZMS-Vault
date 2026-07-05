import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { config } from "../config.js";

export const fredGetSeries = betaZodTool({
  name: "fred_get_series",
  description:
    "Fetch real observations for a FRED (Federal Reserve Economic Data) series, e.g. GDP, UNRATE, CPIAUCSL, FEDFUNDS, DGS10. Returns actual dated data points, never estimates.",
  inputSchema: z.object({
    series_id: z
      .string()
      .describe('FRED series ID, e.g. "GDP", "UNRATE", "CPIAUCSL", "FEDFUNDS"'),
    observation_start: z
      .string()
      .optional()
      .describe("YYYY-MM-DD, earliest observation to return"),
    observation_end: z
      .string()
      .optional()
      .describe("YYYY-MM-DD, latest observation to return"),
    frequency: z
      .enum(["d", "w", "bw", "m", "q", "sa", "a"])
      .optional()
      .describe("Optional resampling frequency"),
  }),
  run: async ({ series_id, observation_start, observation_end, frequency }) => {
    const url = new URL("https://api.stlouisfed.org/fred/series/observations");
    url.searchParams.set("series_id", series_id);
    url.searchParams.set("api_key", config.fredApiKey);
    url.searchParams.set("file_type", "json");
    if (observation_start) url.searchParams.set("observation_start", observation_start);
    if (observation_end) url.searchParams.set("observation_end", observation_end);
    if (frequency) url.searchParams.set("frequency", frequency);

    const res = await fetch(url);
    if (!res.ok) {
      return `FRED API error ${res.status} for series ${series_id}: ${await res.text()}`;
    }
    const data = await res.json();
    return JSON.stringify({
      source: "FRED",
      series_id,
      retrieved_at: new Date().toISOString(),
      observations: data.observations,
    });
  },
});
