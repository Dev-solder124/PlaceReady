import { GoogleGenAI } from "@google/genai";
import {
  type Student,
  type Analysis,
  type ReadinessLevel,
  readinessLevelFromScore,
} from "./types";
import { computeReadinessBaseline } from "./student";

interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendedSkills: string[];
  suggestedRoles: string[];
  readinessScore: number; // AI-suggested score (0-100)
  readinessReasoning: string;
}

function buildStudentProfileText(student: Student): string {
  const skills = student.skills
    .map((s) => `${s.name} (level ${s.level}/5)`)
    .join(", ");
  const projects = student.projects
    .map(
      (p) =>
        `- ${p.title}: ${p.description} [Tech: ${p.tech.join(", ")}]`,
    )
    .join("\n");
  const certs = student.certifications
    .map((c) => `- ${c.name} by ${c.issuer} (${c.date})`)
    .join("\n");
  const internships = student.internships
    .map(
      (i) =>
        `- ${i.role} at ${i.company} (${i.duration}): ${i.description}`,
    )
    .join("\n");
  const achievements = student.achievements.map((a) => `- ${a}`).join("\n");

  return `STUDENT PROFILE
Name: ${student.name}
Branch: ${student.branch}
Year: ${student.year}
Graduation Year: ${student.graduationYear}
CGPA: ${student.cgpa}/10
10th: ${student.tenthPct ?? "N/A"}%
12th: ${student.twelfthPct ?? "N/A"}%
Status: ${student.status}

SKILLS:
${skills || "None listed"}

PROJECTS:
${projects || "None listed"}

CERTIFICATIONS:
${certs || "None listed"}

INTERNSHIPS:
${internships || "None listed"}

ACHIEVEMENTS:
${achievements || "None listed"}

LinkedIn: ${student.linkedinUrl || "N/A"}
GitHub: ${student.githubUrl || "N/A"}`;
}

const SYSTEM_PROMPT = `You are an expert campus placement analyst and career counselor who evaluates engineering student profiles for job readiness.

Your task: analyze the given student profile and produce an honest, actionable, recruiter-grade assessment.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences, no commentary) with exactly this shape:
{
  "summary": "3-4 sentence concise professional summary of the student's profile and employability.",
  "strengths": ["3-5 concrete strengths", "..."],
  "improvements": ["3-5 specific, actionable areas for improvement", "..."],
  "recommendedSkills": ["4-6 specific skills they should learn next to boost placement chances", "..."],
  "suggestedRoles": ["3-5 job roles that fit this profile well", "..."],
  "readinessScore": <integer 0-100 based on how placement-ready they are>,
  "readinessReasoning": "2-4 sentences explaining WHY that readiness score, referencing concrete profile signals (CGPA, projects, skills, internships, gaps)."
}

Scoring guidance:
- 80-100: Highly Ready (strong academics + multiple projects/internships + relevant skills)
- 60-79: Ready (decent profile, a few gaps)
- 40-59: Developing (foundational but needs more projects/skills/internship)
- 0-39: Not Ready (significant gaps)

Be specific and personalized. Reference the student's actual skills/projects. Avoid generic platitudes.`;

function extractJson(text: string): unknown {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  }
  // Find first { and last }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1);
  }
  return JSON.parse(cleaned);
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((v) => (typeof v === "string" ? v : String(v)))
    .filter((s) => s && s.trim().length > 0)
    .map((s) => s.trim())
    .slice(0, 8);
}

function clampScore(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function analyzeStudent(
  student: Student,
): Promise<Analysis & { breakdown: { label: string; value: number; max: number }[] }> {
  const baseline = computeReadinessBaseline(student);
  const baselineLevel: ReadinessLevel = readinessLevelFromScore(baseline.score);

  let ai: AIAnalysisResult;
  try {
    const aiClient = new GoogleGenAI({});
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `${buildStudentProfileText(student)}\n\nBaseline heuristic readiness score computed from profile signals: ${baseline.score}/100. Use this as an anchor but adjust based on qualitative factors (project depth, skill relevance, internship quality). Respond with ONLY the JSON.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    const content = response.text ?? "";
    const parsed = extractJson(content) as Record<string, unknown>;

    ai = {
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary.trim()
          : `${student.name} is a ${student.branch} student with a CGPA of ${student.cgpa}/10. The profile shows ${student.skills.length} technical skills and ${student.projects.length} projects.`,
      strengths: asStringArray(parsed.strengths, [
        "Solid academic foundation",
      ]),
      improvements: asStringArray(parsed.improvements, [
        "Build more hands-on projects",
      ]),
      recommendedSkills: asStringArray(parsed.recommendedSkills, [
        "Data Structures & Algorithms",
        "System Design",
      ]),
      suggestedRoles: asStringArray(parsed.suggestedRoles, [
        "Software Engineer",
        "Graduate Trainee",
      ]),
      readinessScore: clampScore(
        parsed.readinessScore,
        baseline.score,
      ),
      readinessReasoning:
        typeof parsed.readinessReasoning === "string" &&
        parsed.readinessReasoning.trim()
          ? parsed.readinessReasoning.trim()
          : `Based on a CGPA of ${student.cgpa}, ${student.skills.length} skills, ${student.projects.length} projects, and ${student.internships.length} internships, the student is assessed as ${baselineLevel.toLowerCase()}.`,
    };
  } catch (err) {
    // Graceful fallback to baseline-only analysis
    console.error("[ai.analyzeStudent] LLM failed, using fallback:", err);
    ai = {
      summary: `${student.name} is a Year ${student.year} ${student.branch} student graduating in ${student.graduationYear} with a CGPA of ${student.cgpa}/10. The profile includes ${student.skills.length} technical skills, ${student.projects.length} projects, ${student.internships.length} internship(s), and ${student.certifications.length} certification(s).`,
      strengths: deriveFallbackStrengths(student),
      improvements: deriveFallbackImprovements(student),
      recommendedSkills: deriveFallbackRecommendedSkills(student),
      suggestedRoles: deriveFallbackRoles(student),
      readinessScore: baseline.score,
      readinessReasoning: `Heuristic assessment based on academic performance (CGPA ${student.cgpa}/10), ${student.skills.length} skills, ${student.projects.length} projects, ${student.internships.length} internships, and ${student.certifications.length} certifications. Estimated readiness: ${baseline.score}/100 (${baselineLevel}).`,
    };
  }

  // Blend AI score with baseline to keep it grounded (60% AI, 40% baseline)
  const blended = Math.round(ai.readinessScore * 0.6 + baseline.score * 0.4);
  const finalScore = Math.max(0, Math.min(100, blended));
  const finalLevel = readinessLevelFromScore(finalScore);

  return {
    id: "",
    studentId: student.id,
    summary: ai.summary,
    strengths: ai.strengths,
    improvements: ai.improvements,
    recommendedSkills: ai.recommendedSkills,
    suggestedRoles: ai.suggestedRoles,
    readinessScore: finalScore,
    readinessLevel: finalLevel,
    readinessReasoning: ai.readinessReasoning,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    breakdown: baseline.breakdown,
  };
}

// ---------- Fallback heuristics ----------

function deriveFallbackStrengths(student: Student): string[] {
  const out: string[] = [];
  if (student.cgpa >= 8) out.push(`Strong academic record (CGPA ${student.cgpa}/10)`);
  if (student.skills.length >= 5) out.push(`Diverse skill set (${student.skills.length} skills)`);
  if (student.projects.length >= 2) out.push(`${student.projects.length} hands-on projects`);
  if (student.internships.length >= 1) out.push(`Industry exposure via ${student.internships.length} internship(s)`);
  if (student.certifications.length >= 1) out.push(`${student.certifications.length} professional certification(s)`);
  if (out.length === 0) out.push("Foundational knowledge in core branch subjects");
  return out.slice(0, 5);
}

function deriveFallbackImprovements(student: Student): string[] {
  const out: string[] = [];
  if (student.projects.length < 2) out.push("Build more real-world projects to demonstrate applied skills");
  if (student.internships.length === 0) out.push("Pursue at least one internship for industry exposure");
  if (student.skills.length < 5) out.push("Expand technical skill set with in-demand technologies");
  if (student.cgpa < 7.5) out.push("Focus on improving academic performance");
  if (student.certifications.length === 0) out.push("Earn industry-recognized certifications");
  if (!student.githubUrl) out.push("Maintain a public GitHub portfolio");
  if (out.length === 0) out.push("Practice mock interviews and aptitude tests");
  return out.slice(0, 5);
}

function deriveFallbackRecommendedSkills(student: Student): string[] {
  const have = new Set(student.skills.map((s) => s.name.toLowerCase()));
  const recs = [
    "Data Structures & Algorithms",
    "System Design",
    "SQL",
    "Cloud Fundamentals (AWS)",
    "Git & Version Control",
    "REST API Design",
  ];
  return recs.filter((r) => !have.has(r.toLowerCase())).slice(0, 6);
}

function deriveFallbackRoles(student: Student): string[] {
  const branch = student.branch.toLowerCase();
  if (branch.includes("computer") || branch.includes("information")) {
    return ["Software Engineer", "Full Stack Developer", "Backend Developer", "Data Analyst"];
  }
  if (branch.includes("electronic")) {
    return ["Embedded Systems Engineer", "Hardware Engineer", "Test Engineer"];
  }
  if (branch.includes("electrical")) {
    return ["Power Systems Engineer", "Electrical Design Engineer", "Control Engineer"];
  }
  if (branch.includes("mechanical")) {
    return ["Design Engineer", "Manufacturing Engineer", "CAD Engineer"];
  }
  if (branch.includes("civil")) {
    return ["Site Engineer", "Structural Engineer", "Project Coordinator"];
  }
  return ["Graduate Engineer Trainee", "Junior Engineer", "Operations Associate"];
}
