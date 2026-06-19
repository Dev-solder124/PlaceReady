import { cn } from "@/lib/utils";
import { type ReadinessLevel } from "@/lib/types";

function colorForScore(score: number): { stroke: string; text: string; bg: string } {
  if (score >= 80)
    return {
      stroke: "stroke-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    };
  if (score >= 60)
    return {
      stroke: "stroke-green-500",
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/40",
    };
  if (score >= 40)
    return {
      stroke: "stroke-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    };
  return {
    stroke: "stroke-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  };
}

export function ScoreRing({
  score,
  level,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  className,
}: {
  score: number;
  level?: ReadinessLevel;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const colors = colorForScore(score);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted/60"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn("transition-all duration-700 ease-out", colors.stroke)}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold tabular-nums", colors.text)} style={{ fontSize: size * 0.26 }}>
          {score}
        </span>
        {showLabel && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            / 100
          </span>
        )}
      </div>
    </div>
  );
}
