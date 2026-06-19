import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseStudent, studentInputToRecord } from "@/lib/student";
import type { StudentInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const branch = searchParams.get("branch")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const minScore = Number(searchParams.get("minScore") || 0);
    const maxScore = Number(searchParams.get("maxScore") || 100);
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const students = await db.student.findMany({
      orderBy: [{ [sortBy]: order }],
    });

    let parsed = students.map((s) => parseStudent(s));

    // Fetch analyses for score filtering in-memory
    const analyses = await db.analysis.findMany({
      where: { studentId: { in: parsed.map((p) => p.id) } },
    });
    const analysisMap = new Map(analyses.map((a) => [a.studentId, a]));
    parsed = parsed.map((p) => {
      const an = analysisMap.get(p.id);
      if (an) {
        p.analysis = {
          id: an.id,
          studentId: an.studentId,
          summary: an.summary,
          strengths: JSON.parse(an.strengths || "[]"),
          improvements: JSON.parse(an.improvements || "[]"),
          recommendedSkills: JSON.parse(an.recommendedSkills || "[]"),
          suggestedRoles: JSON.parse(an.suggestedRoles || "[]"),
          readinessScore: an.readinessScore,
          readinessLevel: an.readinessLevel as never,
          readinessReasoning: an.readinessReasoning,
          createdAt: an.createdAt.toISOString(),
          updatedAt: an.updatedAt.toISOString(),
        };
      }
      return p;
    });

    // Apply filters
    parsed = parsed.filter((s) => {
      if (search) {
        const hay = `${s.name} ${s.email} ${s.rollNumber ?? ""} ${s.branch}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (branch && s.branch !== branch) return false;
      if (status && s.status !== status) return false;
      if (s.analysis) {
        if (s.analysis.readinessScore < minScore) return false;
        if (s.analysis.readinessScore > maxScore) return false;
      } else {
        // unanalyzed students: include if minScore is 0
        if (minScore > 0) return false;
      }
      return true;
    });

    return NextResponse.json({ students: parsed });
  } catch (err) {
    console.error("[GET /api/students]", err);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StudentInput;

    // Basic validation
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!body.branch?.trim()) {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }
    if (body.cgpa == null || body.cgpa < 0 || body.cgpa > 10) {
      return NextResponse.json(
        { error: "CGPA must be between 0 and 10" },
        { status: 400 },
      );
    }

    const existing = await db.student.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A student with this email already exists" },
        { status: 409 },
      );
    }

    const record = studentInputToRecord(body);
    const created = await db.student.create({ data: record });
    return NextResponse.json({ student: parseStudent(created) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/students]", err);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
