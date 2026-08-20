import { useEffect, useState } from "react";

export default function Gauge({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(0);
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setAnimated(0);
    const t = requestAnimationFrame(() => setAnimated(score));
    return () => cancelAnimationFrame(t);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 150 150" className="gauge-svg">
        <circle cx="75" cy="75" r={radius} className="gauge-track" />
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 75 75)"
          className="gauge-fill"
        />
      </svg>
      <div className="gauge-num">
        <div className="gauge-val">{animated}%</div>
        <div className="gauge-lbl">match</div>
      </div>
    </div>
  );
}
