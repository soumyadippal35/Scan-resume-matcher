import type { KeywordResult, Verdict } from "../types";

export const SKILLS_DB = [
  "SQL", "Python", "R", "Excel", "Power BI", "Tableau", "Java", "JavaScript", "React", "Node.js",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Machine Learning", "Deep Learning", "NLP",
  "Data Analysis", "Data Visualization", "Statistics", "Pandas", "NumPy", "Scikit-learn", "TensorFlow",
  "PyTorch", "Spark", "Hadoop", "ETL", "DAX", "Power Query", "MySQL", "PostgreSQL", "MongoDB", "API",
  "REST", "Agile", "Scrum", "Communication", "Leadership", "Problem Solving", "Teamwork", "Data Cleaning",
  "Data Modeling", "Dashboard", "KPI", "Forecasting", "A/B Testing", "Regression", "Classification",
  "Clustering", "Time Series", "Business Intelligence", "Data Warehousing", "Google Analytics",
  "VBA", "Power Automate", "Jupyter", "Linux", "CI/CD", "Cloud Computing", "Prompt Engineering",
  "Generative AI", "Artificial Intelligence", "C", "HTML", "CSS",
];

const STOPWORDS = new Set(
  "a an the and or but if of to in on for with as by at from is are was were be been being this that these those it its it's you your we our they their he she his her will would can could should must have has had do does did not no nor so than then too very just about into over under out up down more most other some such only own same"
    .split(" ")
);

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractJdKeywords(jd: string) {
  const dictHits = SKILLS_DB.filter((term) => {
    const re = new RegExp(`(^|[^a-zA-Z])${escapeRe(term)}([^a-zA-Z]|$)`, "i");
    return re.test(jd);
  });
  const jdLower = jd.toLowerCase();
  const words = jdLower
    .replace(/[^a-z0-9\s+]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w));
  const freq: Record<string, number> = {};
  words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
  const extra = Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w)
    .filter((w) => !dictHits.some((d) => d.toLowerCase() === w));
  return { dictHits, extra };
}

export function scoreKeywords(resume: string, jd: string): KeywordResult {
  const { dictHits, extra } = extractJdKeywords(jd);
  const allTerms = [...dictHits, ...extra];
  const resumeLower = resume.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];
  allTerms.forEach((term) => {
    const re = new RegExp(`(^|[^a-zA-Z])${escapeRe(term.toLowerCase())}([^a-zA-Z]|$)`, "i");
    if (re.test(resumeLower)) matched.push(term);
    else missing.push(term);
  });
  const score = allTerms.length ? Math.round((matched.length / allTerms.length) * 100) : 0;
  return { score, matched, missing };
}

export function atsChecks(resumeText: string): string[] {
  const checks: string[] = [];
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  const hasPhone = /(\+?\d[\d\s-]{8,}\d)/.test(resumeText);
  const wordCount = resumeText.trim().split(/\s+/).length;
  checks.push(
    hasEmail
      ? "Email address detected — good, ATS can extract contact info."
      : "No email address detected — make sure it's plain text, not inside an image or text box."
  );
  checks.push(
    hasPhone
      ? "Phone number detected."
      : "No phone number detected — add one in plain text near the header."
  );
  checks.push(
    wordCount > 150
      ? `Resume text length looks reasonable (${wordCount} words).`
      : `Very little text extracted (${wordCount} words) — check for scanned images or heavy graphics that ATS can't read.`
  );
  return checks;
}

export function buildSuggestions(kw: KeywordResult, semanticSummary: string | null): string[] {
  const suggestions: string[] = [];
  if (kw.missing.length) {
    suggestions.push(
      `Work these in where genuinely true: ${kw.missing.slice(0, 8).join(", ")}.`
    );
  } else {
    suggestions.push("Every detected keyword already appears in the resume — nice coverage.");
  }
  if (kw.score < 45) {
    suggestions.push("Coverage is low — consider tailoring a version of this resume specifically for this role.");
  }
  if (semanticSummary) {
    suggestions.push(semanticSummary);
  }
  suggestions.push("Quantify achievements with numbers where possible (%, counts, time saved).");
  return suggestions;
}

export function verdictFor(score: number): Verdict {
  if (score >= 70) return { label: "Strong match", cls: "strong", color: "#7fd8a3" };
  if (score >= 45) return { label: "Partial match", cls: "mid", color: "#e8a33d" };
  return { label: "Weak match", cls: "weak", color: "#e2725b" };
}
