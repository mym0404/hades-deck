import { vocabularyManager } from "cefr-analyzer";
import { words as popularWords } from "popular-english-words";
import lemmatizer from "wink-lemmatizer";

import { CEFR_ORDER } from "../data/constants.js";

const levelWeight = new Map<string, number>(CEFR_ORDER.map((level, index) => [level, index]));

type WordProfile = {
  lemmas: Set<string>;
  levels: Set<string>;
  pos: Set<string>;
};

export type Lexicon = {
  getLemma: (word: string) => string;
  getLevels: (word: string) => string[];
  getPrimaryLevel: (word: string) => string | null;
  getGeneralRank: (word: string) => number;
  hasVerbSignal: (word: string) => boolean;
};

const fallbackLemma = (word: string) => {
  if (word.endsWith("ly")) {
    return word;
  }

  const attempts = [
    lemmatizer.verb(word),
    lemmatizer.noun(word),
    lemmatizer.adjective(word),
  ].filter((attempt) => attempt && attempt !== word);

  return attempts.sort((left, right) => left.length - right.length)[0] ?? word;
};

const getWordProfile = (word: string) => {
  const info = vocabularyManager.getWordInfo(word.toLowerCase());

  return info.reduce<WordProfile>(
    (profile, entry) => {
      profile.lemmas.add(entry.word.toLowerCase());
      profile.levels.add(entry.cefr);
      profile.pos.add(entry.pos);
      return profile;
    },
    {
      lemmas: new Set<string>(),
      levels: new Set<string>(),
      pos: new Set<string>(),
    },
  );
};

export const buildLexicon = (): Lexicon => {
  const cache = new Map<string, WordProfile>();

  const readProfile = (word: string) => {
    const normalized = word.toLowerCase();
    const cached = cache.get(normalized);

    if (cached) {
      return cached;
    }

    const lemma = fallbackLemma(normalized);
    const directProfile = getWordProfile(normalized);
    const lemmaProfile = lemma === normalized ? directProfile : getWordProfile(lemma);
    const merged = {
      lemmas: new Set<string>([lemma, ...directProfile.lemmas, ...lemmaProfile.lemmas]),
      levels: new Set<string>([...directProfile.levels, ...lemmaProfile.levels]),
      pos: new Set<string>([...directProfile.pos, ...lemmaProfile.pos]),
    };

    cache.set(normalized, merged);
    return merged;
  };

  return {
    getLemma: (word) => {
      const normalized = word.toLowerCase();
      const profile = readProfile(normalized);

      return [...profile.lemmas].sort((left, right) => left.length - right.length)[0] ?? normalized;
    },
    getLevels: (word) => {
      const profile = readProfile(word);

      return profile ? [...profile.levels].sort((left, right) => (levelWeight.get(left) ?? 99) - (levelWeight.get(right) ?? 99)) : [];
    },
    getPrimaryLevel: (word) => {
      const levels = readProfile(word).levels;

      if (!levels || levels.size === 0) {
        return null;
      }

      return [...levels].sort((left, right) => (levelWeight.get(left) ?? 99) - (levelWeight.get(right) ?? 99))[0] ?? null;
    },
    getGeneralRank: (word) => popularWords.getWordRank(word.toLowerCase()),
    hasVerbSignal: (word) => {
      const profile = readProfile(word);

      if (profile && [...profile.pos].some((part) => part.toLowerCase().includes("verb"))) {
        return true;
      }

      return lemmatizer.verb(word.toLowerCase()) !== word.toLowerCase();
    },
  };
};
