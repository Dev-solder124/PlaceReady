import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseStudent } from "@/lib/student";
import type { DashboardStats, Skill } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/insights
// Aggregated dashboard statistics for placement readiness tracking.
export async function GET(_req: NextRequest) {
  try {
    const students = await db.student.findMany({ include: { analysis: true } });
    const analyses = students
      .map((s) => s.analysis)
      .filter((a): a is NonNullable<typeof a> => a !== null);

    const totalStudents = students.length;
    const analyzedStudents = analyses.length;

    const avgReadiness =
      analyzedStudents > 0
        ? Math.round(
            analyses.reduce((sum, a) => sum + a.readinessScore, 0) /
              analyzedStudents,
          )
        : 0;

    const placedCount = students.filter((s) => s.status === "Placed").length;

    const readyCount = analyses.filter(
      (a) => a.readinessLevel === "Ready" || a.readinessLevel === "Highly Ready",
    ).length;
    const developingCount = analyses.filter(
      (a) => a.readinessLevel === "Developing",
    ).length;
    const notReadyCount = analyses.filter(
      (a) => a.readinessLevel === "Not Ready",
    ).length;

    // Branch distribution
    const branchMap = new Map<string, number>();
    for (const s of students) {
      branchMap.set(s.branch, (branchMap.get(s.branch) || 0) + 1);
    }
    const branchDistribution = Array.from(branchMap.entries())
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count);

    // Readiness distribution by level (for analyzed students only)
    const readinessDistribution = [
      { level: "Not Ready", count: notReadyCount },
      { level: "Developing", count: developingCount },
      { level: "Ready", count: analyses.filter((a) => a.readinessLevel === "Ready").length },
      { level: "Highly Ready", count: analyses.filter((a) => a.readinessLevel === "Highly Ready").length },
    ];

    // Top skills across all students
    const skillMap = new Map<string, number>();
    for (const s of students) {
      const parsed = parseStudent(s);
      for (const sk of parsed.skills as Skill[]) {
        const key = sk.name;
        skillMap.set(key, (skillMap.get(key) || 0) + 1);
      }
    }
    const topSkills = Array.from(skillMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Readiness score buckets for histogram
    const scoreBuckets = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
    for (const a of analyses) {
      const idx = Math.min(4, Math.floor(a.readinessScore / 20));
      scoreBuckets[idx]++;
    }

    const stats: DashboardStats = {
      totalStudents,
      analyzedStudents,
      avgReadiness,
      placedCount,
      readyCount,
      developingCount,
      notReadyCount,
      branchDistribution,
      readinessDistribution,
      topSkills,
    };

    return NextResponse.json({
      stats,
      scoreBuckets: [
        { range: "0-20", count: scoreBuckets[0] },
        { range: "20-40", count: scoreBuckets[1] },
        { range: "40-60", count: scoreBuckets[2] },
        { range: "60-80", count: scoreBuckets[3] },
        { range: "80-100", count: scoreBuckets[4] },
      ],
    });
  } catch (err) {
    console.error("[GET /api/insights]", err);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 },
    );
  }
}
