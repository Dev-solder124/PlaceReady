import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseStudent, parseAnalysis } from "@/lib/student";
import { analyzeStudent } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/students/[id]/analyze
// Runs AI analysis on the student profile and persists the result.
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const record = await db.student.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = parseStudent(record);

    const analysis = await analyzeStudent(student);

    // Upsert analysis
    const saved = await db.analysis.upsert({
      where: { studentId: id },
      create: {
        studentId: id,
        summary: analysis.summary,
        strengths: JSON.stringify(analysis.strengths),
        improvements: JSON.stringify(analysis.improvements),
        recommendedSkills: JSON.stringify(analysis.recommendedSkills),
        suggestedRoles: JSON.stringify(analysis.suggestedRoles),
        readinessScore: analysis.readinessScore,
        readinessLevel: analysis.readinessLevel,
        readinessReasoning: analysis.readinessReasoning,
      },
      update: {
        summary: analysis.summary,
        strengths: JSON.stringify(analysis.strengths),
        improvements: JSON.stringify(analysis.improvements),
        recommendedSkills: JSON.stringify(analysis.recommendedSkills),
        suggestedRoles: JSON.stringify(analysis.suggestedRoles),
        readinessScore: analysis.readinessScore,
        readinessLevel: analysis.readinessLevel,
        readinessReasoning: analysis.readinessReasoning,
      },
    });

    return NextResponse.json({
      analysis: parseAnalysis(saved),
      breakdown: analysis.breakdown,
    });
  } catch (err) {
    console.error("[POST /api/students/[id]/analyze]", err);
    return NextResponse.json(
      { error: "Failed to analyze student" },
      { status: 500 },
    );
  }
}
