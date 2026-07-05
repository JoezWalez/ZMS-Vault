import "./config.js"; // validates FRED/AlphaVantage/FMP keys are present, exits with a clear message if not
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runMacroPipeline } from "./pipeline.js";

const question = process.argv.slice(2).join(" ").trim();

if (!question) {
  console.error('Usage: bun run ask "your macro question"');
  process.exit(1);
}

const REPORTS_DIR = join(import.meta.dirname, "..", "..", "Macro Reports");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function main() {
  console.log(`Researching: ${question}\n(this can take a few minutes)\n`);

  const result = await runMacroPipeline(question);

  mkdirSync(REPORTS_DIR, { recursive: true });
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${timestamp} - ${slugify(question)}.md`;
  const filePath = join(REPORTS_DIR, filename);

  const header = result.passed
    ? `<!-- Fact-checked: PASS -->\n`
    : `> **⚠️ FACT-CHECK FAILED — do not treat the figures below as verified.**\n>\n` +
      `> Issues found:\n>\n` +
      result.factCheckNotes
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n") +
      `\n\n---\n\n`;

  const content = `# ${question}\n\n${header}${result.report}\n`;

  writeFileSync(filePath, content, "utf-8");

  console.log(result.passed ? "Fact-check passed." : "Fact-check FAILED — see warning in the file.");
  console.log(`Report saved to: ${filePath}`);
}

main().catch((err) => {
  console.error("Something went wrong:", err);
  process.exit(1);
});
