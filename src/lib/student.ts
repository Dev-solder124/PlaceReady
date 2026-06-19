import {
  type Student,
  type StudentRecord,
  type StudentInput,
  type Analysis,
  type Skill,
  type Project,
  type Certification,
  type Internship,
  readinessLevelFromScore,
} from "./types";

// ---------- Serialization ----------

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseStudent(record: StudentRecord): Student {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone ?? null,
    rollNumber: record.rollNumber ?? null,
    branch: record.branch,
    year: record.year,
    graduationYear: record.graduationYear,
    cgpa: record.cgpa,
    tenthPct: record.tenthPct ?? null,
    twelfthPct: record.twelfthPct ?? null,
    skills: safeParse<Skill[]>(record.skills, []),
    projects: safeParse<Project[]>(record.projects, []),
    certifications: safeParse<Certification[]>(record.certifications, []),
    internships: safeParse<Internship[]>(record.internships, []),
    achievements: safeParse<string[]>(record.achievements, []),
    linkedinUrl: record.linkedinUrl ?? null,
    githubUrl: record.githubUrl ?? null,
    resumeUrl: record.resumeUrl ?? null,
    status: record.status as Student["status"],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    analysis: undefined,
  };
}

export function parseAnalysis(record: {
  id: string;
  studentId: string;
  summary: string;
  strengths: string;
  improvements: string;
  recommendedSkills: string;
  suggestedRoles: string;
  readinessScore: number;
  readinessLevel: string;
  readinessReasoning: string;
  createdAt: Date;
  updatedAt: Date;
}): Analysis {
  return {
    id: record.id,
    studentId: record.studentId,
    summary: record.summary,
    strengths: safeParse<string[]>(record.strengths, []),
    improvements: safeParse<string[]>(record.improvements, []),
    recommendedSkills: safeParse<string[]>(record.recommendedSkills, []),
    suggestedRoles: safeParse<string[]>(record.suggestedRoles, []),
    readinessScore: record.readinessScore,
    readinessLevel: record.readinessLevel as Analysis["readinessLevel"],
    readinessReasoning: record.readinessReasoning,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function studentInputToRecord(input: StudentInput) {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    rollNumber: input.rollNumber?.trim() || null,
    branch: input.branch,
    year: Number(input.year),
    graduationYear: Number(input.graduationYear),
    cgpa: Number(input.cgpa),
    tenthPct: input.tenthPct != null ? Number(input.tenthPct) : null,
    twelfthPct: input.twelfthPct != null ? Number(input.twelfthPct) : null,
    skills: JSON.stringify(input.skills ?? []),
    projects: JSON.stringify(input.projects ?? []),
    certifications: JSON.stringify(input.certifications ?? []),
    internships: JSON.stringify(input.internships ?? []),
    achievements: JSON.stringify(input.achievements ?? []),
    linkedinUrl: input.linkedinUrl?.trim() || null,
    githubUrl: input.githubUrl?.trim() || null,
    resumeUrl: input.resumeUrl?.trim() || null,
    status: input.status ?? "Active",
  };
}

// ---------- Heuristic readiness baseline ----------
// A transparent, explainable baseline used to anchor the AI reasoning.

export function computeReadinessBaseline(
  student: Pick<
    Student,
    | "cgpa"
    | "skills"
    | "projects"
    | "certifications"
    | "internships"
    | "achievements"
    | "tenthPct"
    | "twelfthPct"
  >,
): { score: number; breakdown: { label: string; value: number; max: number }[] } {
  const breakdown: { label: string; value: number; max: number }[] = [];

  // CGPA (out of 10) -> 30 points
  const cgpaScore = Math.min(30, (student.cgpa / 10) * 30);
  breakdown.push({ label: "Academic CGPA", value: Math.round(cgpaScore), max: 30 });

  // Skills -> 25 points (count * avg level)
  const skills = student.skills ?? [];
  const skillPoints = skills.length
    ? Math.min(25, (skills.reduce((s, sk) => s + sk.level, 0) / (skills.length * 5)) * 25)
    : 0;
  breakdown.push({ label: "Technical Skills", value: Math.round(skillPoints), max: 25 });

  // Projects -> 20 points
  const projScore = Math.min(20, (student.projects?.length ?? 0) * 7);
  breakdown.push({ label: "Projects", value: Math.round(projScore), max: 20 });

  // Internships -> 15 points
  const internScore = Math.min(15, (student.internships?.length ?? 0) * 8);
  breakdown.push({ label: "Internships", value: Math.round(internScore), max: 15 });

  // Certifications -> 10 points
  const certScore = Math.min(10, (student.certifications?.length ?? 0) * 4);
  breakdown.push({ label: "Certifications", value: Math.round(certScore), max: 10 });

  // Bonus: achievements (up to 5) + academics history (up to 5)
  const achBonus = Math.min(5, (student.achievements?.length ?? 0) * 2);
  const acadBonus =
    (student.tenthPct ? Math.min(2.5, (student.tenthPct / 100) * 2.5) : 0) +
    (student.twelfthPct ? Math.min(2.5, (student.twelfthPct / 100) * 2.5) : 0);
  breakdown.push({
    label: "Achievements & Academics",
    value: Math.round(achBonus + acadBonus),
    max: 10,
  });

  const score = Math.min(
    100,
    Math.round(breakdown.reduce((sum, b) => sum + b.value, 0)),
  );

  return { score, breakdown };
}

export { readinessLevelFromScore };
