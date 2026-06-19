import type {
  Student,
  StudentInput,
  Analysis,
  DashboardStats,
} from "./types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export interface InsightsResponse {
  stats: DashboardStats;
  scoreBuckets: { range: string; count: number }[];
}

export interface AnalyzeResponse {
  analysis: Analysis;
  breakdown: { label: string; value: number; max: number }[];
}

export const api = {
  async listStudents(params: {
    search?: string;
    branch?: string;
    status?: string;
    minScore?: number;
    maxScore?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  }): Promise<Student[]> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "" && v !== null) {
        qs.set(k, String(v));
      }
    }
    const res = await fetch(`/api/students?${qs.toString()}`, {
      cache: "no-store",
    });
    const data = await handle<{ students: Student[] }>(res);
    return data.students;
  },

  async getStudent(id: string): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, { cache: "no-store" });
    const data = await handle<{ student: Student }>(res);
    return data.student;
  },

  async createStudent(input: StudentInput): Promise<Student> {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await handle<{ student: Student }>(res);
    return data.student;
  },

  async updateStudent(id: string, input: StudentInput): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await handle<{ student: Student }>(res);
    return data.student;
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    await handle<{ success: boolean }>(res);
  },

  async analyzeStudent(
    id: string,
  ): Promise<AnalyzeResponse> {
    const res = await fetch(`/api/students/${id}/analyze`, {
      method: "POST",
    });
    return await handle<AnalyzeResponse>(res);
  },

  async getInsights(): Promise<InsightsResponse> {
    const res = await fetch("/api/insights", { cache: "no-store" });
    return await handle<InsightsResponse>(res);
  },
};
