import type { AgentAnalysis } from "@/lib/agent/types";
import { buildGoalPrimarySummary } from "@/lib/profile-goals";
import type {
  FeedObservation,
  KeywordSet,
  PlannedPost,
  UserStrategyProfile,
} from "@/lib/types";

const PREFIX = "lfsa:v1:";

const KEYS = {
  keywordSets: `${PREFIX}keywordSets`,
  observations: `${PREFIX}observations`,
  profile: `${PREFIX}profile`,
  plannedPosts: `${PREFIX}plannedPosts`,
  agentAnalysis: `${PREFIX}agentAnalysis`,
  agentStrategyMarkdown: `${PREFIX}agentStrategyMarkdown`,
  agentDraftsMarkdown: `${PREFIX}agentDraftsMarkdown`,
  trendResearchMarkdown: `${PREFIX}trendResearchMarkdown`,
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function clampPostsPerWeek(n: number): number {
  if (!Number.isFinite(n)) return 3;
  return Math.min(14, Math.max(1, Math.round(n)));
}

/** 로컬스토리지·API 등에서 읽은 값을 한 형태로 맞추고 `goalPrimary`를 동기화합니다. */
export function normalizeUserStrategyProfile(raw: unknown): UserStrategyProfile {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const primaryGoalOptionIds = Array.isArray(o.primaryGoalOptionIds)
    ? o.primaryGoalOptionIds.filter((x): x is string => typeof x === "string")
    : [];
  let primaryGoalNotes = typeof o.primaryGoalNotes === "string" ? o.primaryGoalNotes : "";
  let goalPrimary = typeof o.goalPrimary === "string" ? o.goalPrimary : "";

  // 예전 프로필: 자유 입력만 있던 경우 → 보조 메모로 승격(옵션은 비움)
  if (primaryGoalOptionIds.length === 0 && !primaryGoalNotes.trim() && goalPrimary.trim()) {
    primaryGoalNotes = goalPrimary.trim();
    goalPrimary = "";
  }

  goalPrimary = buildGoalPrimarySummary(primaryGoalOptionIds, primaryGoalNotes);

  const audience = typeof o.audience === "string" ? o.audience : "";
  const postsPerWeek = clampPostsPerWeek(
    typeof o.postsPerWeek === "number" ? o.postsPerWeek : 3,
  );
  const toneNotes = typeof o.toneNotes === "string" ? o.toneNotes : "";
  const disclaimerAcceptedAt =
    typeof o.disclaimerAcceptedAt === "string" ? o.disclaimerAcceptedAt : undefined;

  return {
    goalPrimary,
    primaryGoalOptionIds,
    primaryGoalNotes,
    audience,
    postsPerWeek,
    toneNotes,
    disclaimerAcceptedAt,
  };
}

export const defaultProfile = (): UserStrategyProfile =>
  normalizeUserStrategyProfile({
    goalPrimary: "",
    primaryGoalOptionIds: [],
    primaryGoalNotes: "",
    audience: "",
    postsPerWeek: 3,
    toneNotes: "",
  });

export function loadKeywordSets(): KeywordSet[] {
  return readJson<KeywordSet[]>(KEYS.keywordSets, []);
}

export function saveKeywordSets(sets: KeywordSet[]): void {
  writeJson(KEYS.keywordSets, sets);
}

export function loadObservations(): FeedObservation[] {
  return readJson<FeedObservation[]>(KEYS.observations, []);
}

export function saveObservations(rows: FeedObservation[]): void {
  writeJson(KEYS.observations, rows);
}

export function loadProfile(): UserStrategyProfile {
  const raw = readJson<unknown>(KEYS.profile, null);
  if (raw === null) return defaultProfile();
  return normalizeUserStrategyProfile(raw);
}

export function saveProfile(p: UserStrategyProfile): void {
  writeJson(KEYS.profile, normalizeUserStrategyProfile(p));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function loadPlannedPosts(): PlannedPost[] {
  return readJson<PlannedPost[]>(KEYS.plannedPosts, []);
}

export function savePlannedPosts(rows: PlannedPost[]): void {
  writeJson(KEYS.plannedPosts, rows);
}

export function loadAgentAnalysis(): AgentAnalysis | null {
  const v = readJson<AgentAnalysis | null>(KEYS.agentAnalysis, null);
  if (!v || typeof v !== "object") return null;
  if (!Array.isArray((v as AgentAnalysis).summaryBullets)) return null;
  return v;
}

export function saveAgentAnalysis(analysis: AgentAnalysis): void {
  writeJson(KEYS.agentAnalysis, analysis);
}

export function loadAgentStrategyMarkdown(): string | null {
  const v = readJson<string | null>(KEYS.agentStrategyMarkdown, null);
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function saveAgentStrategyMarkdown(md: string): void {
  writeJson(KEYS.agentStrategyMarkdown, md);
}

export function loadAgentDraftsMarkdown(): string | null {
  const v = readJson<string | null>(KEYS.agentDraftsMarkdown, null);
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function saveAgentDraftsMarkdown(md: string): void {
  writeJson(KEYS.agentDraftsMarkdown, md);
}

export function loadTrendResearchMarkdown(): string | null {
  const v = readJson<string | null>(KEYS.trendResearchMarkdown, null);
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function saveTrendResearchMarkdown(md: string): void {
  writeJson(KEYS.trendResearchMarkdown, md);
}
