import type { OrgModelV1, PackId } from "../storage/localModel";

export type LearnerAnalyticsRow = {
  learnerId: string;
  learnerName: string;
  role: string;
  packId: PackId;
  completion: number;
  confusion: number;
  confidence: number;
  mastery: number;
  streak: number;
  weakArea: string;
  lastUpdatedAt: number;
};

export type TeamAnalytics = {
  rows: LearnerAnalyticsRow[];
  masteryBuckets: { name: string; value: number }[];
  weakAreas: { weakArea: string; count: number }[];
  completionSeries: { name: string; completion: number }[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function computeTeamAnalytics(model: OrgModelV1): TeamAnalytics {
  const learnerById = new Map(model.learners.map((l) => [l.id, l] as const));
  const assignmentByLearner = new Map(model.assignments.map((a) => [a.learnerId, a] as const));

  const rows: LearnerAnalyticsRow[] = model.progress
    .map((p) => {
      const learner = learnerById.get(p.learnerId);
      const a = assignmentByLearner.get(p.learnerId);
      if (!learner || !a) return null;
      return {
        learnerId: learner.id,
        learnerName: learner.name,
        role: learner.role,
        packId: a.packId,
        completion: clamp(p.metrics.completion, 0, 100),
        confusion: clamp(p.metrics.confusion, 0, 100),
        confidence: clamp(p.metrics.confidence, 0, 100),
        mastery: clamp(p.metrics.mastery, 0, 100),
        streak: Math.max(0, p.metrics.streak),
        weakArea: p.metrics.weakArea || "—",
        lastUpdatedAt: p.lastUpdatedAt,
      } satisfies LearnerAnalyticsRow;
    })
    .filter(Boolean) as LearnerAnalyticsRow[];

  // Mastery buckets.
  const masteryBuckets = [
    { name: "0-30", value: 0 },
    { name: "31-60", value: 0 },
    { name: "61-80", value: 0 },
    { name: "81-100", value: 0 },
  ];
  for (const r of rows) {
    if (r.mastery <= 30) masteryBuckets[0].value += 1;
    else if (r.mastery <= 60) masteryBuckets[1].value += 1;
    else if (r.mastery <= 80) masteryBuckets[2].value += 1;
    else masteryBuckets[3].value += 1;
  }

  // Weak area counts.
  const weakAreaCounts = new Map<string, number>();
  for (const r of rows) {
    const key = r.weakArea || "—";
    weakAreaCounts.set(key, (weakAreaCounts.get(key) ?? 0) + 1);
  }
  const weakAreas = [...weakAreaCounts.entries()]
    .map(([weakArea, count]) => ({ weakArea, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Completion series (per learner).
  const completionSeries = rows
    .slice()
    .sort((a, b) => b.completion - a.completion)
    .map((r) => ({ name: r.learnerName, completion: r.completion }));

  return { rows, masteryBuckets, weakAreas, completionSeries };
}

