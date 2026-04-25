export type PulseMode =
  | "Simple"
  | "Analogy"
  | "Visual"
  | "Revision"
  | "Challenge"
  | "Mentor";

export type LessonCard = {
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

export type ConceptPack = {
  id: "k8s" | "sql";
  label: string;
  roadmap: { id: number; title: string; level: "Beginner" | "Intermediate" | "Advanced" }[];
  lessons: LessonCard[];
};

export type RoadmapDetail = {
  roadmapId: number;
  summary: string;
  outcomes: string[];
  miniChallenge: string;
  estimatedMinutes: number;
};

export const conceptPacks: ConceptPack[] = [
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

export const roadmapDetailsByPack: Record<ConceptPack["id"], RoadmapDetail[]> = {
  k8s: [
    {
      roadmapId: 1,
      summary: "Get the mental model: cluster, nodes, control plane, and what a workload actually is.",
      outcomes: ["Know what Kubernetes manages (and what it doesn’t)", "Explain cluster vs node vs workload", "Spot the right abstraction quickly"],
      miniChallenge: "Explain Kubernetes in 1 sentence, then expand to 3 sentences.",
      estimatedMinutes: 35,
    },
    {
      roadmapId: 2,
      summary: "Pods are the unit of execution. Deployments keep them alive + do safe updates.",
      outcomes: ["Define Pod vs Deployment", "Understand replicas/self-healing", "Recognize rollout strategy at a glance"],
      miniChallenge: "If replicas=3 and one Pod dies, describe what restores the count.",
      estimatedMinutes: 45,
    },
    {
      roadmapId: 3,
      summary: "Networking basics: Services front Pods; Ingress exposes apps with routing rules.",
      outcomes: ["Choose ClusterIP vs LoadBalancer vs Ingress", "Describe service discovery", "Understand traffic flow"],
      miniChallenge: "Sketch the path: user → ingress → service → pod.",
      estimatedMinutes: 55,
    },
    {
      roadmapId: 4,
      summary: "Config and storage: separate runtime from configuration and manage secrets safely.",
      outcomes: ["Use ConfigMaps for config", "Use Secrets for sensitive data", "Know when to attach volumes"],
      miniChallenge: "Name 2 things that should never live in an image.",
      estimatedMinutes: 55,
    },
    {
      roadmapId: 5,
      summary: "Scale and debug with confidence: know what to look at when things break.",
      outcomes: ["Read basic metrics and logs", "Understand HPA conceptually", "Debug rollout failures"],
      miniChallenge: "List the first 3 things you check when a rollout fails.",
      estimatedMinutes: 60,
    },
  ],
  sql: [
    {
      roadmapId: 1,
      summary: "Learn to pull exactly what you need: SELECT, WHERE, ORDER BY, LIMIT.",
      outcomes: ["Write clean SELECT statements", "Filter with WHERE safely", "Sort + paginate reliably"],
      miniChallenge: "Write a query that returns top 10 newest users from India.",
      estimatedMinutes: 40,
    },
    {
      roadmapId: 2,
      summary: "Joins without confusion: understand row matching and NULL behavior.",
      outcomes: ["INNER vs LEFT join", "Predict row counts", "Know where NULLs appear"],
      miniChallenge: "When does LEFT JOIN produce NULLs on the right side?",
      estimatedMinutes: 55,
    },
    {
      roadmapId: 3,
      summary: "Group and aggregate: COUNT/SUM/AVG + HAVING for group filters.",
      outcomes: ["Group correctly", "Use HAVING vs WHERE", "Read aggregate results confidently"],
      miniChallenge: "Find products with at least 5 orders (hint: HAVING).",
      estimatedMinutes: 55,
    },
    {
      roadmapId: 4,
      summary: "Indexes and query plans: make queries fast without guessing.",
      outcomes: ["Know when indexes help", "Understand basic query plan outputs", "Avoid common anti-patterns"],
      miniChallenge: "Why can an index be ignored even if it exists?",
      estimatedMinutes: 65,
    },
    {
      roadmapId: 5,
      summary: "Transactions: safety, consistency, and what isolation actually means.",
      outcomes: ["Understand ACID basics", "Pick the right isolation trade-off", "Avoid write anomalies"],
      miniChallenge: "Describe a real-world example of a race condition in payments.",
      estimatedMinutes: 70,
    },
  ],
};

export function getPack(packId: ConceptPack["id"]) {
  return conceptPacks.find((p) => p.id === packId) ?? conceptPacks[0];
}

export function guessPackId(topicText: string): ConceptPack["id"] {
  const t = topicText.toLowerCase();
  if (t.includes("kubernetes") || t.includes("k8s") || t.includes("pods") || t.includes("deployment")) return "k8s";
  if (t.includes("sql") || t.includes("postgres") || t.includes("mysql") || t.includes("join")) return "sql";
  return "k8s";
}

