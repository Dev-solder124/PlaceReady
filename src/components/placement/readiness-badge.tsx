import { cn } from "@/lib/utils";
import {
  type ReadinessLevel,
  readinessBadgeClass,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function ReadinessBadge({
  level,
  className,
}: {
  level: ReadinessLevel;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        readinessBadgeClass(level),
        className,
      )}
    >
      {level}
    </Badge>
  );
}
