import type { DialogueLine } from "./model.js";
import { cleanDialogueText, tokenize } from "./text.js";

const SECTION_REGEX = /^---\s*(.+?)\s*---$/;
const SPEAKER_REGEX = /^([A-Za-z][A-Za-z' -]+):\s*(.+)$/;

export const parseDialogue = (raw: string) => {
  const lines = raw.split(/\r?\n/);
  const parsed: DialogueLine[] = [];
  let section = "Unknown";

  for (const [index, line] of lines.entries()) {
    const sectionMatch = line.match(SECTION_REGEX);

    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    const speakerMatch = line.match(SPEAKER_REGEX);

    if (!speakerMatch) {
      continue;
    }

    const speaker = speakerMatch[1].trim();
    const text = cleanDialogueText(speakerMatch[2]);

    if (text.length === 0) {
      continue;
    }

    parsed.push({
      id: `${index + 1}:${speaker}`,
      lineNumber: index + 1,
      section,
      speaker,
      rawText: speakerMatch[2],
      text,
      tokens: tokenize(text),
    });
  }

  return parsed;
};
