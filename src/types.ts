export interface KeywordResult {
  score: number;
  matched: string[];
  missing: string[];
}

export interface SemanticResult {
  semantic_score: number;
  summary: string;
}

export interface Verdict {
  label: string;
  cls: "strong" | "mid" | "weak";
  color: string;
}

export interface ScanOutcome {
  finalScore: number;
  kw: KeywordResult;
  semantic: SemanticResult | null;
  ats: string[];
  suggestions: string[];
}

export interface JdSlot {
  id: string;
  title: string;
  text: string;
}

export interface CompareRow {
  id: string;
  title: string;
  score: number;
  kw: KeywordResult;
  summary: string | null;
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: "scan" | "compare";
  title: string;
  score: number;
  verdictLabel: string;
  verdictCls: Verdict["cls"];
  matched: number;
  missing: number;
}
