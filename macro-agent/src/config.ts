import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Missing ${name}. Copy .env.example to .env and fill in your keys, then try again.`,
    );
    process.exit(1);
  }
  return value;
}

export const config = {
  fredApiKey: required("FRED_API_KEY"),
  alphaVantageApiKey: required("ALPHAVANTAGE_API_KEY"),
  fmpApiKey: required("FMP_API_KEY"),
};
