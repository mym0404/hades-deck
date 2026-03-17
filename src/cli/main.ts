#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { Command } from "commander";

import { buildBatchRows, buildLlmPrompt, validateAnkiRows } from "../core/anki.js";
import { rankDialogue, sampleDialogue } from "../core/analyzer.js";
import { DEFAULT_DIALOGUE_URL, MAX_DEFAULT_CANDIDATES } from "../data/constants.js";
import { fromCsv, toCsv } from "../lib/csv.js";
import { loadSourceText } from "../lib/load-source.js";

const program = new Command();

const ensureParentDirectory = async (path: string) => {
  await mkdir(dirname(path), { recursive: true });
};

program
  .name("hades-anki")
  .description("Rank Hades dialogue vocabulary for Anki card generation.");

program
  .command("rank")
  .option("-i, --input <pathOrUrl>", "Dialogue source path or URL", DEFAULT_DIALOGUE_URL)
  .option("-o, --output <path>", "Output CSV path", "out/ranked-candidates.csv")
  .option("-l, --limit <number>", "Number of candidates", `${MAX_DEFAULT_CANDIDATES}`)
  .action(async ({ input, output, limit }) => {
    const raw = await loadSourceText(input);
    const ranked = rankDialogue({
      raw,
      limit: Number(limit),
    }).map((candidate) => ({
      headword: candidate.headword,
      type: candidate.type,
      lemma: candidate.lemma,
      total_score: candidate.totalScore,
      reason_flags: candidate.reasonFlags.join("|"),
      corpus_freq: candidate.corpusFreq,
      general_freq_rank: candidate.generalFreqRank,
      cefr_levels: candidate.cefrLevels.join("|"),
      source_sentence: candidate.sourceSentence,
      source_clause: candidate.sourceClause,
      speaker: candidate.speaker,
      section: candidate.section,
    }));

    await ensureParentDirectory(output);
    await writeFile(output, toCsv(ranked), "utf8");
    console.log(`Wrote ${ranked.length} ranked candidates to ${output}`);
  });

program
  .command("sample")
  .requiredOption("-t, --text <text>", "Dialogue line or short snippet")
  .option("-o, --output <path>", "Optional output CSV path")
  .option("-m, --max-items <number>", "Maximum sample candidates", "4")
  .action(async ({ text, output, maxItems }) => {
    const candidates = sampleDialogue({
      text,
      maxItems: Number(maxItems),
    }).map((candidate) => ({
      headword: candidate.headword,
      type: candidate.type,
      lemma: candidate.lemma,
      total_score: candidate.totalScore,
      reason_flags: candidate.reasonFlags.join("|"),
      corpus_freq: candidate.corpusFreq,
      source_clause: candidate.sourceClause,
      speaker: candidate.speaker,
      section: candidate.section,
    }));

    if (output) {
      await ensureParentDirectory(output);
      await writeFile(output, toCsv(candidates), "utf8");
      console.log(`Wrote ${candidates.length} sample candidates to ${output}`);
      return;
    }

    console.log(toCsv(candidates).trim());
  });

program
  .command("prepare-llm")
  .requiredOption("-i, --input <path>", "Reviewed candidate CSV path")
  .option("-o, --output <path>", "Batch CSV path", "out/anki-llm-input.csv")
  .option("-p, --prompt-output <path>", "Prompt file path", "out/anki-batch-prompt.txt")
  .option("-l, --limit <number>", "Optional top-N subset")
  .action(async ({ input, output, promptOutput, limit }) => {
    const content = await readFile(input, "utf8");
    const rows = fromCsv<Record<string, string>>(content);
    const selectedRows = rows.slice(0, limit ? Number(limit) : rows.length);
    const candidates = selectedRows.map((row) => ({
      headword: row.headword,
      type: (row.type as "word" | "phrase") ?? "word",
      lemma: row.lemma,
      totalScore: Number(row.total_score ?? 0),
      reasonFlags: (row.reason_flags ?? "").split("|").filter(Boolean),
      corpusFreq: Number(row.corpus_freq ?? 0),
      generalFreqRank: Number(row.general_freq_rank ?? -1),
      cefrLevels: (row.cefr_levels ?? "").split("|").filter(Boolean),
      sourceSentence: row.source_sentence,
      sourceClause: row.source_clause,
      speaker: row.speaker,
      section: row.section,
    }));

    await ensureParentDirectory(output);
    await ensureParentDirectory(promptOutput);
    await writeFile(output, toCsv(buildBatchRows(candidates)), "utf8");
    await writeFile(promptOutput, buildLlmPrompt(candidates), "utf8");
    console.log(`Prepared ${candidates.length} candidates for LLM batching.`);
  });

program
  .command("validate-anki")
  .requiredOption("-i, --input <path>", "Anki CSV path")
  .action(async ({ input }) => {
    const content = await readFile(input, "utf8");
    const rows = fromCsv<Record<string, string>>(content);
    const issues = validateAnkiRows(rows);

    if (issues.length > 0) {
      for (const issue of issues) {
        console.error(issue);
      }

      process.exitCode = 1;
      return;
    }

    console.log(`Validated ${rows.length} Anki rows.`);
  });

await program.parseAsync(process.argv);
