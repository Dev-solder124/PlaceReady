import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseStudent, parseAnalysis, studentInputToRecord } from "@/lib/student";
import type { StudentInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: { analysis: true },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const parsed = parseStudent(student);
    if (student.analysis) {
      parsed.analysis = parseAnalysis(student.analysis);
    }
    return NextResponse.json({ student: parsed });
  } catch (err) {
    console.error("[GET /api/students/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as StudentInput;

    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (body.cgpa == null || body.cgpa < 0 || body.cgpa > 10) {
      return NextResponse.json(
        { error: "CGPA must be between 0 and 10" },
        { status: 400 },
      );
    }

    // email uniqueness check (excluding current)
    const dup = await db.student.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    });
    if (dup && dup.id !== id) {
      return NextResponse.json(
        { error: "Another student with this email already exists" },
        { status: 409 },
      );
    }

    const record = studentInputToRecord(body);
    const updated = await db.student.update({ where: { id }, data: record });
    return NextResponse.json({ student: parseStudent(updated) });
  } catch (err) {
    console.error("[PUT /api/students/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await db.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    await db.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/students/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
