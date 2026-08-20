import Anthropic from "@anthropic-ai/sdk";

export const config = {
  maxDuration: 30,
};

const MODEL = "claude-sonnet-5";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. Set it in your deployment's environment variables." });
    return;
  }

  const { resume, jd } = req.body || {};
  if (typeof resume !== "string" || typeof jd !== "string" || resume.trim().length < 30 || jd.trim().length < 30) {
    res.status(400).json({ error: "Both resume and jd text are required (min 30 characters each)." });
    return;
  }

  const truncatedResume = resume.slice(0, 12000);
  const truncatedJd = jd.slice(0, 8000);

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        "You are an ATS-style resume evaluator. Compare the resume against the job description for genuine role fit " +
        "(responsibilities, seniority, domain, and skills — not just keyword overlap). " +
        "Respond with ONLY a JSON object, no markdown fences, no preamble, in exactly this shape: " +
        '{"semantic_score": <integer 0-100>, "summary": "<one or two sentence, second-person, plain-language verdict on overall fit>"}',
      messages: [
        {
          role: "user",
          content: `RESUME:\n${truncatedResume}\n\nJOB DESCRIPTION:\n${truncatedJd}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock ? textBlock.text.trim() : "";
    const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (!parsed || typeof parsed.semantic_score !== "number") {
      throw new Error("Model returned an unexpected response shape.");
    }

    const semantic_score = Math.max(0, Math.min(100, Math.round(parsed.semantic_score)));
    const summary = typeof parsed.summary === "string" ? parsed.summary : "";

    res.status(200).json({ semantic_score, summary });
  } catch (err) {
    console.error("match.js error:", err);
    res.status(502).json({ error: "Semantic match request failed: " + (err.message || "unknown error") });
  }
}
