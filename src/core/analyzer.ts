import {
  EASY_STOPWORDS,
  MANUAL_ALLOWLIST,
  MANUAL_DENYLIST,
  MAX_DEFAULT_CANDIDATES,
  PARTICLES,
  PREPOSITIONS,
  PROPER_NOUNS,
  STYLE_HINTS,
} from "../data/constants.js";
import type { CandidateOccurrence, DialogueLine, RankedCandidate, SampleCandidate, Token } from "./model.js";
import { buildLexicon } from "./lexicon.js";
import { parseDialogue } from "./parser.js";
import { countWords, extractClause, normalizeHeadword } from "./text.js";

type Aggregate = {
  headword: string;
  type: "word" | "phrase";
  lemma: string;
  occurrences: CandidateOccurrence[];
  corpusFreq: number;
  capitalizedCount: number;
  generalFreqRank: number;
  cefrLevels: Set<string>;
  reasonFlags: Set<string>;
  representative: CandidateOccurrence;
  styleHits: number;
};

const levelScoreMap: Record<string, number> = {
  a1: -4,
  a2: -3,
  b1: -2,
  b2: -1,
  c1: 1.2,
  c2: 1.8,
};

const getSpeakerWeight = (speaker: string) => (speaker === "Storyteller" ? -0.35 : 0.45);

const getClauseScore = (text: string) => {
  const words = countWords(text);

  if (words >= 6 && words <= 18) {
    return 0.9;
  }

  if (words <= 28) {
    return 0.35;
  }

  return -0.25;
};

const getFrequencyScore = (corpusFreq: number) => {
  if (corpusFreq >= 8) {
    return 1.2;
  }

  if (corpusFreq >= 4) {
    return 0.85;
  }

  if (corpusFreq >= 2) {
    return 0.45;
  }

  return -0.6;
};

const getGeneralRankScore = (rank: number) => {
  if (rank === -1) {
    return 2.3;
  }

  if (rank > 12000) {
    return 2;
  }

  if (rank > 8000) {
    return 1.45;
  }

  if (rank > 5000) {
    return 0.7;
  }

  if (rank > 2500) {
    return 0.1;
  }

  return -1.6;
};

const isEasyWord = ({
  headword,
  levels,
  rank,
  relaxed,
}: {
  headword: string;
  levels: string[];
  rank: number;
  relaxed: boolean;
}) => {
  if (MANUAL_ALLOWLIST.has(headword)) {
    return false;
  }

  const primaryLevel = levels[0];

  if (EASY_STOPWORDS.has(headword) || MANUAL_DENYLIST.has(headword)) {
    return true;
  }

  if (!primaryLevel) {
    return rank !== -1 && rank <= (relaxed ? 1400 : 2200);
  }

  if (primaryLevel === "a1" || primaryLevel === "a2") {
    return true;
  }

  if (
    !relaxed &&
    (primaryLevel === "b1" || primaryLevel === "b2") &&
    rank !== -1 &&
    rank <= 6000
  ) {
    return true;
  }

  if (relaxed && primaryLevel === "b1" && rank !== -1 && rank <= 3500) {
    return true;
  }

  return false;
};

const pickRepresentative = (current: CandidateOccurrence, next: CandidateOccurrence) => {
  const currentScore = getSpeakerWeight(current.speaker) + getClauseScore(current.sourceClause);
  const nextScore = getSpeakerWeight(next.speaker) + getClauseScore(next.sourceClause);

  return nextScore > currentScore ? next : current;
};

const pushOccurrence = ({
  aggregates,
  key,
  occurrence,
  headword,
  lemma,
  type,
  generalFreqRank,
  cefrLevels,
  styleHit,
  flags,
}: {
  aggregates: Map<string, Aggregate>;
  key: string;
  occurrence: CandidateOccurrence;
  headword: string;
  lemma: string;
  type: "word" | "phrase";
  generalFreqRank: number;
  cefrLevels: string[];
  styleHit: boolean;
  flags: string[];
}) => {
  const aggregate = aggregates.get(key) ?? {
    headword,
    type,
    lemma,
    occurrences: [],
    corpusFreq: 0,
    capitalizedCount: 0,
    generalFreqRank,
    cefrLevels: new Set<string>(),
    reasonFlags: new Set<string>(),
    representative: occurrence,
    styleHits: 0,
  };

  aggregate.occurrences.push(occurrence);
  aggregate.corpusFreq += 1;
  aggregate.capitalizedCount += /^[A-Z]/.test(occurrence.surface) ? 1 : 0;
  aggregate.generalFreqRank = aggregate.generalFreqRank === -1 ? generalFreqRank : Math.max(aggregate.generalFreqRank, generalFreqRank);
  aggregate.representative = pickRepresentative(aggregate.representative, occurrence);

  for (const level of cefrLevels) {
    aggregate.cefrLevels.add(level);
  }

  for (const flag of flags) {
    aggregate.reasonFlags.add(flag);
  }

  if (styleHit) {
    aggregate.styleHits += 1;
    aggregate.reasonFlags.add("style:literary");
  }

  aggregates.set(key, aggregate);
};

const toOccurrence = ({
  line,
  surface,
  start,
  end,
}: {
  line: DialogueLine;
  surface: string;
  start: number;
  end: number;
}) => ({
  lineId: line.id,
  lineNumber: line.lineNumber,
  section: line.section,
  speaker: line.speaker,
  sourceSentence: line.text,
  sourceClause: extractClause({
    text: line.text,
    start,
    end,
  }),
  surface,
});

const shouldSkipToken = (token: Token) =>
  token.normalized.length < 4 ||
  token.normalized.includes("'") ||
  PROPER_NOUNS.has(token.normalized);

const shouldSkipPhraseToken = (token: Token) =>
  token.normalized.includes("'") || PROPER_NOUNS.has(token.normalized);

const deriveLevelsScore = (levels: string[]) => {
  if (levels.length === 0) {
    return 1.6;
  }

  return Math.max(...levels.map((level) => levelScoreMap[level] ?? 0));
};

const roundScore = (value: number) => Math.round(value * 100) / 100;

const aggregateToCandidate = (aggregate: Aggregate): RankedCandidate => {
  const levels = [...aggregate.cefrLevels].sort();
  const representative = aggregate.representative;
  const levelScore = deriveLevelsScore(levels);
  const totalScore =
    getFrequencyScore(aggregate.corpusFreq) +
    getGeneralRankScore(aggregate.generalFreqRank) +
    levelScore +
    getSpeakerWeight(representative.speaker) +
    getClauseScore(representative.sourceClause) +
    (aggregate.type === "phrase" ? 0.75 : 0) +
    Math.min(0.8, aggregate.styleHits * 0.3);

  aggregate.reasonFlags.add(`freq:${aggregate.corpusFreq}`);
  aggregate.reasonFlags.add(
    aggregate.generalFreqRank === -1 ? "rank:missing" : `rank:${aggregate.generalFreqRank}`,
  );

  if (levels.length > 0) {
    aggregate.reasonFlags.add(`cefr:${levels.join("|")}`);
  } else {
    aggregate.reasonFlags.add("cefr:unknown");
  }

  aggregate.reasonFlags.add(
    representative.speaker === "Storyteller" ? "source:storyteller" : "source:character",
  );

  return {
    headword: aggregate.headword,
    type: aggregate.type,
    lemma: aggregate.lemma,
    totalScore: roundScore(totalScore),
    reasonFlags: [...aggregate.reasonFlags].sort(),
    corpusFreq: aggregate.corpusFreq,
    generalFreqRank: aggregate.generalFreqRank,
    cefrLevels: levels,
    sourceSentence: representative.sourceSentence,
    sourceClause: representative.sourceClause,
    speaker: representative.speaker,
    section: representative.section,
  };
};

const buildPhrases = ({
  line,
  aggregates,
  getLemma,
  getLevels,
  getGeneralRank,
  hasVerbSignal,
}: {
  line: DialogueLine;
  aggregates: Map<string, Aggregate>;
  getLemma: (word: string) => string;
  getLevels: (word: string) => string[];
  getGeneralRank: (word: string) => number;
  hasVerbSignal: (word: string) => boolean;
}) => {
  for (let index = 0; index < line.tokens.length - 1; index += 1) {
    const first = line.tokens[index];
    const second = line.tokens[index + 1];

    if (
      shouldSkipToken(first) ||
      shouldSkipPhraseToken(second) ||
      !PARTICLES.has(second.normalized) ||
      !hasVerbSignal(first.normalized)
    ) {
      continue;
    }

    const phrase = `${first.normalized} ${second.normalized}`;
    const occurrence = toOccurrence({
      line,
      surface: phrase,
      start: first.start,
      end: second.end,
    });

    pushOccurrence({
      aggregates,
      key: `phrase:${phrase}`,
      occurrence,
      headword: phrase,
      lemma: `${getLemma(first.normalized)} ${second.normalized}`,
      type: "phrase",
      generalFreqRank: Math.max(getGeneralRank(first.normalized), getGeneralRank(second.normalized)),
      cefrLevels: [...new Set([...getLevels(first.normalized), ...getLevels(second.normalized)])],
      styleHit: STYLE_HINTS.has(first.normalized) || STYLE_HINTS.has(second.normalized),
      flags: ["type:phrasal"],
    });

    const third = line.tokens[index + 2];

    if (
      !third ||
      shouldSkipPhraseToken(third) ||
      !PREPOSITIONS.has(third.normalized)
    ) {
      continue;
    }

    const trigram = `${first.normalized} ${second.normalized} ${third.normalized}`;
    const triOccurrence = toOccurrence({
      line,
      surface: trigram,
      start: first.start,
      end: third.end,
    });

    pushOccurrence({
      aggregates,
      key: `phrase:${trigram}`,
      occurrence: triOccurrence,
      headword: trigram,
      lemma: `${getLemma(first.normalized)} ${second.normalized} ${third.normalized}`,
      type: "phrase",
      generalFreqRank: Math.max(
        getGeneralRank(first.normalized),
        getGeneralRank(second.normalized),
        getGeneralRank(third.normalized),
      ),
      cefrLevels: [
        ...new Set([
          ...getLevels(first.normalized),
          ...getLevels(second.normalized),
          ...getLevels(third.normalized),
        ]),
      ],
      styleHit:
        STYLE_HINTS.has(first.normalized) ||
        STYLE_HINTS.has(second.normalized) ||
        STYLE_HINTS.has(third.normalized),
      flags: ["type:phrasal"],
    });
  }
};

const buildWords = ({
  lines,
  aggregates,
  getLemma,
  getLevels,
  getGeneralRank,
  relaxed,
}: {
  lines: DialogueLine[];
  aggregates: Map<string, Aggregate>;
  getLemma: (word: string) => string;
  getLevels: (word: string) => string[];
  getGeneralRank: (word: string) => number;
  relaxed: boolean;
}) => {
  for (const line of lines) {
    for (const token of line.tokens) {
      if (shouldSkipToken(token)) {
        continue;
      }

      const lemma = normalizeHeadword(getLemma(token.normalized));
      const levels = getLevels(token.normalized);
      const rank = getGeneralRank(lemma);

      if (isEasyWord({ headword: lemma, levels, rank, relaxed })) {
        continue;
      }

      const occurrence = toOccurrence({
        line,
        surface: token.raw,
        start: token.start,
        end: token.end,
      });

      pushOccurrence({
        aggregates,
        key: `word:${lemma}`,
        occurrence,
        headword: lemma,
        lemma,
        type: "word",
        generalFreqRank: rank,
        cefrLevels: levels,
        styleHit: STYLE_HINTS.has(lemma) || STYLE_HINTS.has(token.normalized),
        flags: token.normalized !== lemma ? [`surface:${token.normalized}`] : [],
      });
    }
  }
};

const filterCandidates = ({
  candidates,
  relaxed,
}: {
  candidates: RankedCandidate[];
  relaxed: boolean;
}) =>
  candidates.filter((candidate) => {
    if (
      candidate.generalFreqRank === -1 &&
      candidate.cefrLevels.length === 0 &&
      !MANUAL_ALLOWLIST.has(candidate.headword)
    ) {
      return false;
    }

    if (candidate.type === "phrase") {
      return candidate.corpusFreq >= 2 || candidate.totalScore >= (relaxed ? 2.4 : 3.5);
    }

    if (candidate.corpusFreq === 1 && candidate.totalScore < (relaxed ? 1.8 : 3)) {
      return false;
    }

    return candidate.totalScore >= (relaxed ? 1.2 : 1.9);
  });

const collectCandidates = ({
  raw,
  relaxed,
}: {
  raw: string;
  relaxed: boolean;
}) => {
  const lines = parseDialogue(raw);
  const lexicon = buildLexicon();
  const aggregates = new Map<string, Aggregate>();

  buildWords({
    lines,
    aggregates,
    getLemma: lexicon.getLemma,
    getLevels: lexicon.getLevels,
    getGeneralRank: lexicon.getGeneralRank,
    relaxed,
  });

  for (const line of lines) {
    buildPhrases({
      line,
      aggregates,
      getLemma: lexicon.getLemma,
      getLevels: lexicon.getLevels,
      getGeneralRank: lexicon.getGeneralRank,
      hasVerbSignal: lexicon.hasVerbSignal,
    });
  }

  return [...aggregates.values()]
    .filter((aggregate) => {
      if (MANUAL_ALLOWLIST.has(aggregate.headword)) {
        return true;
      }

      return aggregate.capitalizedCount / Math.max(1, aggregate.corpusFreq) < 0.6;
    })
    .map(aggregateToCandidate)
    .sort((left, right) => right.totalScore - left.totalScore || right.corpusFreq - left.corpusFreq);
};

export const rankDialogue = ({
  raw,
  limit = MAX_DEFAULT_CANDIDATES,
  relaxed = false,
}: {
  raw: string;
  limit?: number;
  relaxed?: boolean;
}) =>
  filterCandidates({
    candidates: collectCandidates({ raw, relaxed }),
    relaxed,
  })
    .sort((left, right) => right.totalScore - left.totalScore || right.corpusFreq - left.corpusFreq)
    .slice(0, limit);

export const sampleDialogue = ({
  text,
  maxItems = 4,
}: {
  text: string;
  maxItems?: number;
}) => {
  const normalized = /:/.test(text) ? text : `Sample: ${text}`;
  const raw = `--- Sample ---\n${normalized}`;
  const ranked = rankDialogue({
    raw,
    limit: Math.max(maxItems, 6),
    relaxed: true,
  });

  if (ranked.length >= 2) {
    return ranked.slice(0, Math.min(4, Math.max(2, maxItems)));
  }

  const loose = collectCandidates({
    raw,
    relaxed: true,
  });
  const merged = [...ranked];

  for (const candidate of loose) {
    if (merged.some((current) => current.headword === candidate.headword)) {
      continue;
    }

    merged.push(candidate);

    if (merged.length >= Math.min(4, Math.max(2, maxItems))) {
      break;
    }
  }

  return merged.slice(0, Math.min(4, Math.max(2, maxItems)));
};
