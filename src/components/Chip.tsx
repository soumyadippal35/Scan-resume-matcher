export default function Chip({ label, kind }: { label: string; kind: "matched" | "missing" }) {
  return <span className={`chip chip-${kind}`}>{label}</span>;
}

export function ChipRow({ terms, kind }: { terms: string[]; kind: "matched" | "missing" }) {
  if (!terms.length) {
    return <span className="chip-empty">none</span>;
  }
  return (
    <>
      {terms.map((t) => (
        <Chip key={t} label={t} kind={kind} />
      ))}
    </>
  );
}
