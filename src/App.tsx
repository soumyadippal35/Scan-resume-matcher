import { useState, Suspense, lazy } from "react";
import Header, { type TabId } from "./components/Header";
import ScanTab from "./components/ScanTab";
import CompareTab from "./components/CompareTab";
import HistoryTab from "./components/HistoryTab";
import ResumeTab from "./components/ResumeTab";

const Scene3D = lazy(() => import("./components/Scene3D"));

export default function App() {
  const [tab, setTab] = useState<TabId>("scan");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [liveScore, setLiveScore] = useState<number | null>(null);

  return (
    <>
      <Suspense fallback={null}>
        <Scene3D score={liveScore} />
      </Suspense>

      <div className="wrap">
        <Header active={tab} onChange={setTab} />

        {tab === "scan" && (
          <ScanTab
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeFileName={resumeFileName}
            setResumeFileName={setResumeFileName}
            onScored={setLiveScore}
          />
        )}
        {tab === "compare" && <CompareTab resumeText={resumeText} resumeFileName={resumeFileName} />}
        {tab === "history" && <HistoryTab />}
        {tab === "resume" && <ResumeTab />}
      </div>
    </>
  );
}
