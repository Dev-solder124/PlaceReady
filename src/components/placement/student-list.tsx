"use client";

import { useMemo } from "react";
import {
  ArrowDownUp,
  Eye,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/types";
import { BRANCHES } from "@/lib/types";
import { ReadinessBadge } from "./readiness-badge";

export interface StudentFilters {
  search: string;
  branch: string;
  status: string;
  minScore: string;
  sortBy: string;
  order: "asc" | "desc";
}

const STATUSES = ["Active", "Looking", "Placed", "Not Looking"] as const;

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  Looking: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  Placed: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  "Not Looking": "bg-muted text-muted-foreground border-border",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StudentList({
  students,
  filters,
  loading,
  analyzingId,
  onFiltersChange,
  onView,
  onEdit,
  onDelete,
  onAnalyze,
}: {
  students: Student[];
  filters: StudentFilters;
  loading: boolean;
  analyzingId: string | null;
  onFiltersChange: (f: StudentFilters) => void;
  onView: (s: Student) => void;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
  onAnalyze: (s: Student) => void;
}) {
  const set = <K extends keyof StudentFilters>(k: K, v: StudentFilters[K]) => {
    onFiltersChange({ ...filters, [k]: v });
  };

  const hasActiveFilters = useMemo(
    () =>
      filters.search !== "" ||
      filters.branch !== "all" ||
      filters.status !== "all" ||
      filters.minScore !== "all",
    [filters],
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, roll no, branch…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
            <Select
              value={filters.branch}
              onValueChange={(v) => set("branch", v)}
            >
              <SelectTrigger className="w-full lg:w-[170px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {BRANCHES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(v) => set("status", v)}
            >
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.minScore}
              onValueChange={(v) => set("minScore", v)}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="Readiness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Readiness</SelectItem>
                <SelectItem value="80">Highly Ready (80+)</SelectItem>
                <SelectItem value="60">Ready (60+)</SelectItem>
                <SelectItem value="40">Developing (40+)</SelectItem>
                <SelectItem value="0">Not Ready (0+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Sort:</span>
          <Select
            value={filters.sortBy}
            onValueChange={(v) => set("sortBy", v)}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Recently Updated</SelectItem>
              <SelectItem value="createdAt">Recently Added</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="cgpa">CGPA</SelectItem>
              <SelectItem value="graduationYear">Graduation Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              set("order", filters.order === "asc" ? "desc" : "asc")
            }
          >
            {filters.order === "asc" ? "Ascending" : "Descending"}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() =>
                onFiltersChange({
                  search: "",
                  branch: "all",
                  status: "all",
                  minScore: "all",
                  sortBy: "updatedAt",
                  order: "desc",
                })
              }
            >
              Clear filters
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {students.length} student{students.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[220px]">Student</TableHead>
                <TableHead className="min-w-[150px]">Branch</TableHead>
                <TableHead className="hidden md:table-cell">CGPA</TableHead>
                <TableHead className="hidden lg:table-cell">Skills</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="min-w-[150px]">Readiness</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">No students found</p>
                      <p className="text-xs">
                        Try adjusting filters or add a new student.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => onView(s)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(s.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">
                            {s.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="line-clamp-1">{s.branch}</span>
                      <span className="text-xs text-muted-foreground">
                        Year {s.year} · {s.graduationYear}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-medium tabular-nums">{s.cgpa.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/10</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {s.skills.length} skills
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={cn("border", STATUS_BADGE[s.status] ?? "")}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.analysis ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-bold tabular-nums",
                              s.analysis.readinessScore >= 80
                                ? "text-emerald-600 dark:text-emerald-400"
                                : s.analysis.readinessScore >= 60
                                  ? "text-green-600 dark:text-green-400"
                                  : s.analysis.readinessScore >= 40
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {s.analysis.readinessScore}
                          </span>
                          <ReadinessBadge level={s.analysis.readinessLevel} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not analyzed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={analyzingId === s.id}
                                onClick={() => onAnalyze(s)}
                              >
                                {analyzingId === s.id ? (
                                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                                ) : (
                                  <Sparkles className="h-4 w-4 text-primary" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {s.analysis ? "Re-run AI analysis" : "Run AI analysis"}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onView(s)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View profile</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(s)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(s)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
