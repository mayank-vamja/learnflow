"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { conceptPacks } from "@/lib/learning/packs";
import {
  addEvent,
  getSelectedLearner,
  makeId,
  loadModel,
  saveModel,
  selectLearner,
  setAssignment,
  type Assignment,
  type Learner,
  type LearnerRole,
  type OrgModelV1,
  upsertLearnerProgress,
  recomputeCompletion,
} from "@/lib/storage/localModel";
import { computeTeamAnalytics } from "@/lib/analytics/teamAnalytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminPage() {
  const [model, setModel] = useState<OrgModelV1>(() => loadModel());
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<LearnerRole>("Engineer");
  const [assignPackId, setAssignPackId] = useState<Assignment["packId"]>("sql");
  const [assignDaily, setAssignDaily] = useState(30);
  const [assignWeeks, setAssignWeeks] = useState(4);

  useEffect(() => {
    saveModel(model);
  }, [model]);

  const selectedLearner = useMemo(() => getSelectedLearner(model), [model]);

  const selectedAssignment = useMemo(() => {
    if (!selectedLearner) return null;
    return model.assignments.find((a) => a.learnerId === selectedLearner.id) ?? null;
  }, [model, selectedLearner]);

  const selectedProgress = useMemo(() => {
    if (!selectedLearner || !selectedAssignment) return null;
    return model.progress.find((p) => p.learnerId === selectedLearner.id && p.packId === selectedAssignment.packId) ?? null;
  }, [model, selectedLearner, selectedAssignment]);

  const analytics = useMemo(() => computeTeamAnalytics(model), [model]);

  const createLearner = () => {
    const name = newName.trim();
    if (!name) return;
    const learner: Learner = { id: makeId("learner"), name, role: newRole, createdAt: Date.now() };
    const next: OrgModelV1 = {
      ...model,
      learners: [learner, ...model.learners],
      selectedLearnerId: learner.id,
    };
    setModel(next);
    setNewName("");
  };

  const setSelectedLearnerId = (learnerId: string) => {
    setModel(selectLearner(model, learnerId));
  };

  const applyAssignment = () => {
    if (!selectedLearner) return;
    const assignment: Assignment = {
      learnerId: selectedLearner.id,
      packId: assignPackId,
      dailyMinutes: Math.max(10, assignDaily),
      targetWeeks: Math.max(1, assignWeeks),
      assignedAt: Date.now(),
    };

    // Ensure progress record exists for this learner+pack.
    const baseMetrics = { confusion: 64, confidence: 42, mastery: 35, streak: 0, weakArea: "Rollout confidence" };
    const completion = recomputeCompletion({ mastery: baseMetrics.mastery, confidence: baseMetrics.confidence });
    const nextProgress = {
      learnerId: selectedLearner.id,
      packId: assignment.packId,
      sessionLessonIdx: 0,
      metrics: { ...baseMetrics, completion },
      quizScore: null,
      lastUpdatedAt: Date.now(),
    };

    let next = setAssignment(model, assignment);
    next = upsertLearnerProgress(next, nextProgress);
    next = addEvent(next, {
      id: makeId("evt"),
      learnerId: selectedLearner.id,
      packId: assignment.packId,
      lessonId: "assignment",
      ts: Date.now(),
      type: "pulse",
      delta: { confidence: 0, confusion: 0, mastery: 0, streak: 0 },
    });

    setModel(next);
  };

  return (
    <AppShell title="B2B command center: assign learning, track weak areas, export proof-of-value.">
      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="mt-2 text-sm text-white/80">
            Manage learners and assign roadmaps. (Analytics comes next.)
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-card">
              <p>Team learners</p>
              <strong>{model.learners.length}</strong>
            </div>
            <div className="dashboard-card">
              <p>Risk flags</p>
              <strong>{model.events.filter((e) => e.type === "quickCheck" && e.correct === false).length}</strong>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-violet-200">Learners</p>
            <div className="mt-3 space-y-2">
              {model.learners.map((l) => {
                const active = model.selectedLearnerId === l.id;
                return (
                  <div className="roadmap-row" key={l.id}>
                    <div>
                      <p className="font-medium">{l.name}</p>
                      <p className="text-xs text-white/70">{l.role}</p>
                    </div>
                    <button type="button" className={active ? "pill-btn" : "pill-btn-alt"} onClick={() => setSelectedLearnerId(l.id)}>
                      {active ? "Selected" : "Select"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Assignments</h2>
          <p className="mt-2 text-sm text-white/80">
            Assign a pack + pace targets to the selected learner. Learner view will reflect this (wired next).
          </p>

          <div className="mt-4 grid gap-3">
            <div className="dashboard-card">
              <p>Selected learner</p>
              <strong>{selectedLearner ? selectedLearner.name : "None"}</strong>
            </div>
            <div className="dashboard-card">
              <p>Current assignment</p>
              <strong>{selectedAssignment ? `${selectedAssignment.packId.toUpperCase()} · ${selectedAssignment.dailyMinutes}m/day` : "Unassigned"}</strong>
            </div>
            <div className="dashboard-card">
              <p>Current completion</p>
              <strong>{selectedProgress ? `${selectedProgress.metrics.completion}%` : "—"}</strong>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="field">
              New learner name
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Priya" />
            </label>
            <label className="field">
              Role
              <input value={newRole} onChange={(e) => setNewRole(e.target.value as LearnerRole)} placeholder="Engineer" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="pill-btn" type="button" onClick={createLearner} disabled={!newName.trim()}>
              Create learner
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <label className="field">
              Pack
              <input value={assignPackId} onChange={(e) => setAssignPackId(e.target.value as Assignment["packId"])} placeholder="sql" />
            </label>
            <label className="field">
              Daily minutes
              <input value={String(assignDaily)} onChange={(e) => setAssignDaily(Number(e.target.value || 0))} placeholder="30" />
            </label>
            <label className="field">
              Target weeks
              <input value={String(assignWeeks)} onChange={(e) => setAssignWeeks(Number(e.target.value || 0))} placeholder="4" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="pill-btn-alt" type="button" onClick={() => setAssignPackId("sql")}>
              SQL
            </button>
            <button className="pill-btn-alt" type="button" onClick={() => setAssignPackId("k8s")}>
              K8s
            </button>
            <button className="pill-btn" type="button" onClick={applyAssignment} disabled={!selectedLearner}>
              Assign roadmap
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-violet-200">Available packs</p>
            <div className="mt-3 space-y-2">
              {conceptPacks.map((p) => (
                <div className="roadmap-row" key={p.id}>
                  <div>
                    <p className="font-medium">{p.label}</p>
                    <p className="text-xs text-white/70">{p.roadmap.length} roadmap items · {p.lessons.length} micro lessons</p>
                  </div>
                  <span className="status-pending">Next</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="mt-2 text-sm text-white/80">Team completion snapshot (client-only, computed from learner progress).</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.completionSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.65)" />
                <YAxis stroke="rgba(255,255,255,0.65)" />
                <Tooltip
                  contentStyle={{ background: "rgba(16, 20, 43, 0.92)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16 }}
                  labelStyle={{ color: "rgba(255,255,255,0.85)" }}
                />
                <Legend />
                <Bar dataKey="completion" name="Completion" fill="rgba(214, 188, 255, 0.85)" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="surface p-5">
          <h2 className="text-lg font-semibold">Weak Area leaderboard</h2>
          <p className="mt-2 text-sm text-white/80">What the team is struggling with (top signals to sell ROI).</p>
          <div className="mt-4 space-y-2">
            {analytics.weakAreas.map((w) => (
              <div className="roadmap-row" key={w.weakArea}>
                <div>
                  <p className="font-medium">{w.weakArea}</p>
                  <p className="text-xs text-white/70">Impacted learners</p>
                </div>
                <span className="status-pending">{w.count}</span>
              </div>
            ))}
            {analytics.weakAreas.length === 0 ? (
              <p className="text-sm text-white/70">No signals yet. Run a few quizzes in Learner view.</p>
            ) : null}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

