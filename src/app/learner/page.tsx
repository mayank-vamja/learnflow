"use client";

import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { computeWeeksEstimate, chooseTargetMode, gradeQuickCheck, parseDailyMinutes, applyPulse, computeCompletion } from "@/lib/learning/engine";
import { conceptPacks, guessPackId, roadmapDetailsByPack, type PulseMode } from "@/lib/learning/packs";

export default function LearnerPage() {
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
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [activeChips, setActiveChips] = useState<Record<"Roadmap" | "Micro Lessons" | "Mentor" | "Quiz Mode", boolean>>({
    Roadmap: true,
    "Micro Lessons": true,
    Mentor: false,
    "Quiz Mode": true,
  });

  const packId = useMemo(() => guessPackId(topic), [topic]);
  const pack = useMemo(() => conceptPacks.find((p) => p.id === packId) ?? conceptPacks[0], [packId]);
  const dailyMinutes = useMemo(() => parseDailyMinutes(dailyTime), [dailyTime]);
  const weeksEstimate = useMemo(() => computeWeeksEstimate(pack.roadmap.length + pack.lessons.length, dailyMinutes), [pack, dailyMinutes]);
  const completion = useMemo(() => computeCompletion({ mastery, confidence }), [mastery, confidence]);
  const activeLesson = useMemo(() => pack.lessons[Math.min(pack.lessons.length - 1, Math.max(0, sessionLessonIdx))], [pack, sessionLessonIdx]);
  const roadmapDetails = useMemo(() => roadmapDetailsByPack[pack.id] ?? [], [pack.id]);
  const selectedRoadmapDetail = useMemo(
    () => (selectedRoadmapId ? roadmapDetails.find((d) => d.roadmapId === selectedRoadmapId) ?? null : null),
    [roadmapDetails, selectedRoadmapId],
  );
  const targetMode = useMemo<PulseMode>(() => chooseTargetMode({ confusion, confidence, mastery }), [confusion, confidence, mastery]);

  const completedRoadmapCount = useMemo(() => {
    const progress01 = pack.lessons.length <= 1 ? 0 : sessionLessonIdx / (pack.lessons.length - 1);
    const approx = Math.round(progress01 * pack.roadmap.length);
    return Math.max(1, Math.min(pack.roadmap.length, approx));
  }, [pack.lessons.length, pack.roadmap.length, sessionLessonIdx]);

  const softResetLoop = () => {
    setSelectedAnswer(null);
    setLastCheck(null);
    setQuizScore(null);
    setSessionLessonIdx(0);
    setSelectedRoadmapId(null);
    setStep(1);
    setPulseMode("Simple");
    setWeakArea("Rollout confidence");
    setConfusion(64);
    setConfidence(42);
    setMastery(35);
    setStreak(4);
  };

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
    const res = applyPulse({ confusion, confidence }, pace);
    setConfusion(res.next.confusion);
    setConfidence(res.next.confidence);
  };

  const submitQuickCheck = () => {
    if (!activeLesson || !selectedAnswer) return;
    const res = gradeQuickCheck({
      lesson: activeLesson,
      selected: selectedAnswer,
      pace,
      prevMetrics: { confusion, confidence, mastery, streak, weakArea },
    });

    setLastCheck({
      correct: res.correct,
      lessonId: activeLesson.id,
      weakArea: activeLesson.checkpoint.weakArea,
      scoreDelta: res.score - Math.round((confidence + (100 - confusion)) / 2),
      message: res.message,
    });

    setConfusion(res.nextMetrics.confusion);
    setConfidence(res.nextMetrics.confidence);
    setMastery(res.nextMetrics.mastery);
    setStreak(res.nextMetrics.streak);
    setWeakArea(res.nextMetrics.weakArea);
    setQuizScore(res.score);
    setStep(4);
    setPulseMode(targetMode);
  };

  const nextLesson = () => {
    setSelectedAnswer(null);
    setLastCheck(null);
    setSessionLessonIdx((prev) => Math.min(pack.lessons.length - 1, prev + 1));
  };

  return (
    <AppShell title="Duolingo + ChatGPT + personal mentor, powered by real-time adaptive learning pulse.">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface p-4 sm:p-6">
          <h2 className="text-lg font-semibold">1) Smart Topic Input</h2>
          <div className="mt-4 grid gap-3">
            <label className="field">
              Topic
              <input
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  softResetLoop();
                }}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="field">
                Daily time
                <input
                  value={dailyTime}
                  onChange={(e) => {
                    setDailyTime(e.target.value);
                    softResetLoop();
                  }}
                />
              </label>
              <label className="field">
                Goal
                <input
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    softResetLoop();
                  }}
                />
              </label>
              <label className="field">
                Style
                <input
                  value={learningStyle}
                  onChange={(e) => {
                    setLearningStyle(e.target.value);
                    softResetLoop();
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(["Roadmap", "Micro Lessons", "Mentor", "Quiz Mode"] as const).map((chip) => (
              <button
                type="button"
                className={"chip " + (activeChips[chip] ? "chip-active" : "")}
                key={chip}
                onClick={() => setActiveChips((prev) => ({ ...prev, [chip]: !prev[chip] }))}
              >
                {chip}
              </button>
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
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="pill-btn-alt" onClick={() => setSelectedRoadmapId(item.id)}>
                    Open
                  </button>
                  <span className={idx < completedRoadmapCount ? "status-done" : "status-pending"}>
                    {idx < completedRoadmapCount ? "Done" : "Next"}
                  </span>
                </div>
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
            <button className="pill-btn" onClick={activatePulse}>
              Detect Confusion
            </button>
            <button className="pill-btn-alt" onClick={() => setPace((p) => (p === "Balanced" ? "Grind" : p === "Grind" ? "Chill" : "Balanced"))}>
              Pace: {pace}
            </button>
          </div>

          {selectedRoadmapDetail && activeChips.Roadmap && (
            <div className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-violet-200">Roadmap screen</p>
                  <p className="mt-1 text-lg font-semibold">
                    {pack.roadmap.find((r) => r.id === selectedRoadmapDetail.roadmapId)?.title ?? "Roadmap item"}
                  </p>
                  <p className="mt-2 text-sm text-white/85">{selectedRoadmapDetail.summary}</p>
                </div>
                <button className="pill-btn-alt" type="button" onClick={() => setSelectedRoadmapId(null)}>
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="dashboard-card">
                  <p>Estimated time</p>
                  <strong>{selectedRoadmapDetail.estimatedMinutes} min</strong>
                </div>
                <div className="dashboard-card">
                  <p>Mini challenge</p>
                  <strong>{selectedRoadmapDetail.miniChallenge}</strong>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-violet-200">Outcomes</p>
                <div className="mt-2 grid gap-2">
                  {selectedRoadmapDetail.outcomes.map((o) => (
                    <div className="roadmap-row" key={o}>
                      <p className="text-sm text-white/85">{o}</p>
                      <span className="status-pending">Next</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="pill-btn"
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setSelectedRoadmapId(null);
                  }}
                >
                  Start this
                </button>
                <button className="pill-btn-alt" type="button" onClick={activatePulse}>
                  Detect Confusion
                </button>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">3) Quiz + Revision Engine</h2>
              <p className="mt-2 text-sm text-white/80">Quick recall loop</p>
            </div>
            <button className="pill-btn-alt" onClick={softResetLoop}>
              Reset Loop
            </button>
          </div>

          {activeLesson && activeChips["Quiz Mode"] ? (
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
            <p className="mt-4 text-sm text-white/80">
              {activeChips["Quiz Mode"] ? "Add a topic above and we’ll generate the first micro lesson." : "Quiz Mode is off — tap the chip to enable it."}
            </p>
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
    </AppShell>
  );
}

