import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { toast } from "sonner";
import {
  SKILL_CATALOG,
  MAX_SKILL_LENGTH,
  normalizeSkill,
  type SkillOption,
} from "@/lib/stucollab-constants";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  label?: string;
  placeholder?: string;
};

export function SkillsCombobox({
  value,
  onChange,
  max,
  label = "Skills",
  placeholder = "Search skills e.g. React, Academic Writing…",
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    const selected = new Set(value.map((v) => v.toLowerCase()));
    const pool = SKILL_CATALOG.filter((s) => !selected.has(s.name.toLowerCase()));
    if (!q) return pool.slice(0, 10);
    const starts: SkillOption[] = [];
    const contains: SkillOption[] = [];
    for (const s of pool) {
      const n = s.name.toLowerCase();
      if (n.startsWith(q)) starts.push(s);
      else if (n.includes(q)) contains.push(s);
    }
    return [...starts, ...contains].slice(0, 10);
  }, [q, value]);

  const exactExists = matches.some((m) => m.name.toLowerCase() === q) ||
    value.some((v) => v.toLowerCase() === q);

  function add(raw: string) {
    const skill = normalizeSkill(raw);
    if (!skill) return;
    if (value.length >= max) {
      toast.error(`You can add up to ${max} skills`);
      return;
    }
    if (value.some((v) => v.toLowerCase() === skill.toLowerCase())) {
      toast.error(`"${skill}" is already added`);
      setQuery("");
      return;
    }
    onChange([...value, skill]);
    setQuery("");
    setOpen(true);
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div ref={wrapRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-muted">{label}</label>
        <span className={`text-xs font-semibold ${value.length >= max ? "text-coral" : "text-muted"}`}>
          {value.length}/{max}
        </span>
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={query}
              maxLength={MAX_SKILL_LENGTH}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  if (query.trim()) add(query);
                  else if (matches[0]) add(matches[0].name);
                } else if (e.key === "Escape") {
                  setOpen(false);
                } else if (e.key === "Backspace" && !query && value.length) {
                  remove(value[value.length - 1]);
                }
              }}
              placeholder={placeholder}
              disabled={value.length >= max}
              className="w-full pl-11 pr-4 py-3 border-2 border-edge rounded-2xl bg-white focus:outline-none focus:border-coral transition disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={() => add(query)}
            disabled={!query.trim() || value.length >= max}
            aria-label="Add skill"
            className="shrink-0 px-4 rounded-2xl border-2 border-edge bg-cream hover:border-coral hover:text-coral transition disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {open && value.length < max && (matches.length > 0 || (q && !exactExists)) && (
          <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto bg-white border-2 border-edge rounded-2xl shadow-lg py-1">
            {matches.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => add(s.name)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-cream transition"
              >
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-[11px] text-muted shrink-0">{s.group}</span>
              </button>
            ))}
            {q && !exactExists && (
              <button
                type="button"
                onClick={() => add(query)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-cream transition border-t border-edge"
              >
                <Plus className="w-3.5 h-3.5 text-coral" />
                <span className="text-sm">
                  Add custom: <strong>{normalizeSkill(query)}</strong>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cream border border-edge font-medium"
            >
              {s}
              <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s}`} className="text-muted hover:text-coral">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {value.length >= max && (
        <p className="text-xs text-coral">Maximum of {max} skills reached. Remove one to add another.</p>
      )}
    </div>
  );
}
