"use client";

import {
  Award,
  CheckCircle2,
  Gauge,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent: string;
}

function StatCard({ title, value, hint, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">
            {value}
          </p>
          {hint && (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats }: { stats: DashboardStats | null }) {
  const avg = stats?.avgReadiness ?? 0;
  const analyzed = stats?.analyzedStudents ?? 0;
  const total = stats?.totalStudents ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={total}
        hint="Across all branches"
        icon={Users}
        accent="bg-primary/10 text-primary"
      />
      <StatCard
        title="Avg Readiness"
        value={analyzed > 0 ? `${avg}/100` : "—"}
        hint={
          analyzed > 0
            ? `${analyzed} of ${total} analyzed`
            : "No analyses yet"
        }
        icon={Gauge}
        accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      />
      <StatCard
        title="Placement Ready"
        value={stats?.readyCount ?? 0}
        hint="Ready + Highly Ready"
        icon={CheckCircle2}
        accent="bg-green-500/10 text-green-600 dark:text-green-400"
      />
      <StatCard
        title="Placed Students"
        value={stats?.placedCount ?? 0}
        hint="Secured offers"
        icon={Award}
        accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
      <Sparkles className="h-3 w-3" />
      AI-powered
    </span>
  );
}
