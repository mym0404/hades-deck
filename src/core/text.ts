import type { Token } from "./model.js";

const TOKEN_REGEX = /[A-Za-z]+(?:'[A-Za-z]+)*/g;
const CLAUSE_BOUNDARY_REGEX = /[,:;.!?]/;

export const cleanDialogueText = (text: string) =>
  text
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

export const tokenize = (text: string): Token[] =>
  Array.from(text.matchAll(TOKEN_REGEX)).map((match) => ({
    raw: match[0],
    normalized: match[0].toLowerCase(),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));

export const countWords = (text: string) => tokenize(text).length;

export const extractClause = ({
  text,
  start,
  end,
}: {
  text: string;
  start: number;
  end: number;
}) => {
  let left = start;
  let right = end;

  while (left > 0) {
    if (CLAUSE_BOUNDARY_REGEX.test(text[left - 1] ?? "")) {
      break;
    }

    left -= 1;
  }

  while (right < text.length) {
    if (CLAUSE_BOUNDARY_REGEX.test(text[right] ?? "")) {
      break;
    }

    right += 1;
  }

  const clause = text.slice(left, right).trim();

  if (clause.length <= 160) {
    return clause;
  }

  const windowStart = Math.max(0, start - 60);
  const windowEnd = Math.min(text.length, end + 60);

  return text.slice(windowStart, windowEnd).trim();
};

export const normalizeHeadword = (value: string) => value.trim().toLowerCase();
