import type { OrgModelV1 } from "../storage/localModel";
import { computeTeamAnalytics } from "../analytics/teamAnalytics";

export function toCSV(rows: Record<string, unknown>[]): string {
  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );

  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    const needs = s.includes(",") || s.includes("\n") || s.includes('"');
    const out = s.replace(/"/g, '""');
    return needs ? `"${out}"` : out;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc((r as Record<string, unknown>)[h])).join(",")),
  ];
  return lines.join("\n");
}

export function buildReportPayload(model: OrgModelV1) {
  const analytics = computeTeamAnalytics(model);
  return {
    org: model.org,
    generatedAt: Date.now(),
    learners: analytics.rows,
    weakAreas: analytics.weakAreas,
    masteryBuckets: analytics.masteryBuckets,
    usage: analytics.usage,
    events: model.events.slice(0, 200),
  };
}

export function buildReportRowsForCSV(model: OrgModelV1) {
  const analytics = computeTeamAnalytics(model);
  return analytics.rows.map((r) => ({
    learnerName: r.learnerName,
    role: r.role,
    packId: r.packId,
    completion: r.completion,
    mastery: r.mastery,
    confidence: r.confidence,
    confusion: r.confusion,
    streak: r.streak,
    weakArea: r.weakArea,
    lastUpdatedAt: new Date(r.lastUpdatedAt).toISOString(),
    team_videoPlays: analytics.usage.videoPlays,
    team_voiceAttempts: analytics.usage.voiceAttempts,
    team_voiceSuccessRate: analytics.usage.voiceSuccessRate,
  }));
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

