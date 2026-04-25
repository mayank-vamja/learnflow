import Link from "next/link";
import { AppShell } from "./components/AppShell";

export default function Home() {
  return (
    <AppShell title="Duolingo + ChatGPT + personal mentor, powered by real-time adaptive learning pulse.">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Welcome</h2>
          <p className="mt-2 text-sm text-white/80">
            Pick a view to demo: the Learner experience, the Admin command center, or exportable Reports.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="pill-btn" href="/learner">
              I’m a Learner
            </Link>
            <Link className="pill-btn-alt" href="/admin">
              I’m an Admin
            </Link>
            <Link className="pill-btn-alt" href="/reports">
              Open Reports
            </Link>
          </div>
        </article>

        <article className="surface p-5">
          <h2 className="text-lg font-semibold">What you’re selling</h2>
          <div className="mt-4 grid gap-3">
            <div className="dashboard-card">
              <p>Pitch</p>
              <strong>AI Learning OS for enterprise upskilling</strong>
            </div>
            <div className="dashboard-card">
              <p>Hook</p>
              <strong>Adaptive learning pulse + weak-area detection</strong>
            </div>
            <div className="dashboard-card">
              <p>Output</p>
              <strong>Assignments + analytics + proof-of-value exports</strong>
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
