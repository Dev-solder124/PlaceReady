"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderGit2,
  Github,
  GraduationCap,
  Lightbulb,
  Linkedin,
  Loader2,
  Mail,
  Phone,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Analysis, Student } from "@/lib/types";
import { api, type AnalyzeResponse } from "@/lib/api-client";
import { ScoreRing } from "./score-ring";
import { ReadinessBadge } from "./readiness-badge";

const SKILL_LEVEL_LABEL = ["", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"];

function skillBarColor(level: number) {
  if (level >= 4) return "bg-emerald-500";
  if (level >= 3) return "bg-green-500";
  if (level >= 2) return "bg-amber-500";
  return "bg-rose-500";
}

export function StudentDetailDialog({
  student,
  open,
  onOpenChange,
  onAnalyzed,
  onEdit,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAnalyzed?: (studentId: string, analysis: Analysis) => void;
  onEdit?: (s: Student) => void;
}) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [breakdown, setBreakdown] = useState<
    { label: string; value: number; max: number }[]
  >([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnalysis(student?.analysis ?? null);
    setBreakdown([]);
    setError(null);
  }, [student?.id, student?.analysis, open]);

  const runAnalysis = async () => {
    if (!student) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res: AnalyzeResponse = await api.analyzeStudent(student.id);
      setAnalysis(res.analysis);
      setBreakdown(res.breakdown);
      onAnalyzed?.(student.id, res.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze student");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!student) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <SheetTitle className="text-lg">{student.name}</SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>{student.branch}</span>
                  <span>·</span>
                  <span>Year {student.year}</span>
                  <span>·</span>
                  <span>Batch {student.graduationYear}</span>
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onOpenChange(false);
                onEdit?.(student);
              }}
            >
              Edit Profile
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] scrollbar-thin">
          <div className="space-y-6 px-6 py-6">
            {/* Contact & Links */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile icon={Mail} label="Email" value={student.email} />
              {student.phone && (
                <InfoTile icon={Phone} label="Phone" value={student.phone} />
              )}
              {student.rollNumber && (
                <InfoTile
                  icon={UserIcon}
                  label="Roll Number"
                  value={student.rollNumber}
                />
              )}
              <InfoTile
                icon={GraduationCap}
                label="CGPA"
                value={`${student.cgpa.toFixed(2)} / 10`}
              />
              {student.tenthPct != null && (
                <InfoTile
                  icon={FileText}
                  label="10th Score"
                  value={`${student.tenthPct}%`}
                />
              )}
              {student.twelfthPct != null && (
                <InfoTile
                  icon={FileText}
                  label="12th Score"
                  value={`${student.twelfthPct}%`}
                />
              )}
            </section>

            {/* Links */}
            {(student.linkedinUrl || student.githubUrl || student.resumeUrl) && (
              <div className="flex flex-wrap gap-2">
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )}
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )}
                {student.resumeUrl && (
                  <a
                    href={student.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Resume
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )}
              </div>
            )}

            <Separator />

            {/* Skills */}
            <Section title="Technical Skills" icon={Target}>
              {student.skills.length === 0 ? (
                <Empty text="No skills added." />
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {student.skills.map((sk) => (
                    <div key={sk.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{sk.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {SKILL_LEVEL_LABEL[sk.level]}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1.5 flex-1 rounded-full",
                              i <= sk.level ? skillBarColor(sk.level) : "bg-muted",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Projects */}
            <Section title="Projects" icon={FolderGit2} count={student.projects.length}>
              {student.projects.length === 0 ? (
                <Empty text="No projects listed." />
              ) : (
                <div className="space-y-3">
                  {student.projects.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-card p-3"
                    >
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                      {p.tech.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.tech.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="font-normal text-[10px]"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Internships */}
            <Section
              title="Internships"
              icon={Briefcase}
              count={student.internships.length}
            >
              {student.internships.length === 0 ? (
                <Empty text="No internships listed." />
              ) : (
                <div className="space-y-3">
                  {student.internships.map((i, idx) => (
                    <div key={idx} className="rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">
                          {i.role} · {i.company}
                        </p>
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          {i.duration}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {i.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Certifications & Achievements */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Section
                title="Certifications"
                icon={Award}
                count={student.certifications.length}
              >
                {student.certifications.length === 0 ? (
                  <Empty text="No certifications." />
                ) : (
                  <ul className="space-y-2">
                    {student.certifications.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.issuer} · {c.date}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section
                title="Achievements"
                icon={Trophy}
                count={student.achievements.length}
              >
                {student.achievements.length === 0 ? (
                  <Empty text="No achievements listed." />
                ) : (
                  <ul className="space-y-2">
                    {student.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>

            <Separator />

            {/* AI Analysis Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">AI Placement Analysis</h3>
                    <p className="text-xs text-muted-foreground">
                      AI-generated readiness assessment
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={runAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {analysis ? "Re-run" : "Analyze"}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {analyzing ? (
                <AnalysisSkeleton />
              ) : analysis ? (
                <div className="space-y-4">
                  {/* Score + level */}
                  <div className="flex flex-col items-center gap-4 rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5 sm:flex-row">
                    <ScoreRing score={analysis.readinessScore} level={analysis.readinessLevel} size={120} />
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <ReadinessBadge level={analysis.readinessLevel} />
                        <Badge variant="secondary" className="text-[10px]">
                          Updated {new Date(analysis.updatedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Placement Readiness Score
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">
                        {analysis.readinessReasoning}
                      </p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  {breakdown.length > 0 && (
                    <div className="rounded-lg border bg-card p-4">
                      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Score Composition
                      </p>
                      <div className="space-y-2.5">
                        {breakdown.map((b) => (
                          <div key={b.label} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{b.label}</span>
                              <span className="font-medium tabular-nums">
                                {b.value}/{b.max}
                              </span>
                            </div>
                            <Progress
                              value={(b.value / b.max) * 100}
                              className="h-1.5"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <AnalysisBlock title="Student Summary" icon={UserIcon}>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {analysis.summary}
                    </p>
                  </AnalysisBlock>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <AnalysisBlock
                      title="Strengths"
                      icon={CheckCircle2}
                      accent="emerald"
                    >
                      <ul className="space-y-1.5">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </AnalysisBlock>

                    <AnalysisBlock
                      title="Areas for Improvement"
                      icon={Lightbulb}
                      accent="amber"
                    >
                      <ul className="space-y-1.5">
                        {analysis.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </AnalysisBlock>

                    <AnalysisBlock
                      title="Recommended Skills"
                      icon={Target}
                      accent="primary"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.recommendedSkills.map((s, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="font-normal"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </AnalysisBlock>

                    <AnalysisBlock
                      title="Suggested Job Roles"
                      icon={Rocket}
                      accent="violet"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.suggestedRoles.map((s, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="font-normal"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </AnalysisBlock>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No analysis yet</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Run an AI analysis to generate a readiness score, summary,
                      strengths, improvement areas, and personalized
                      recommendations.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={runAnalysis}
                    disabled={analyzing}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate AI Analysis
                  </Button>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
        {count != null && count > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {count}
          </Badge>
        )}
      </div>
      {children}
    </section>
  );
}

function AnalysisBlock({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent?: "emerald" | "amber" | "primary" | "violet";
  children: React.ReactNode;
}) {
  const accentClass = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    primary: "text-primary",
    violet: "text-violet-600 dark:text-violet-400",
  }[accent ?? "primary"];
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className={cn("mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide", accentClass)}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed py-4 text-center text-xs text-muted-foreground">
      {text}
    </p>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-xl border p-5">
        <div className="h-[120px] w-[120px] rounded-full bg-muted/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-muted/60" />
          <div className="h-3 w-full rounded bg-muted/40" />
          <div className="h-3 w-3/4 rounded bg-muted/40" />
        </div>
      </div>
      <div className="h-24 rounded-lg bg-muted/40" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 rounded-lg bg-muted/40" />
        <div className="h-28 rounded-lg bg-muted/40" />
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Analyzing profile with AI…
      </div>
    </div>
  );
}

// Local Trophy icon import alias to avoid name clashes
function Trophy(props: React.ComponentProps<typeof Award>) {
  return <Award {...props} />;
}
