import { useState } from "react";
import { scoreKeywords, verdictFor } from "../lib/scoring";
import { callSemanticMatch } from "../lib/api";
import { pushHistory } from "../lib/history";
import type { JdSlot, CompareRow } from "../types";

function newSlot(n: number): JdSlot {
  return { id: Date.now() + "_" + n, title: `Role ${n}`, text: "" };
}

export default function CompareTab({ resumeText, resumeFileName }: { resumeText: string; resumeFileName: string }) {
  const [slots, setSlots] = useState<JdSlot[]>([newSlot(1), newSlot(2)]);
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CompareRow[] | null>(null);

  const validSlots = slots.filter((s) => s.text.trim().length > 30);
  const hasResume = resumeText.trim().length > 30;

  function updateSlot(id: string, patch: Partial<JdSlot>) {
    setSlots((s) => s.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  }

  function removeSlot(id: string) {
    setSlots((s) => s.filter((slot) => slot.id !== id));
  }

  async function runComparison() {
    if (!hasResume || validSlots.length < 1) return;
    setError("");
    setRunning(true);
    setResults(null);
    const rows: CompareRow[] = [];

    for (let i = 0; i < validSlots.length; i++) {
      const slot = validSlots[i];
      setStatus(`scoring ${i + 1} of ${validSlots.length}: ${slot.title}…`);
      const kw = scoreKeywords(resumeText, slot.text);
      let semantic = null;
      try {
        semantic = await callSemanticMatch(resumeText, slot.text);
      } catch (err) {
        console.error(err);
      }
      const finalScore = semantic ? Math.round(0.45 * kw.score + 0.55 * semantic.semantic_score) : kw.score;
      rows.push({ id: slot.id, title: slot.title, score: finalScore, kw, summary: semantic ? semantic.summary : null });
    }

    rows.sort((a, b) => b.score - a.score);
    setResults(rows);
    setStatus("");
    setRunning(false);

    rows.forEach((r) => {
      const v = verdictFor(r.score);
      pushHistory({
        type: "compare",
        title: r.title,
        score: r.score,
        verdictLabel: v.label,
        verdictCls: v.cls,
        matched: r.kw.matched.length,
        missing: r.kw.missing.length,
      });
    });
  }

  return (
    <div>
      <div className="panel glow" style={{ marginBottom: 20 }}>
        <div className="panel-label">
          Resume on file{" "}
          <span className="n">{hasResume ? resumeFileName : "no file — load one in Scan tab"}</span>
        </div>
      </div>

      <div>
        {slots.map((slot) => (
          <div className="jd-slot" key={slot.id}>
            <div className="jd-slot-head">
              <input
                value={slot.title}
                onChange={(e) => updateSlot(slot.id, { title: e.target.value })}
                placeholder="Role title"
              />
              <button className="jd-remove" onClick={() => removeSlot(slot.id)} title="Remove">
                ✕
              </button>
            </div>
            <textarea
              placeholder="Paste job description…"
              value={slot.text}
              onChange={(e) => updateSlot(slot.id, { text: e.target.value })}
            />
            <div className="jd-charcount">{slot.text.length} chars</div>
          </div>
        ))}
      </div>

      <div className="scan-row" style={{ justifyContent: "flex-start", marginTop: 0 }}>
        <button className="ghost-btn glow" onClick={() => setSlots((s) => [...s, newSlot(s.length + 1)])}>
          + Add job description
        </button>
      </div>

      <div className="scan-row">
        <button className="scan-btn glow" disabled={!hasResume || validSlots.length < 1 || running} onClick={runComparison}>
          {running ? "Comparing…" : "Run Comparison"}
        </button>
      </div>

      {running && (
        <div className="laser-track active">
          <div className="laser" />
        </div>
      )}
      {status && <div className="status-line">{status}</div>}
      {error && <div className="err show">{error}</div>}

      {results && (
        <div className="panel glow reveal-in">
          <div className="panel-label">Ranked fit</div>
          <div>
            {results.map((r, i) => {
              const v = verdictFor(r.score);
              return (
                <div className="lb-row" key={r.id}>
                  <div className="lb-rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="lb-info">
                    <div className="lb-title">{r.title}</div>
                    <div className="lb-bar">
                      <div className="lb-fill" style={{ width: `${r.score}%`, background: v.color }} />
                    </div>
                  </div>
                  <div className="lb-score" style={{ color: v.color }}>
                    {r.score}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
