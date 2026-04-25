export type PackId = "k8s" | "sql";

export type LearnerRole = "Engineer" | "Analyst" | "SRE" | "Manager" | "Intern";

export type Learner = {
  id: string;
  name: string;
  role: LearnerRole;
  createdAt: number;
};

export type Assignment = {
  learnerId: string;
  packId: PackId;
  dailyMinutes: number;
  targetWeeks: number;
  assignedAt: number;
};

export type LearningMetrics = {
  confusion: number;
  confidence: number;
  mastery: number;
  streak: number;
  weakArea: string;
  completion: number;
};

export type SessionEvent = {
  id: string;
  learnerId: string;
  packId: PackId;
  lessonId: string;
  ts: number;
  type: "pulse" | "quickCheck";
  correct?: boolean;
  delta?: { confusion?: number; confidence?: number; mastery?: number; streak?: number };
  weakArea?: string;
};

export type LearnerProgress = {
  learnerId: string;
  packId: PackId;
  sessionLessonIdx: number;
  metrics: LearningMetrics;
  quizScore: number | null;
  lastUpdatedAt: number;
};

export type OrgModelV1 = {
  version: 1;
  org: { name: string; createdAt: number };
  selectedLearnerId: string | null;
  learners: Learner[];
  assignments: Assignment[];
  progress: LearnerProgress[];
  events: SessionEvent[];
};

const STORAGE_KEY = "learnflow_ai_b2b_model";

function now() {
  return Date.now();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function seedModel(): OrgModelV1 {
  const createdAt = now();
  const learners: Learner[] = [
    { id: makeId("learner"), name: "Aanya", role: "Engineer", createdAt },
    { id: makeId("learner"), name: "Rohit", role: "Analyst", createdAt },
    { id: makeId("learner"), name: "Mina", role: "SRE", createdAt },
  ];

  const selectedLearnerId = learners[0]?.id ?? null;

  const assignments: Assignment[] = [
    { learnerId: learners[0].id, packId: "sql", dailyMinutes: 30, targetWeeks: 4, assignedAt: createdAt },
    { learnerId: learners[1].id, packId: "k8s", dailyMinutes: 25, targetWeeks: 6, assignedAt: createdAt },
    { learnerId: learners[2].id, packId: "k8s", dailyMinutes: 20, targetWeeks: 6, assignedAt: createdAt },
  ];

  const baseMetrics = (): LearningMetrics => ({
    confusion: 64,
    confidence: 42,
    mastery: 35,
    streak: 2,
    weakArea: "Rollout confidence",
    completion: 39,
  });

  const progress: LearnerProgress[] = assignments.map((a, idx) => ({
    learnerId: a.learnerId,
    packId: a.packId,
    sessionLessonIdx: idx % 2,
    metrics: baseMetrics(),
    quizScore: null,
    lastUpdatedAt: createdAt,
  }));

  return {
    version: 1,
    org: { name: "Acme Upskilling Co", createdAt },
    selectedLearnerId,
    learners,
    assignments,
    progress,
    events: [],
  };
}

export function loadModel(): OrgModelV1 {
  if (typeof window === "undefined") return seedModel();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedModel();
    const parsed = JSON.parse(raw) as Partial<OrgModelV1>;
    if (parsed.version !== 1) return seedModel();
    // Soft validation.
    if (!parsed.org || !Array.isArray(parsed.learners) || !Array.isArray(parsed.assignments)) return seedModel();
    return parsed as OrgModelV1;
  } catch {
    return seedModel();
  }
}

export function saveModel(model: OrgModelV1) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
}

export function getSelectedLearner(model: OrgModelV1): Learner | null {
  if (!model.selectedLearnerId) return null;
  return model.learners.find((l) => l.id === model.selectedLearnerId) ?? null;
}

export function selectLearner(model: OrgModelV1, learnerId: string | null): OrgModelV1 {
  return { ...model, selectedLearnerId: learnerId };
}

export function upsertLearnerProgress(model: OrgModelV1, next: LearnerProgress): OrgModelV1 {
  const idx = model.progress.findIndex((p) => p.learnerId === next.learnerId && p.packId === next.packId);
  const progress = idx >= 0 ? model.progress.map((p, i) => (i === idx ? next : p)) : [...model.progress, next];
  return { ...model, progress };
}

export function setAssignment(model: OrgModelV1, assignment: Assignment): OrgModelV1 {
  const idx = model.assignments.findIndex((a) => a.learnerId === assignment.learnerId);
  const assignments = idx >= 0 ? model.assignments.map((a, i) => (i === idx ? assignment : a)) : [...model.assignments, assignment];
  return { ...model, assignments };
}

export function addEvent(model: OrgModelV1, event: SessionEvent): OrgModelV1 {
  return { ...model, events: [event, ...model.events].slice(0, 500) };
}

export function recomputeCompletion(m: Pick<LearningMetrics, "mastery" | "confidence">): number {
  return clamp(Math.round((m.mastery + m.confidence) / 2), 0, 100);
}

