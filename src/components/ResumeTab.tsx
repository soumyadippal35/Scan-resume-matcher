import { resume } from "../data/resume";

export default function ResumeTab() {
  return (
    <div className="panel glow">
      <div className="panel-label">
        {resume.name} — Resume <span className="n">live preview</span>
      </div>

      <div id="resumePreview">
        <div className="r-name">{resume.name}</div>
        <div className="r-contact">
          {resume.contact.phone} &nbsp;|&nbsp; {resume.contact.location} &nbsp;|&nbsp;{" "}
          <a href={`mailto:${resume.contact.email}`}>{resume.contact.email}</a> &nbsp;|&nbsp;{" "}
          <a href={resume.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> &nbsp;|&nbsp;{" "}
          <a href={resume.contact.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>

        <h3>Summary</h3>
        <p>{resume.summary}</p>

        <h3>Skills</h3>
        {resume.skills.map((s) => (
          <p key={s.group}>
            <strong>{s.group}: </strong>
            {s.items.join(", ")}
          </p>
        ))}

        <h3>Experience</h3>
        {resume.experience.map((e) => (
          <div key={e.role} style={{ marginBottom: 10 }}>
            <strong>{e.role}</strong> — {e.org} <span className="r-period">({e.period})</span>
            <ul>
              {e.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <h3>Projects</h3>
        {resume.projects.map((p) => (
          <div key={p.title} style={{ marginBottom: 10 }}>
            <strong>{p.title}</strong> <span className="r-period">— {p.stack}</span>
            <ul>
              {p.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <h3>Education</h3>
        <ul>
          {resume.education.map((ed) => (
            <li key={ed.degree}>
              {ed.degree} · {ed.org} ({ed.period})
            </li>
          ))}
        </ul>

        <h3>Key Achievements</h3>
        <ul>
          {resume.achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>

        <h3>Courses &amp; Certificates</h3>
        <ul>
          {resume.courses.map((c) => (
            <li key={c.title}>
              <strong>{c.title}</strong> — {c.org}. {c.note}
            </li>
          ))}
        </ul>

        <h3>Languages</h3>
        <p>{resume.languages.map((l) => `${l.name} – ${l.level}`).join(" | ")}</p>
      </div>

      <div className="resume-actions">
        <a className="dl-link glow" href="/assets/Soumyadip_Pal_Resume.docx" download="Soumyadip_Pal_Resume.docx">
          Download .docx
        </a>
      </div>
    </div>
  );
}
