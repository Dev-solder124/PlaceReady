// Shared domain types for the Placement Readiness Platform

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  name: string;
  level: SkillLevel; // 1 (Beginner) -> 5 (Expert)
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Internship {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export type StudentStatus = "Active" | "Placed" | "Looking" | "Not Looking";

export type ReadinessLevel =
  | "Not Ready"
  | "Developing"
  | "Ready"
  | "Highly Ready";

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  rollNumber?: string | null;
  branch: string;
  year: number;
  graduationYear: number;
  cgpa: number;
  tenthPct?: number | null;
  twelfthPct?: number | null;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  internships: Internship[];
  achievements: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  resumeUrl?: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  analysis?: Analysis | null;
}

export interface Analysis {
  id: string;
  studentId: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendedSkills: string[];
  suggestedRoles: string[];
  readinessScore: number; // 0-100
  readinessLevel: ReadinessLevel;
  readinessReasoning: string;
  createdAt: string;
  updatedAt: string;
}

// Raw student as stored in the DB (JSON fields are strings)
export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  rollNumber?: string | null;
  branch: string;
  year: number;
  graduationYear: number;
  cgpa: number;
  tenthPct?: number | null;
  twelfthPct?: number | null;
  skills: string;
  projects: string;
  certifications: string;
  internships: string;
  achievements: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  resumeUrl?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentInput {
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  branch: string;
  year: number;
  graduationYear: number;
  cgpa: number;
  tenthPct?: number;
  twelfthPct?: number;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  internships: Internship[];
  achievements: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  status?: StudentStatus;
}

export interface DashboardStats {
  totalStudents: number;
  analyzedStudents: number;
  avgReadiness: number;
  placedCount: number;
  readyCount: number;
  developingCount: number;
  notReadyCount: number;
  branchDistribution: { branch: string; count: number }[];
  readinessDistribution: { level: string; count: number }[];
  topSkills: { skill: string; count: number }[];
}

export const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Aerospace",
] as const;

export const SKILL_SUGGESTIONS = [
  "Data Structures & Algorithms",
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Power BI",
  "Tableau",
  "Excel",
  "Communication",
  "Leadership",
  "Project Management",
  "Git",
  "Linux",
  "REST APIs",
  "GraphQL",
  "Kubernetes",
  "CI/CD",
  "DevOps",
  "Cybersecurity",
] as const;

export function readinessLevelFromScore(score: number): ReadinessLevel {
  if (score >= 80) return "Highly Ready";
  if (score >= 60) return "Ready";
  if (score >= 40) return "Developing";
  return "Not Ready";
}

export function readinessColor(level: ReadinessLevel): string {
  switch (level) {
    case "Highly Ready":
      return "text-emerald-600";
    case "Ready":
      return "text-green-600";
    case "Developing":
      return "text-amber-600";
    case "Not Ready":
      return "text-rose-600";
  }
}

export function readinessBadgeClass(level: ReadinessLevel): string {
  switch (level) {
    case "Highly Ready":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900";
    case "Ready":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900";
    case "Developing":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900";
    case "Not Ready":
      return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900";
  }
}
