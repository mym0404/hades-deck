export type DialogueLine = {
  id: string;
  lineNumber: number;
  section: string;
  speaker: string;
  rawText: string;
  text: string;
  tokens: Token[];
};

export type Token = {
  raw: string;
  normalized: string;
  start: number;
  end: number;
};

export type CandidateType = "word" | "phrase";

export type CandidateOccurrence = {
  lineId: string;
  lineNumber: number;
  section: string;
  speaker: string;
  sourceSentence: string;
  sourceClause: string;
  surface: string;
};

export type RankedCandidate = {
  headword: string;
  type: CandidateType;
  lemma: string;
  totalScore: number;
  reasonFlags: string[];
  corpusFreq: number;
  generalFreqRank: number;
  cefrLevels: string[];
  sourceSentence: string;
  sourceClause: string;
  speaker: string;
  section: string;
};

export type SampleCandidate = RankedCandidate;
