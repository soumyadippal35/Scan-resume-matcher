import { useRef, useState, useCallback } from "react";
import jsPDF from "jspdf";
import { extractTextFromFile } from "../lib/extractText";
import { scoreKeywords, atsChecks, buildSuggestions, verdictFor } from "../lib/scoring";
import { callSemanticMatch } from "../lib/api";
import { pushHistory } from "../lib/history";
import { ChipRow } from "./Chip";
import Gauge from "./Gauge";
import type { ScanOutcome } from "../types";

interface Props {
  resumeText: string;
  setResumeText: (t: string) => void;
  resumeFileName: string;
  setResumeFileName: (n: string) => void;
  onScored: (score: number | null) => void;
}

export default function ScanTab({ resumeText, setResumeText, resumeFileName, setResumeFileName, onScored }: Props) {
  const [jdText, setJdText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canScan = resumeText.trim().length > 30 && jdText.trim().length > 30;

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      const name = file.name.toLowerCase();
      if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
        setError("Please upload a .pdf or .docx file.");
        return;
      }
      setResumeFileName("reading…");
      try {
        const text = await extractTextFromFile(file);
        if (text.trim().length < 30) {
          setError(
            "Could not extract readable text from this file — it may be a scanned image. Try exporting a text-based PDF."
          );
          setResumeFileName("");
          return;
        }
        setResumeText(text);
        setResumeFileName(file.name);
      } catch (err) {
        setError("Failed to parse the file: " + (err as Error).message);
        setResumeFileName("");
      }
    },
    [setResumeText, setResumeFileName]
  );

  async function runScan(textOverride?: string) {
    const rText = textOverride ?? resumeText;
    if (rText.trim().length <= 30 || jdText.trim().length <= 30) return;
    setError("");
    setScanning(true);
    setStatus("extracting keywords…");
    onScored(null);

    const kw = scoreKeywords(rText, jdText);
    let semantic = null;
    try {
      setStatus("running semantic match…");
      semantic = await callSemanticMatch(rText, jdText);
    } catch (err) {
      setError("Semantic analysis unavailable right now — showing keyword-only score. (" + (err as Error).message + ")");
    }

    const finalScore = semantic ? Math.round(0.45 * kw.score + 0.55 * semantic.semantic_score) : kw.score;
    const ats = atsChecks(rText);
    const suggestions = buildSuggestions(kw, semantic?.summary ?? null);

    const result: ScanOutcome = { finalScore, kw, semantic, ats, suggestions };
    setOutcome(result);
    setStatus("");
    setScanning(false);
    onScored(finalScore);

    const v = verdictFor(finalScore);
    pushHistory({
      type: "scan",
      title: jdText.slice(0, 60).trim() || "Untitled scan",
      score: finalScore,
      verdictLabel: v.label,
      verdictCls: v.cls,
      matched: kw.matched.length,
      missing: kw.missing.length,
    });
  }

  function downloadReport() {
    if (!outcome) return;
    const doc = new jsPDF();
    const v = verdictFor(outcome.finalScore);
    let y = 18;
    doc.setFont("courier", "bold");
    doc.setFontSize(16);
    doc.text("SCAN — Resume Match Report", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont("courier", "normal");
    doc.text(`Overall match: ${outcome.finalScore}%  (${v.label})`, 14, y);
    y += 10;
    doc.text(`Keyword score: ${outcome.kw.score}%`, 14, y);
    y += 6;
    if (outcome.semantic) {
      doc.text(`Semantic score: ${outcome.semantic.semantic_score}%`, 14, y);
      y += 8;
      const summaryLines = doc.splitTextToSize(outcome.semantic.summary, 180);
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 6 + 4;
    }
    doc.setFont("courier", "bold");
    doc.text("Matched keywords:", 14, y);
    y += 6;
    doc.setFont("courier", "normal");
    const matchedLines = doc.splitTextToSize(outcome.kw.matched.join(", ") || "none", 180);
    doc.text(matchedLines, 14, y);
    y += matchedLines.length * 6 + 6;
    doc.setFont("courier", "bold");
    doc.text("Missing keywords:", 14, y);
    y += 6;
    doc.setFont("courier", "normal");
    const missingLines = doc.splitTextToSize(outcome.kw.missing.join(", ") || "none", 180);
    doc.text(missingLines, 14, y);
    y += missingLines.length * 6 + 8;
    doc.setFont("courier", "bold");
    doc.text("ATS checks:", 14, y);
    y += 6;
    doc.setFont("courier", "normal");
    outcome.ats.forEach((line) => {
      const wrapped = doc.splitTextToSize("- " + line, 180);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 6;
    });
    doc.save("scan-report.pdf");
  }

  const v = outcome ? verdictFor(outcome.finalScore) : null;

  return (
    <div>
      <div className="grid hero-in hero-in-3">
        <div className="panel glow">
          <div className="panel-label">
            01 · Resume <span className="n">{resumeFileName || "no file"}</span>
          </div>
          <div
            className={`drop glow${dragOver ? " dragover" : ""}${resumeFileName ? " filled" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8FA39C" strokeWidth="1.5">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            <div className="drop-main">{resumeFileName || "Drop resume here or click to upload"}</div>
            <div className="drop-sub">
              {resumeText ? `${resumeText.trim().split(/\s+/).length} words extracted` : "PDF or DOCX"}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {resumeText && (
            <>
              <button className="edit-toggle" onClick={() => { setEditOpen((v) => !v); setEditValue(resumeText); }}>
                Edit extracted text
              </button>
              {editOpen && (
                <div className="edit-panel show">
                  <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  <div className="scan-row" style={{ margin: "14px 0 0" }}>
                    <button
                      className="ghost-btn glow"
                      onClick={() => {
                        if (editValue.trim().length < 30) {
                          setError("Edited resume text looks too short to scan.");
                          return;
                        }
                        setResumeText(editValue);
                        setResumeFileName(`${editValue.trim().split(/\s+/).length} words (edited)`);
                        runScan(editValue);
                      }}
                    >
                      Apply edits &amp; re-scan
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="panel glow">
          <div className="panel-label">
            02 · Job Description <span className="n">{jdText.length} chars</span>
          </div>
          <textarea
            placeholder="Paste the job description here…"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>
      </div>

      <div className="scan-row">
        <button className="scan-btn glow" disabled={!canScan || scanning} onClick={() => runScan()}>
          {scanning ? "Scanning…" : "Run Scan"}
        </button>
      </div>

      {scanning && (
        <div className="laser-track active">
          <div className="laser" />
        </div>
      )}
      {status && <div className="status-line">{status}</div>}
      {error && <div className="err show">{error}</div>}

      {outcome && v && (
        <div className="results show">
          <div className="score-panel reveal-in glow">
            <Gauge score={outcome.finalScore} color={v.color} />
            <div className="score-summary">
              <div className={`verdict verdict-${v.cls}`}>{v.label}</div>
              <h2>Overall fit</h2>
              <p>
                Keyword coverage {outcome.kw.score}%
                {outcome.semantic ? ` · semantic fit ${outcome.semantic.semantic_score}%` : " · semantic score unavailable"}.
                {outcome.semantic ? " " + outcome.semantic.summary : ""}
              </p>
            </div>
          </div>

          <div className="subgrid">
            <div className="panel glow reveal-in">
              <div className="panel-label">
                Matched keywords <span className="n">{outcome.kw.matched.length}</span>
              </div>
              <ChipRow terms={outcome.kw.matched} kind="matched" />
            </div>
            <div className="panel glow reveal-in">
              <div className="panel-label">
                Missing keywords <span className="n">{outcome.kw.missing.length}</span>
              </div>
              <ChipRow terms={outcome.kw.missing} kind="missing" />
            </div>
          </div>

          <div className="panel glow reveal-in" style={{ marginBottom: 20 }}>
            <div className="panel-label">ATS format checks</div>
            <ul className="log-list">
              {outcome.ats.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="panel glow reveal-in" style={{ marginBottom: 20 }}>
            <div className="panel-label">Suggestions</div>
            <ul className="log-list">
              {outcome.suggestions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="scan-row" style={{ marginTop: 0 }}>
            <button className="ghost-btn glow" onClick={downloadReport}>
              Download PDF report
            </button>
          </div>
        </div>
      )}

      <div className="footnote">Client-side parsing · keyword score is local, semantic score uses a Claude API call</div>
    </div>
  );
}
