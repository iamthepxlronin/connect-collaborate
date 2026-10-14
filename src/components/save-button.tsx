import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { fetchSavedIds, setSaved } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";

export function useSavedIds() {
  const { user } = useCurrentUser();
  return useQuery({ queryKey: ["saved", user?.id], queryFn: () => fetchSavedIds(user!.id), enabled: !!user });
}

export function SaveButton({ postId, className = "" }: { postId: string; className?: string }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const { data: ids = [] } = useSavedIds();
  const saved = ids.includes(postId);
  const m = useMutation({
    mutationFn: () => setSaved(user!.id, postId, !saved),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved"] }); toast.success(saved ? "Removed from saved" : "Saved for later"); },
    onError: () => toast.error("Couldn't update saved projects"),
  });
  return (
    <button
      type="button"
      aria-label={saved ? "Unsave project" : "Save project"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (user) m.mutate(); }}
      disabled={m.isPending}
      className={`p-2 rounded-full border-2 transition ${saved ? "bg-coral border-coral text-white" : "border-edge text-muted hover:border-coral hover:text-coral"} ${className}`}
    >
      <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
