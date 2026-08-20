import type { SemanticResult } from "../types";

export async function callSemanticMatch(resume: string, jd: string): Promise<SemanticResult> {
  const response = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jd }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `API request failed: ${response.status}`);
  }

  return response.json();
}
