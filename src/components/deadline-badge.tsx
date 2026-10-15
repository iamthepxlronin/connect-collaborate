import { Clock } from "lucide-react";
import { daysUntil, deadlineLabel } from "@/lib/deadline";

export function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const l = deadlineLabel(daysUntil(deadline));
  if (!l) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${l.urgent ? "bg-coral/15 text-coral" : "bg-amber/20 text-amber"}`}>
      <Clock className="w-3 h-3" /> {l.text}
    </span>
  );
}
