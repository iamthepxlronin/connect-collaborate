import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { fetchPosts, fetchProfile } from "@/lib/stucollab-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { skillMatch } from "@/lib/skill-match";
import { DEPARTMENTS } from "@/lib/stucollab-constants";
import { SaveButton } from "@/components/save-button";
import { DeadlineBadge } from "@/components/deadline-badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Browse projects — StuCollab" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useCurrentUser();
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
  const { data: me } = useQuery({ queryKey: ["profile", user?.id], queryFn: () => fetchProfile(user!.id), enabled: !!user });
  const mySkills = me?.skills ?? [];
  const mySet = useMemo(() => new Set(mySkills.map((s) => s.toLowerCase())), [mySkills]);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("all");
  const [dept, setDept] = useState("all");
  const [sort, setSort] = useState<"match" | "newest" | "oldest">("match");

  const allSkills = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.required_skills.forEach((sk) => s.add(sk)));
    return Array.from(s).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let r = posts
      .filter((p) => p.status === "open" && p.owner_id !== user?.id)
      .map((p) => ({ ...p, match: skillMatch(mySkills, p.required_skills) }));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (skill !== "all") r = r.filter((p) => p.required_skills.includes(skill));
    if (dept !== "all") r = r.filter((p) => p.owner?.department === dept);
    const byDate = (a: { created_at: string }, b: { created_at: string }) => +new Date(b.created_at) - +new Date(a.created_at);
    r = [...r].sort((a, b) =>
      sort === "match" ? (b.match ?? -1) - (a.match ?? -1) || byDate(a, b)
      : sort === "newest" ? byDate(a, b) : -byDate(a, b));
    return r;
  }, [posts, search, skill, dept, sort, user?.id, mySkills]);
  const hasFilters = !!search.trim() || skill !== "all" || dept !== "all";

  return (
    <div className="relative overflow-hidden min-h-full">
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute bottom-32 right-24 w-[420px] h-[420px] rounded-full bg-amber blur-[80px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-[320px] h-[320px] rounded-full bg-coral blur-[80px] opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-10 grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-2 min-w-0">
            <h1 className="font-serif text-3xl sm:text-5xl font-black mb-2 sm:mb-4 leading-tight">
              Explore <em className="italic text-coral">projects</em>
            </h1>
            <p className="text-sm sm:text-lg text-muted max-w-2xl">
              Find the perfect project to collaborate on and connect with talented teammates.
            </p>
          </div>
          <div className="flex items-start justify-end shrink-0">
            <div className="bg-white border-2 border-edge rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm">
              <p className="text-xs sm:text-sm text-muted mb-1">Open</p>
              <p className="font-serif text-2xl sm:text-3xl font-black text-ink">{isLoading ? "–" : filtered.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border-2 border-edge p-4 sm:p-6 lg:p-8 mb-8">
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-12 sm:pl-14 pr-5 py-3 sm:py-4 border-2 border-edge bg-cream/30 rounded-2xl focus:outline-none focus:border-coral focus:bg-white transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Filter className="w-4 h-4 text-muted" />
              <span className="text-sm font-semibold">Filters:</span>
            </div>
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as never)} className={filterCls}>
              <option value="match">Best match for you</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <select aria-label="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} className={filterCls}>
              <option value="all">All skills</option>
              {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)} className={filterCls}>
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setSkill("all"); setDept("all"); }} className="sm:ml-auto px-4 py-2 text-sm text-coral hover:bg-cream rounded-xl font-semibold transition">
                Clear all
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border-2 border-edge animate-pulse">
                <div className="h-3 w-24 bg-cream rounded mb-4" />
                <div className="h-6 w-3/4 bg-cream rounded mb-3" />
                <div className="h-3 w-full bg-cream rounded mb-2" />
                <div className="h-3 w-5/6 bg-cream rounded mb-6" />
                <div className="flex gap-2"><div className="h-6 w-16 bg-cream rounded-full" /><div className="h-6 w-20 bg-cream rounded-full" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white border-2 border-dashed border-edge rounded-3xl py-12 sm:py-16 px-6">
            <p className="font-serif text-xl font-bold mb-2">{hasFilters ? "Nothing matches those filters" : "No open projects yet"}</p>
            <p className="text-muted mb-5 text-sm">{hasFilters ? "Try a different skill or clear your filters." : "Start one and invite classmates to join you."}</p>
            {hasFilters ? (
              <button onClick={() => { setSearch(""); setSkill("all"); setDept("all"); }} className="inline-flex font-semibold text-coral border-2 border-coral px-5 py-2.5 rounded-full transition">Clear filters</button>
            ) : (
              <Link to="/posts/new" className="inline-flex font-semibold text-white bg-coral px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition">
                Post a project →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((post) => (
              <Link key={post.id} to="/posts/$postId" params={{ postId: post.id }} className="group bg-white rounded-3xl p-6 border-2 border-edge hover:border-coral hover:shadow-xl transition-all flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sage">{post.category}</span>
                  <div className="flex items-center gap-2"><DeadlineBadge deadline={post.deadline} /><SaveButton postId={post.id} /></div>
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2 leading-snug group-hover:text-coral transition">{post.title}</h3>
                <p className="text-sm text-muted line-clamp-3 mb-4 flex-1">{post.description}</p>
                {post.match !== null && post.match > 0 && (
                  <span className={`self-start mb-3 text-xs font-bold px-2.5 py-1 rounded-full ${post.match >= 70 ? "bg-sage/20 text-sage" : post.match >= 30 ? "bg-amber/20 text-amber" : "bg-cream text-muted"}`}>
                    {post.match >= 70 ? "🎯" : "⚡"} {post.match}% match
                  </span>
                )}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.required_skills.slice(0, 4).map((s) => (
                    <span key={s} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${mySet.has(s.toLowerCase()) ? "bg-sage/15 border-sage text-ink" : "bg-cream border-edge"}`}>{s}</span>
                  ))}
                </div>
                <div className="pt-4 border-t border-edge text-xs text-muted">
                  by <span className="font-semibold text-ink">{post.owner?.full_name ?? "Unknown"}</span>
                  {post.owner?.department && <> · {post.owner.department}</>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const filterCls = "w-full sm:w-auto px-4 py-2.5 sm:py-1.5 border-2 border-edge rounded-xl text-sm bg-white hover:bg-cream transition shadow-sm font-medium";