"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Analysis, Student } from "@/lib/types";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { InsightsPanel } from "./insights-panel";
import { StudentList, type StudentFilters } from "./student-list";
import { StudentDetailDialog } from "./student-detail-dialog";
import { StudentFormDialog } from "./student-form-dialog";

const DEFAULT_FILTERS: StudentFilters = {
  search: "",
  branch: "all",
  status: "all",
  minScore: "all",
  sortBy: "updatedAt",
  order: "desc",
};

export function AppShell() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof api.getInsights>> | null>(
    null,
  );

  const [selected, setSelected] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadStudents = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const list = await api.listStudents({
          search: filters.search,
          branch: filters.branch === "all" ? "" : filters.branch,
          status: filters.status === "all" ? "" : filters.status,
          minScore: filters.minScore === "all" ? 0 : Number(filters.minScore),
          maxScore: 100,
          sortBy: filters.sortBy,
          order: filters.order,
        });
        if (!signal?.aborted) {
          setStudents(list);
        }
      } catch (e) {
        if (!signal?.aborted) {
          toast.error("Failed to load students");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [filters],
  );

  // Debounced search/filter effect
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      loadStudents(ctrl.signal);
    }, filters.search ? 250 : 0);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [loadStudents]);

  const loadInsights = useCallback(async () => {
    try {
      const data = await api.getInsights();
      setInsights(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const refreshAll = useCallback(async () => {
    await loadStudents();
    await loadInsights();
  }, [loadStudents, loadInsights]);

  // Handlers
  const handleView = (s: Student) => {
    setSelected(s);
    setDetailOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (s: Student) => {
    setEditing(s);
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleSaved = (s: Student) => {
    refreshAll();
    // if editing and currently selected, update selected
    setSelected((prev) => (prev && prev.id === s.id ? s : prev));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.id);
      toast.success(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
      refreshAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const handleAnalyze = async (s: Student) => {
    setAnalyzingId(s.id);
    try {
      const res = await api.analyzeStudent(s.id);
      // update student in list
      setStudents((prev) =>
        prev.map((st) =>
          st.id === s.id ? { ...st, analysis: res.analysis } : st,
        ),
      );
      setSelected((prev) =>
        prev && prev.id === s.id ? { ...prev, analysis: res.analysis } : prev,
      );
      await loadInsights();
      toast.success(`AI analysis complete for ${s.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleAnalyzedFromDetail = (studentId: string, analysis: Analysis) => {
    setStudents((prev) =>
      prev.map((st) =>
        st.id === studentId ? { ...st, analysis } : st,
      ),
    );
    setSelected((prev) =>
      prev && prev.id === studentId ? { ...prev, analysis } : prev,
    );
    loadInsights();
  };

  const handleBulkAnalyze = async () => {
    const unanalyzed = students.filter((s) => !s.analysis);
    if (unanalyzed.length === 0) {
      toast.info("All visible students are already analyzed.");
      return;
    }
    setBulkAnalyzing(true);
    let success = 0;
    for (const s of unanalyzed) {
      setAnalyzingId(s.id);
      try {
        const res = await api.analyzeStudent(s.id);
        setStudents((prev) =>
          prev.map((st) =>
            st.id === s.id ? { ...st, analysis: res.analysis } : st,
          ),
        );
        success++;
      } catch {
        // continue
      }
    }
    setAnalyzingId(null);
    setBulkAnalyzing(false);
    await loadInsights();
    toast.success(
      `Analyzed ${success} of ${unanalyzed.length} students.`,
    );
  };

  const unanalyzedCount = useMemo(
    () => students.filter((s) => !s.analysis).length,
    [students],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader onAddStudent={handleAdd} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        {/* Hero / intro */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Placement Readiness Dashboard
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Track student readiness, run AI-powered profile analysis, and
              surface actionable recommendations to improve placement outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleBulkAnalyze}
              disabled={bulkAnalyzing || unanalyzedCount === 0}
            >
              {bulkAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
              {bulkAnalyzing
                ? "Analyzing…"
                : `Analyze All${unanalyzedCount > 0 ? ` (${unanalyzedCount})` : ""}`}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsCards stats={insights?.stats ?? null} />
        </div>

        {/* Insights */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-semibold">Insights</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Live
            </span>
          </div>
          <InsightsPanel insights={insights} />
        </div>

        {/* Students */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Students</h2>
          </div>
          <StudentList
            students={students}
            filters={filters}
            loading={loading}
            analyzingId={analyzingId}
            onFiltersChange={setFilters}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(s) => setDeleteTarget(s)}
            onAnalyze={handleAnalyze}
          />
        </div>
      </main>

      <footer className="mt-auto border-t bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            PlaceReady — AI Placement Readiness Platform. Built for colleges to
            track and improve student placement outcomes.
          </p>
          <p>Powered by Gemini 3.5 Flash for AI-driven profile analysis.</p>
        </div>
      </footer>

      {/* Dialogs */}
      <StudentDetailDialog
        student={selected}
        open={detailOpen}
        onOpenChange={(v) => {
          setDetailOpen(v);
          if (!v) setSelected(null);
        }}
        onAnalyzed={handleAnalyzedFromDetail}
        onEdit={handleEdit}
      />
      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              and their AI analysis. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
