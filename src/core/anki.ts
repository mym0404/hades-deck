import type { RankedCandidate } from "./model.js";

type AnkiRow = {
  Front: string;
  Back: string;
};

export const buildBatchRows = (candidates: RankedCandidate[]) =>
  candidates.map((candidate) => ({
    headword: candidate.headword,
    type: candidate.type,
    lemma: candidate.lemma,
    source_clause: candidate.sourceClause,
    source_sentence: candidate.sourceSentence,
    speaker: candidate.speaker,
    section: candidate.section,
  }));

export const buildLlmPrompt = (candidates: RankedCandidate[]) => {
  const serializedRows = buildBatchRows(candidates)
    .map(
      (row, index) =>
        `${index + 1}. headword=${row.headword} | type=${row.type} | clause=${row.source_clause} | sentence=${row.source_sentence} | speaker=${row.speaker} | section=${row.section}`,
    )
    .join("\n");

  return `You are an Anki card designer specialized in teaching English vocabulary to native Korean speakers.

Return ONLY valid CSV with the exact header:
Front,Back

CSV rules:
- Each row is one card.
- Front must be exactly one line.
- Back must contain exactly 5 lines inside a single CSV cell.
- Use the provided source clause first. If it is too short or unclear, use the source sentence.
- Surround the headword with [[ ]] in Front.
- Keep the original meaning precise and natural for Korean learners.
- Do not add any columns other than Front and Back.

Cards to generate:
${serializedRows}`;
};

export const validateAnkiRows = (rows: Record<string, string>[]) => {
  const issues: string[] = [];

  if (rows.length === 0) {
    issues.push("CSV is empty.");
    return issues;
  }

  for (const [index, row] of rows.entries()) {
    const keys = Object.keys(row);

    if (keys.length !== 2 || keys[0] !== "Front" || keys[1] !== "Back") {
      issues.push(`Row ${index + 2}: expected only Front and Back columns.`);
      continue;
    }

    if (!row.Front?.trim()) {
      issues.push(`Row ${index + 2}: Front is empty.`);
    }

    if (!row.Back?.trim()) {
      issues.push(`Row ${index + 2}: Back is empty.`);
    }

    if (row.Front.includes("\n")) {
      issues.push(`Row ${index + 2}: Front must be a single line.`);
    }

    if (!row.Front.includes("[[") || !row.Front.includes("]]")) {
      issues.push(`Row ${index + 2}: Front must include [[headword]].`);
    }

    const backLines = row.Back.split(/\r?\n/);

    if (backLines.length !== 5) {
      issues.push(`Row ${index + 2}: Back must contain exactly 5 lines.`);
    }
  }

  return issues;
};

export type { AnkiRow };
