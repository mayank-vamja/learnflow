"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { loadModel, saveModel, type OrgModelV1 } from "@/lib/storage/localModel";
import { buildReportPayload, buildReportRowsForCSV, downloadTextFile, toCSV } from "@/lib/reports/exporters";
import { computeTeamAnalytics } from "@/lib/analytics/teamAnalytics";

export default function ReportsPage() {
  const [model, setModel] = useState<OrgModelV1>(() => loadModel());

  useEffect(() => {
    saveModel(model);
  }, [model]);

  const analytics = useMemo(() => computeTeamAnalytics(model), [model]);
  const payload = useMemo(() => buildReportPayload(model), [model]);

  return (
    <AppShell title="Shareable outcomes: printable report + export downloads.">
      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="mt-2 text-sm text-white/80">
            Printable “proof-of-value” report with export (CSV/JSON). This is client-only and demo-safe.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="pill-btn"
              type="button"
              onClick={() => {
                const rows = buildReportRowsForCSV(model);
                downloadTextFile(`learnflow-report-${model.org.name}.csv`, toCSV(rows), "text/csv");
              }}
            >
              Download CSV
            </button>
            <button
              className="pill-btn-alt"
              type="button"
              onClick={() => downloadTextFile(`learnflow-report-${model.org.name}.json`, JSON.stringify(payload, null, 2), "application/json")}
            >
              Download JSON
            </button>
            <button className="pill-btn-alt" type="button" onClick={() => setModel(loadModel())}>
              Refresh from storage
            </button>
          </div>
        </article>
        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Preview</h2>
          <p className="mt-2 text-sm text-white/80">This is the exact “exec summary” you can screenshot or print.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-card">
              <p>Org</p>
              <strong>{model.org.name}</strong>
            </div>
            <div className="dashboard-card">
              <p>Generated</p>
              <strong>{new Date(payload.generatedAt).toLocaleString()}</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-card">
              <p>Learners</p>
              <strong>{analytics.rows.length}</strong>
            </div>
            <div className="dashboard-card">
              <p>Top weak area</p>
              <strong>{analytics.weakAreas[0]?.weakArea ?? "—"}</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-card">
              <p>Video plays</p>
              <strong>{analytics.usage.videoPlays}</strong>
            </div>
            <div className="dashboard-card">
              <p>Voice success</p>
              <strong>
                {analytics.usage.voiceSuccessRate}% ({analytics.usage.voiceSuccess}/{analytics.usage.voiceAttempts})
              </strong>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-violet-200">Learner snapshot</p>
            <div className="mt-3 space-y-2">
              {analytics.rows.slice(0, 6).map((r) => (
                <div className="roadmap-row" key={r.learnerId + r.packId}>
                  <div>
                    <p className="font-medium">
                      {r.learnerName} <span className="text-white/60">· {r.role}</span>
                    </p>
                    <p className="text-xs text-white/70">Weak area: {r.weakArea}</p>
                  </div>
                  <span className="status-pending">{r.completion}%</span>
                </div>
              ))}
              {analytics.rows.length === 0 ? <p className="text-sm text-white/70">No learners yet. Create them in Admin.</p> : null}
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}

