declare module "popular-english-words" {
  export const words: {
    getWordRank(word: string): number;
  };
}

declare module "wink-lemmatizer" {
  const lemmatizer: {
    noun(word: string): string;
    verb(word: string): string;
    adjective(word: string): string;
  };

  export default lemmatizer;
}

declare module "cefr-analyzer" {
  export type CefrLevel = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";

  export type CefrWord = {
    word: string;
    lemma: string;
    pos: string;
  };

  export const cefrAnalyzer: {
    analyze: (
      text: string,
      options?: {
        caseSensitive?: boolean;
        includeUnknownWords?: boolean;
        analyzeByPartOfSpeech?: boolean;
      },
    ) => {
      wordsAtLevel: Record<CefrLevel, CefrWord[]>;
      unknownWordsList?: string[];
    };
  };

  export const vocabularyManager: {
    getWordInfo: (word: string) => Array<{
      word: string;
      cefr: CefrLevel;
      pos: string;
    }>;
  };

  const analyzer: typeof cefrAnalyzer;

  export default analyzer;
}
