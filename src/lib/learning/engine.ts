import type { PackId } from "../storage/localModel";
import type { LessonCard, PulseMode } from "./packs";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function parseDailyMinutes(input: string): number {
  const raw = input.trim().toLowerCase();
  const num = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return 30;
  if (raw.includes("hour") || raw.includes("hr") || raw.includes("h")) return Math.round(num * 60);
  return Math.round(num);
}

export function computeWeeksEstimate(itemCount: number, dailyMinutes: number): number {
  const minutesPerItem = 18;
  const totalMinutes = Math.max(1, itemCount) * minutesPerItem;
  const days = totalMinutes / Math.max(10, dailyMinutes);
  return Math.max(1, Math.round(days / 7));
}

export function chooseTargetMode(metrics: { confusion: number; confidence: number; mastery: number }): PulseMode {
  if (metrics.confusion > 70) return "Simple";
  if (metrics.confidence < 55) return "Analogy";
  if (metrics.mastery < 45) return "Revision";
  return "Challenge";
}

export function computeCompletion(metrics: { mastery: number; confidence: number }): number {
  return clamp(Math.round((metrics.mastery + metrics.confidence) / 2), 0, 100);
}

export function applyPulse(
  metrics: { confusion: number; confidence: number },
  pace: "Chill" | "Balanced" | "Grind",
): { next: { confusion: number; confidence: number }; delta: { confusion: number; confidence: number } } {
  const paceMult = pace === "Grind" ? 1.2 : pace === "Chill" ? 0.85 : 1;
  const nextConf = clamp(Math.round(metrics.confusion - 16 * paceMult), 22, 95);
  const nextCfd = clamp(Math.round(metrics.confidence + 12 * paceMult), 18, 96);
  return { next: { confusion: nextConf, confidence: nextCfd }, delta: { confusion: nextConf - metrics.confusion, confidence: nextCfd - metrics.confidence } };
}

export function gradeQuickCheck(args: {
  lesson: LessonCard;
  selected: "a" | "b" | "c" | "d";
  pace: "Chill" | "Balanced" | "Grind";
  prevMetrics: { confusion: number; confidence: number; mastery: number; streak: number; weakArea: string };
}): {
  correct: boolean;
  weakArea: string;
  nextMetrics: { confusion: number; confidence: number; mastery: number; streak: number; weakArea: string };
  score: number;
  message: string;
  delta: { confusion: number; confidence: number; mastery: number; streak: number };
} {
  const { lesson, selected, pace, prevMetrics } = args;
  const chosen = lesson.checkpoint.options.find((o) => o.id === selected);
  const correct = Boolean(chosen?.correct);
  const paceMult = pace === "Grind" ? 1.15 : pace === "Chill" ? 0.9 : 1;
  const scoreDelta = correct ? Math.round(14 * paceMult) : -Math.round(10 * paceMult);

  const nextConfidence = clamp(prevMetrics.confidence + (correct ? 10 : -8), 18, 97);
  const nextConfusion = clamp(prevMetrics.confusion + (correct ? -10 : 12), 18, 95);
  const nextMastery = clamp(prevMetrics.mastery + (correct ? 16 : 6), 10, 100);
  const nextStreak = prevMetrics.streak + (correct ? 1 : 0);
  const nextWeakArea = correct ? prevMetrics.weakArea : lesson.checkpoint.weakArea;

  const baseScore = Math.round((prevMetrics.confidence + (100 - prevMetrics.confusion)) / 2);
  const score = clamp(baseScore + scoreDelta, 0, 100);

  return {
    correct,
    weakArea: nextWeakArea,
    nextMetrics: {
      confusion: nextConfusion,
      confidence: nextConfidence,
      mastery: nextMastery,
      streak: nextStreak,
      weakArea: nextWeakArea,
    },
    score,
    message: correct ? "Clean. Quick recall loop locked in." : `Weak area detected: ${lesson.checkpoint.weakArea}. Smart revision added.`,
    delta: {
      confusion: nextConfusion - prevMetrics.confusion,
      confidence: nextConfidence - prevMetrics.confidence,
      mastery: nextMastery - prevMetrics.mastery,
      streak: nextStreak - prevMetrics.streak,
    },
  };
}

export function gradeVoiceTranscript(args: {
  lesson: LessonCard;
  transcript: string;
  pace: "Chill" | "Balanced" | "Grind";
  prevMetrics: { confusion: number; confidence: number; mastery: number; streak: number; weakArea: string };
  keywords: string[];
  antiKeywords?: string[];
}): {
  correct: boolean;
  weakArea: string;
  nextMetrics: { confusion: number; confidence: number; mastery: number; streak: number; weakArea: string };
  score: number;
  message: string;
  delta: { confusion: number; confidence: number; mastery: number; streak: number };
  match: { hits: number; total: number };
} {
  const t = args.transcript.toLowerCase();
  const hits = args.keywords.filter((k) => t.includes(k.toLowerCase())).length;
  const antiHits = (args.antiKeywords ?? []).filter((k) => t.includes(k.toLowerCase())).length;
  const total = Math.max(1, args.keywords.length);

  // Demo grading: 60% keyword hit rate and no anti hits => correct.
  const correct = antiHits === 0 && hits / total >= 0.6;

  // Reuse the same update dynamics as quick-check grading.
  const paceMult = args.pace === "Grind" ? 1.15 : args.pace === "Chill" ? 0.9 : 1;
  const scoreDelta = correct ? Math.round(14 * paceMult) : -Math.round(10 * paceMult);

  const nextConfidence = clamp(args.prevMetrics.confidence + (correct ? 10 : -8), 18, 97);
  const nextConfusion = clamp(args.prevMetrics.confusion + (correct ? -10 : 12), 18, 95);
  const nextMastery = clamp(args.prevMetrics.mastery + (correct ? 16 : 6), 10, 100);
  const nextStreak = args.prevMetrics.streak + (correct ? 1 : 0);
  const nextWeakArea = correct ? args.prevMetrics.weakArea : args.lesson.checkpoint.weakArea;

  const baseScore = Math.round((args.prevMetrics.confidence + (100 - args.prevMetrics.confusion)) / 2);
  const score = clamp(baseScore + scoreDelta, 0, 100);

  return {
    correct,
    weakArea: nextWeakArea,
    nextMetrics: {
      confusion: nextConfusion,
      confidence: nextConfidence,
      mastery: nextMastery,
      streak: nextStreak,
      weakArea: nextWeakArea,
    },
    score,
    message: correct
      ? "Voice check passed. Quick recall loop locked in."
      : `Weak area detected: ${args.lesson.checkpoint.weakArea}. Smart revision added.`,
    delta: {
      confusion: nextConfusion - args.prevMetrics.confusion,
      confidence: nextConfidence - args.prevMetrics.confidence,
      mastery: nextMastery - args.prevMetrics.mastery,
      streak: nextStreak - args.prevMetrics.streak,
    },
    match: { hits, total },
  };
}

export function normalizePackId(packId: string): PackId {
  return packId === "sql" ? "sql" : "k8s";
}

