"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart as PieIcon, TrendingUp, Trophy } from "lucide-react";
import type { DashboardStats } from "@/lib/types";
import type { InsightsResponse } from "@/lib/api-client";

const LEVEL_COLORS: Record<string, string> = {
  "Not Ready": "#f43f5e",
  Developing: "#f59e0b",
  Ready: "#22c55e",
  "Highly Ready": "#10b981",
};

const BRANCH_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#fbbf24", "#f59e0b", "#fb923c", "#f87171"];

function ChartCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function InsightsPanel({
  insights,
}: {
  insights: InsightsResponse | null;
}) {
  const { stats, scoreBuckets } = insights ?? {
    stats: null,
    scoreBuckets: [],
  };

  const readinessData = (stats?.readinessDistribution ?? []).filter(
    (d) => d.count > 0,
  );
  const branchData = stats?.branchDistribution ?? [];
  const skillData = (stats?.topSkills ?? []).slice(0, 7);
  const hasData = (stats?.analyzedStudents ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Readiness Distribution"
        description="Students grouped by AI readiness level"
        icon={PieIcon}
      >
        {hasData && readinessData.length > 0 ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="h-[180px] w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={readinessData}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {readinessData.map((entry) => (
                      <Cell key={entry.level} fill={LEVEL_COLORS[entry.level] ?? "#10b981"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-full flex-col gap-1.5">
              {readinessData.map((d) => (
                <div key={d.level} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: LEVEL_COLORS[d.level] ?? "#10b981" }}
                  />
                  <span className="text-muted-foreground">{d.level}</span>
                  <span className="ml-auto font-medium tabular-nums">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyChart label="Analyze students to see readiness distribution" />
        )}
      </ChartCard>

      <ChartCard
        title="Readiness Score Spread"
        description="Histogram of student readiness scores"
        icon={TrendingUp}
      >
        {hasData && scoreBuckets.some((b) => b.count > 0) ? (
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="Analyze students to see score distribution" />
        )}
      </ChartCard>

      <ChartCard
        title="Students by Branch"
        description="Headcount across engineering branches"
        icon={BarChart3}
      >
        {branchData.length > 0 ? (
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="branch"
                  width={120}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {branchData.map((_, i) => (
                    <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="No students yet" />
        )}
      </ChartCard>

      <ChartCard
        title="Top Skills"
        description="Most common skills across students"
        icon={Trophy}
      >
        {skillData.length > 0 ? (
          <div className="flex h-[180px] w-full flex-col justify-center gap-2">
            {skillData.map((s, i) => {
              const max = skillData[0].count || 1;
              const pct = (s.count / max) * 100;
              return (
                <div key={s.skill} className="flex items-center gap-2 text-sm">
                  <span className="w-40 shrink-0 truncate text-muted-foreground" title={s.skill}>
                    {s.skill}
                  </span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-muted">
                    <div
                      className="h-full rounded-md bg-primary/80 transition-all"
                      style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right font-medium tabular-nums">
                    {s.count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChart label="No skills data yet" />
        )}
      </ChartCard>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
