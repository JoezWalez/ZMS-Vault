import { runAgent } from "./runAgent.js";
import {
  RESEARCHER_MODEL,
  RESEARCHER_SYSTEM_PROMPT,
  researcherTools,
} from "./agents/researcher.js";
import {
  FACT_CHECKER_MODEL,
  FACT_CHECKER_SYSTEM_PROMPT,
  factCheckerTools,
} from "./agents/factChecker.js";

const MAX_REVISION_ROUNDS = 2;

export interface PipelineResult {
  passed: boolean;
  report: string;
  factCheckNotes: string;
}

export async function runMacroPipeline(question: string): Promise<PipelineResult> {
  let draft = await runAgent({
    model: RESEARCHER_MODEL,
    system: RESEARCHER_SYSTEM_PROMPT,
    tools: researcherTools,
    userMessage: question,
  });

  let lastFactCheck = "";

  for (let round = 0; round <= MAX_REVISION_ROUNDS; round++) {
    lastFactCheck = await runAgent({
      model: FACT_CHECKER_MODEL,
      system: FACT_CHECKER_SYSTEM_PROMPT,
      tools: factCheckerTools,
      userMessage:
        `Original request from the user:\n${question}\n\n` +
        `Draft report to fact-check:\n---\n${draft}\n---`,
    });

    const passed = /VERDICT:\s*PASS/i.test(lastFactCheck);
    if (passed) {
      return { passed: true, report: draft, factCheckNotes: lastFactCheck };
    }

    if (round === MAX_REVISION_ROUNDS) {
      // Give up revising — ship the draft, but make the failure impossible to miss.
      return { passed: false, report: draft, factCheckNotes: lastFactCheck };
    }

    draft = await runAgent({
      model: RESEARCHER_MODEL,
      system: RESEARCHER_SYSTEM_PROMPT,
      tools: researcherTools,
      userMessage:
        `Original request from the user:\n${question}\n\n` +
        `Your previous draft:\n---\n${draft}\n---\n\n` +
        `A fact-checker reviewed it and found problems. Fix every one of them, ` +
        `re-verifying corrected figures against the tools yourself:\n---\n${lastFactCheck}\n---`,
    });
  }

  // Unreachable, but keeps TypeScript happy.
  return { passed: false, report: draft, factCheckNotes: lastFactCheck };
}
