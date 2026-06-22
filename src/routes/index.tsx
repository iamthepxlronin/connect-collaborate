import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Users, Search, MessagesSquare, CircleCheckBig, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StuCollab — Find your project teammates" },
      { name: "description", content: "Post your project, browse collaborators by skill, and build the team you actually deserve — all in one place." },
      { property: "og:title", content: "StuCollab — Find your project teammates" },
      { property: "og:description", content: "Post your project, browse collaborators by skill, and build the team you actually deserve." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-paper text-ink overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-paper/90 backdrop-blur border-b border-edge">
        <Link to="/" className="font-semibold text-lg tracking-tight">
          StuCollab
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <a href="#how" className="hidden sm:inline text-sm font-medium text-muted px-4 py-2 rounded-full hover:bg-cream hover:text-ink transition">How it works</a>
          <a href="#features" className="hidden sm:inline text-sm font-medium text-muted px-4 py-2 rounded-full hover:bg-cream hover:text-ink transition">Features</a>
          <Link to="/auth" className="text-sm font-medium text-muted px-3 py-2 rounded-full hover:bg-cream hover:text-ink transition">Login</Link>
          <Link to="/auth" search={{ mode: "signup" }} className="text-sm font-semibold text-white bg-ink px-4 py-2 rounded-full hover:bg-coral hover:-translate-y-px transition">
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-70 pointer-events-none" />
        <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-amber blur-[70px] opacity-25 pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[380px] h-[380px] rounded-full bg-coral blur-[70px] opacity-25 pointer-events-none" />
        <div className="absolute bottom-24 right-20 w-[300px] h-[300px] rounded-full bg-sage blur-[70px] opacity-25 pointer-events-none" />

        <div className="relative z-10 inline-flex items-center gap-2 bg-cream border border-edge rounded-full px-4 py-1.5 text-xs font-semibold text-muted mb-7">
          <span className="w-2 h-2 rounded-full bg-sage" />
          Built for Faculty of Computing · Federal University Dutse
        </div>
        <h1 className="relative z-10 mb-7 font-serif font-black leading-[1.05] tracking-tight max-w-3xl text-[clamp(2.5rem,8vw,6rem)]">
          Find perfect<br />
          <em className="italic text-coral">teammates</em><br />
          for your next project
        </h1>
        <p className="relative z-10 max-w-lg mb-7 text-lg leading-relaxed text-muted">
          Post your project, browse collaborators by skill, and build the team you actually deserve — all in one place.
        </p>
        <div className="relative z-10 flex flex-wrap justify-center gap-4 mt-4">
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex font-semibold text-white bg-coral px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(232,93,58,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,93,58,0.4)] transition">
            Start collaborating →
          </Link>
          <a href="#how" className="inline-flex items-center justify-center text-base font-semibold text-ink px-6 py-3 rounded-full border-2 border-edge hover:border-ink hover:bg-cream transition">
            See how it works
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl font-black mb-4">How it <em className="italic text-sage">Works</em></h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">Three simple steps to find your ideal project team</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { n: 1, color: "coral", title: "Create your profile", desc: "Sign up and showcase your skills, interests, and the kind of projects you want to work on.", Icon: Users },
              { n: 2, color: "sage", title: "Post or browse projects", desc: "Share your project idea or explore opportunities posted by other students looking for collaborators.", Icon: Search },
              { n: 3, color: "amber", title: "Connect & collaborate", desc: "Apply to projects, review applications, and start building with your new team.", Icon: MessagesSquare },
            ].map(({ n, color, title, desc, Icon }) => (
              <div key={n} className={`relative bg-white rounded-3xl p-8 border-2 border-edge shadow-sm hover:shadow-xl hover:border-${color} transition-all group w-80`}>
                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-${color} text-white flex items-center justify-center font-bold shadow-lg`}>{n}</div>
                <div className={`w-14 h-14 rounded-2xl bg-${color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 font-serif">
              Built for <em className="italic text-coral">collaboration</em>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Everything you need to find teammates and manage project applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { Icon: CircleCheckBig, color: "coral", title: "Skill-based matching", desc: "Tag your projects with required skills — React, Python, UI/UX, Data Science — and find teammates with exactly what you need." },
              { Icon: Zap, color: "sage", title: "Quick applications", desc: "Apply to projects with one click. Project owners can review and accept applications in seconds." },
              { Icon: Users, color: "amber", title: "Application dashboard", desc: "Track all your applications and project posts in one organized dashboard with status badges." },
              { Icon: Search, color: "coral", title: "Advanced filtering", desc: "Search and filter projects by category, required skills, project type, and more." },
            ].map(({ Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-edge hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral via-coral to-amber opacity-95" />
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="font-serif text-5xl font-black mb-6 leading-tight">
            Ready to build something <em className="italic">amazing</em>?
          </h2>
          <p className="text-xl mb-10 opacity-95 leading-relaxed">
            Join hundreds of students at Federal University Dutse finding teammates and building incredible projects together.
          </p>
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex font-semibold text-coral bg-white px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all">
            Start collaborating for free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-edge bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="font-bold text-lg">StuCollab</span>
            <div className="flex gap-8 text-sm text-muted">
              <a href="#how" className="hover:text-ink transition">How it works</a>
              <a href="#features" className="hover:text-ink transition">Features</a>
              <Link to="/auth" className="hover:text-ink transition">Login</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="hover:text-ink transition">Sign up</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-edge text-center text-sm text-muted">
            <p>&copy; 2026 StuCollab. Built for Faculty of Computing, Federal University Dutse.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
  );
}
