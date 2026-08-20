export type TabId = "scan" | "compare" | "history" | "resume";

const TABS: { id: TabId; label: string }[] = [
  { id: "scan", label: "Scan" },
  { id: "compare", label: "Compare" },
  { id: "history", label: "History" },
  { id: "resume", label: "My Resume" },
];

export default function Header({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <>
      <header className="site-header hero-in hero-in-1">
        <div className="brand">
          SCAN<span>.</span>
        </div>
        <div className="tag">Resume × Job Description Match Engine</div>
      </header>
      <nav className="nav-tabs hero-in hero-in-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab glow${active === t.id ? " active" : ""}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
