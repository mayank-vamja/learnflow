"use client";

import { useMemo, useState } from "react";

type PulseMode =
  | "Simple"
  | "Analogy"
  | "Visual"
  | "Revision"
  | "Challenge"
  | "Mentor";

type LessonCard = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  conceptTags: string[];
  mode: PulseMode;
  content: string;
  checkpoint: {
    prompt: string;
    options: { id: "a" | "b" | "c" | "d"; label: string; correct: boolean }[];
    weakArea: string;
  };
};

type ConceptPack = {
  id: string;
  label: string;
  roadmap: { id: number; title: string; level: "Beginner" | "Intermediate" | "Advanced" }[];
  lessons: LessonCard[];
};

const conceptPacks: ConceptPack[] = [
  {
    id: "k8s",
    label: "Kubernetes",
    roadmap: [
      { id: 1, title: "Kubernetes Foundations", level: "Beginner" },
      { id: 2, title: "Pods, ReplicaSets, Deployments", level: "Beginner" },
      { id: 3, title: "Services, Ingress, Networking", level: "Intermediate" },
      { id: 4, title: "ConfigMaps, Secrets, Storage", level: "Intermediate" },
      { id: 5, title: "Scaling, Monitoring, Debugging", level: "Advanced" },
    ],
    lessons: [
      {
        id: "k8s-1",
        title: "Pods + Deployments (the core loop)",
        level: "Beginner",
        conceptTags: ["Pods", "Deployments"],
        mode: "Simple",
        content:
          "A Pod runs one or more tightly-coupled containers. A Deployment manages Pods for you: it keeps the right number running and updates them safely.",
        checkpoint: {
          prompt: "Which Kubernetes object maintains desired Pod count?",
          options: [
            { id: "a", label: "Pod", correct: false },
            { id: "b", label: "Deployment", correct: true },
            { id: "c", label: "Service", correct: false },
            { id: "d", label: "ConfigMap", correct: false },
          ],
          weakArea: "desired state vs current state",
        },
      },
      {
        id: "k8s-2",
        title: "Rollouts + safety",
        level: "Intermediate",
        conceptTags: ["Rollouts", "ReplicaSets"],
        mode: "Challenge",
        content:
          "Challenge: if one Pod crashes under a Deployment with replicas=3, what should happen? Expected answer: Kubernetes creates a new Pod to restore 3.",
        checkpoint: {
          prompt: "If replicas=3 and a Pod dies, what happens next?",
          options: [
            { id: "a", label: "Nothing; you manually restart it", correct: false },
            { id: "b", label: "A new Pod is created to restore 3", correct: true },
            { id: "c", label: "The Service deletes the Deployment", correct: false },
            { id: "d", label: "A ConfigMap scales it back up", correct: false },
          ],
          weakArea: "self-healing + replicas",
        },
      },
    ],
  },
  {
    id: "sql",
    label: "SQL",
    roadmap: [
      { id: 1, title: "Select + filtering fundamentals", level: "Beginner" },
      { id: 2, title: "Joins that don’t hurt", level: "Beginner" },
      { id: 3, title: "Grouping + aggregations", level: "Intermediate" },
      { id: 4, title: "Indexes + query plans", level: "Advanced" },
      { id: 5, title: "Transactions + isolation", level: "Advanced" },
    ],
    lessons: [
      {
        id: "sql-1",
        title: "WHERE vs HAVING",
        level: "Beginner",
        conceptTags: ["Filtering", "Aggregations"],
        mode: "Analogy",
        content:
          "Analogy: WHERE is the bouncer at the door (filters rows before the party). HAVING is the host after grouping (filters groups after the party forms).",
        checkpoint: {
          prompt: "You want to filter groups by COUNT(*). Which clause?",
          options: [
            { id: "a", label: "WHERE", correct: false },
            { id: "b", label: "HAVING", correct: true },
            { id: "c", label: "ORDER BY", correct: false },
            { id: "d", label: "LIMIT", correct: false },
          ],
          weakArea: "group filtering",
        },
      },
      {
        id: "sql-2",
        title: "JOIN types (quick mental model)",
        level: "Intermediate",
        conceptTags: ["JOIN", "NULLs"],
        mode: "Visual",
        content:
          "Visual: INNER keeps overlaps, LEFT keeps left side + overlaps, FULL keeps everything. Watch where NULLs show up — that’s the missing side.",
        checkpoint: {
          prompt: "Which join keeps all rows from left table?",
          options: [
            { id: "a", label: "INNER JOIN", correct: false },
            { id: "b", label: "LEFT JOIN", correct: true },
            { id: "c", label: "CROSS JOIN", correct: false },
            { id: "d", label: "RIGHT JOIN", correct: false },
          ],
          weakArea: "join semantics",
        },
      },
    ],
  },
];

function guessPackId(topicText: string): string {
  const t = topicText.toLowerCase();
  if (t.includes("kubernetes") || t.includes("k8s") || t.includes("pods") || t.includes("deployment")) return "k8s";
  if (t.includes("sql") || t.includes("postgres") || t.includes("mysql") || t.includes("join")) return "sql";
  return "k8s";
}

function parseDailyMinutes(input: string): number {
  const raw = input.trim().toLowerCase();
  const num = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return 30;
  if (raw.includes("hour") || raw.includes("hr") || raw.includes("h")) return Math.round(num * 60);
  return Math.round(num);
}

function computeWeeksEstimate(lessonCount: number, dailyMinutes: number): number {
  const minutesPerLesson = 18; // micro-lesson + quick check + revision buffer
  const totalMinutes = Math.max(1, lessonCount) * minutesPerLesson;
  const days = totalMinutes / Math.max(10, dailyMinutes);
  return Math.max(1, Math.round(days / 7));
}

export default function Home() {
  const [topic, setTopic] = useState("I want to learn Kubernetes");
  const [dailyTime, setDailyTime] = useState("30 min");
  const [goal, setGoal] = useState("Technical interview");
  const [learningStyle, setLearningStyle] = useState("Visual + examples");
  const [step, setStep] = useState(1);
  const [pulseMode, setPulseMode] = useState<PulseMode>("Simple");
  const [confusion, setConfusion] = useState(64);
  const [confidence, setConfidence] = useState(42);
  const [mastery, setMastery] = useState(35);
  const [streak, setStreak] = useState(4);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [weakArea, setWeakArea] = useState("Rollout confidence");
  const [sessionLessonIdx, setSessionLessonIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"a" | "b" | "c" | "d" | null>(null);
  const [lastCheck, setLastCheck] = useState<
    | null
    | { correct: boolean; message: string; lessonId: string; weakArea: string; scoreDelta: number }
  >(null);
  const [pace, setPace] = useState<"Chill" | "Balanced" | "Grind">("Balanced");

  const packId = useMemo(() => guessPackId(topic), [topic]);
  const pack = useMemo(() => conceptPacks.find((p) => p.id === packId) ?? conceptPacks[0], [packId]);
  const dailyMinutes = useMemo(() => parseDailyMinutes(dailyTime), [dailyTime]);
  const weeksEstimate = useMemo(() => computeWeeksEstimate(pack.roadmap.length + pack.lessons.length, dailyMinutes), [pack, dailyMinutes]);
  const completion = useMemo(() => Math.min(100, Math.round((mastery + confidence) / 2)), [mastery, confidence]);
  const activeLesson = useMemo(() => pack.lessons[Math.min(pack.lessons.length - 1, Math.max(0, sessionLessonIdx))], [pack, sessionLessonIdx]);
  const targetMode = useMemo<PulseMode>(() => {
    if (confusion > 70) return "Simple";
    if (confidence < 55) return "Analogy";
    if (mastery < 45) return "Revision";
    return "Challenge";
  }, [confusion, confidence, mastery]);

  const lessonText = useMemo(() => {
    if (!activeLesson) return "Pick a topic and we’ll start the micro-lessons.";
    const styleBias =
      learningStyle.toLowerCase().includes("visual") ? "Visual" : learningStyle.toLowerCase().includes("analogy") ? "Analogy" : "Simple";
    const styleMode = (styleBias === "Visual" || styleBias === "Analogy" || styleBias === "Simple" ? styleBias : "Simple") as PulseMode;
    const resolvedMode = step >= 3 ? targetMode : styleMode;
    const base = activeLesson.content;
    const mentor = "You are close. Focus on control scope:";
    const revision = "Quick recall loop:";
    const visual = "Visual map:";
    const analogy = "Think of it like:";
    if (resolvedMode === "Mentor") return `${mentor} ${base}`;
    if (resolvedMode === "Revision") return `${revision} ${base}`;
    if (resolvedMode === "Visual") return `${visual} ${base}`;
    if (resolvedMode === "Analogy") return `${analogy} ${base}`;
    return base;
  }, [activeLesson, learningStyle, step, targetMode]);

  const activatePulse = () => {
    setPulseMode(targetMode);
    setStep(3);
    const paceMult = pace === "Grind" ? 1.2 : pace === "Chill" ? 0.85 : 1;
    // Pulse updates simulate "understanding calibration" (not quiz correctness).
    setConfusion((prev) => Math.max(22, Math.round(prev - 16 * paceMult)));
    setConfidence((prev) => Math.min(96, Math.round(prev + 12 * paceMult)));
  };

  const submitQuickCheck = () => {
    if (!activeLesson || !selectedAnswer) return;
    const chosen = activeLesson.checkpoint.options.find((o) => o.id === selectedAnswer);
    const correct = Boolean(chosen?.correct);
    const paceMult = pace === "Grind" ? 1.15 : pace === "Chill" ? 0.9 : 1;
    const delta = correct ? Math.round(14 * paceMult) : -Math.round(10 * paceMult);

    setLastCheck({
      correct,
      lessonId: activeLesson.id,
      weakArea: activeLesson.checkpoint.weakArea,
      scoreDelta: delta,
      message: correct
        ? "Clean. Quick recall loop locked in."
        : `Weak area detected: ${activeLesson.checkpoint.weakArea}. Smart revision added.`,
    });

    // Adaptive updates: correctness drives mastery/confidence/confusion.
    setConfidence((prev) => Math.max(18, Math.min(97, prev + (correct ? 10 : -8))));
    setConfusion((prev) => Math.max(18, Math.min(95, prev + (correct ? -10 : 12))));
    setMastery((prev) => Math.max(10, Math.min(100, prev + (correct ? 16 : 6))));
    setWeakArea(correct ? weakArea : activeLesson.checkpoint.weakArea);
    setStreak((prev) => prev + (correct ? 1 : 0));

    const score = Math.min(100, Math.round((confidence + (100 - confusion)) / 2) + delta);
    setQuizScore(score);
    setStep(4);
    setPulseMode(targetMode);
  };

  const nextLesson = () => {
    setSelectedAnswer(null);
    setLastCheck(null);
    setSessionLessonIdx((prev) => Math.min(pack.lessons.length - 1, prev + 1));
  };

  const resetSession = () => {
    setSelectedAnswer(null);
    setLastCheck(null);
    setQuizScore(null);
    setSessionLessonIdx(0);
    setStep(1);
    setPulseMode("Simple");
    setWeakArea("Rollout confidence");
    setConfusion(64);
    setConfidence(42);
    setMastery(35);
    setStreak(4);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="material-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">AI Learning OS</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">LearnFlow AI</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
              Duolingo + ChatGPT + personal mentor, powered by real-time adaptive learning pulse.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="pill-btn-alt" onClick={resetSession}>
              Reset Loop
            </button>
            <button className="pill-btn">M3 Premium Mode</button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface p-4 sm:p-6">
          <h2 className="text-lg font-semibold">1) Smart Topic Input</h2>
          <div className="mt-4 grid gap-3">
            <label className="field">
              Topic
              <input value={topic} onChange={(e) => setTopic(e.target.value)} />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="field">
                Daily time
                <input value={dailyTime} onChange={(e) => setDailyTime(e.target.value)} />
              </label>
              <label className="field">
                Goal
                <input value={goal} onChange={(e) => setGoal(e.target.value)} />
              </label>
              <label className="field">
                Style
                <input value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Roadmap", "Micro Lessons", "Mentor", "Quiz Mode"].map((chip) => (
              <span className="chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-violet-200">Generated Roadmap</h3>
          <div className="mt-3 space-y-2">
            {pack.roadmap.map((item, idx) => (
              <div className="roadmap-row" key={item.id}>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-white/70">{item.level}</p>
                </div>
                <span className={idx === 0 ? "status-done" : "status-pending"}>{idx === 0 ? "Done" : "Next"}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/70">
            Estimated completion: <strong>{weeksEstimate} weeks</strong> with {dailyTime}/day.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="kpi">
              <p>Pack</p>
              <strong>{pack.label}</strong>
            </div>
            <div className="kpi">
              <p>Pace</p>
              <strong>{pace}</strong>
            </div>
            <div className="kpi">
              <p>Session</p>
              <strong>
                {Math.min(pack.lessons.length, sessionLessonIdx + 1)}/{pack.lessons.length}
              </strong>
            </div>
          </div>
        </article>

        <article className="surface p-4 sm:p-6">
          <h2 className="text-lg font-semibold">2) AI Learning Pulse</h2>
          <p className="mt-2 text-sm text-white/80">
            Live adaptation detects confusion, confidence, retention and switches teaching mode instantly.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="kpi">
              <p>Confusion</p>
              <strong>{confusion}%</strong>
            </div>
            <div className="kpi">
              <p>Confidence</p>
              <strong>{confidence}%</strong>
            </div>
            <div className="kpi">
              <p>Mastery</p>
              <strong>{mastery}%</strong>
            </div>
            <div className="kpi">
              <p>Streak</p>
              <strong>{streak} days</strong>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/15 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-violet-200">Current Mode</p>
            <p className="mt-1 text-lg font-semibold">{pulseMode} Explanation</p>
            <p className="mt-2 text-sm text-white/85">{lessonText}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="pill-btn"
              onClick={activatePulse}
            >
              Detect Confusion
            </button>
            <button
              className="pill-btn-alt"
              onClick={() => setPace((p) => (p === "Balanced" ? "Grind" : p === "Grind" ? "Chill" : "Balanced"))}
            >
              Pace: {pace}
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface p-5">
          <h2 className="text-lg font-semibold">3) Quiz + Revision Engine</h2>
          <p className="mt-2 text-sm text-white/80">Quick recall loop</p>

          {activeLesson ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="quiz-item">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-white">{activeLesson.title}</span>
                  <span className="chip">{activeLesson.level}</span>
                </div>
                <span className="text-white/85">{activeLesson.checkpoint.prompt}</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {activeLesson.checkpoint.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={selectedAnswer === opt.id ? "pill-btn" : "pill-btn-alt"}
                      onClick={() => setSelectedAnswer(opt.id)}
                    >
                      {opt.id.toUpperCase()}. {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button className="pill-btn" onClick={submitQuickCheck} disabled={!selectedAnswer}>
                    Generate AI Quiz
                  </button>
                  <button className="pill-btn-alt" onClick={nextLesson}>
                    Next micro lesson
                  </button>
                </div>
              </div>

              {lastCheck && (
                <p className={"mt-2 rounded-2xl p-3 text-sm " + (lastCheck.correct ? "bg-emerald-500/20" : "bg-amber-500/20")}>
                  Quiz score: <strong>{quizScore ?? 0}%</strong> - {lastCheck.message}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/80">Add a topic above and we’ll generate the first micro lesson.</p>
          )}
        </article>

        <article className="surface p-5">
          <h2 className="text-lg font-semibold">4) Dashboard: Learning Pulse Board</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-card">
              <p>Topic Completion</p>
              <strong>{completion}%</strong>
            </div>
            <div className="dashboard-card">
              <p>Pulse State</p>
              <strong>{step >= 3 ? "Adaptive Active" : "Monitoring"}</strong>
            </div>
            <div className="dashboard-card">
              <p>Weak Area</p>
              <strong>{weakArea}</strong>
            </div>
            <div className="dashboard-card">
              <p>Achievement</p>
              <strong>{streak >= 5 ? "Consistency Hero" : "On Fire"}</strong>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300" style={{ width: `${completion}%` }} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-card">
              <p>Personalization</p>
              <strong>{goal}</strong>
            </div>
            <div className="dashboard-card">
              <p>Mode Next</p>
              <strong>{targetMode} Explanation</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
