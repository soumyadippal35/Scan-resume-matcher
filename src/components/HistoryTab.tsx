import { useEffect, useState } from "react";
import { loadHistory, deleteHistoryEntry, clearHistory } from "../lib/history";
import type { HistoryEntry } from "../types";

export default function HistoryTab() {
  const [hist, setHist] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHist(loadHistory());
  }, []);

  function remove(id: string) {
    deleteHistoryEntry(id);
    setHist(loadHistory());
  }

  function clearAll() {
    if (confirm("Clear all saved scan history? This cannot be undone.")) {
      clearHistory();
      setHist([]);
    }
  }

  return (
    <div>
      <div className="panel-label" style={{ marginBottom: 16 }}>
        Scan history <span className="n">{hist.length ? `${hist.length} saved` : ""}</span>
      </div>

      {!hist.length ? (
        <div className="hist-empty">No scans yet — run a scan or comparison to build your history.</div>
      ) : (
        <div>
          {hist.map((h) => {
            const d = new Date(h.date);
            const dateStr =
              d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
              " · " +
              d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            const color = h.verdictCls === "strong" ? "#7fd8a3" : h.verdictCls === "mid" ? "#e8a33d" : "#e2725b";
            return (
              <div className="hist-card glow" key={h.id}>
                <div className="hist-info">
                  <div className="hist-title">{h.title}</div>
                  <div className="hist-meta">
                    {h.type === "compare" ? "compare" : "scan"} · {dateStr} · {h.matched} matched / {h.missing} missing
                  </div>
                </div>
                <div className="hist-right">
                  <div className="hist-score" style={{ color }}>
                    {h.score}%
                  </div>
                  <button className="hist-del" title="Delete" onClick={() => remove(h.id)}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="scan-row" style={{ justifyContent: "flex-start" }}>
        <button className="ghost-btn glow" onClick={clearAll}>
          Clear history
        </button>
      </div>
    </div>
  );
}
