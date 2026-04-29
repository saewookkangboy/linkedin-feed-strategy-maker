export type Id = string;

export interface KeywordSet {
  id: Id;
  name: string;
  keywords: string[];
  createdAt: string;
}

export type PostFormat =
  | "short"
  | "long"
  | "carousel"
  | "poll"
  | "video"
  | "document"
  | "unknown";

export interface FeedObservation {
  id: Id;
  capturedAt: string;
  body: string;
  /** 선택: 링크드인 등 원문 게시물 URL(출처 기록용). 자동으로 글을 가져오지 않습니다. */
  sourceUrl?: string;
  optionalNote?: string;
  format: PostFormat;
  engagements: {
    reactions?: number;
    comments?: number;
    reposts?: number;
  };
  matchedTopics: string[];
}

export interface UserStrategyProfile {
  goalPrimary: string;
  /** 주요 목표 — 미리 정의된 옵션 id(다중 선택, 표시 순서는 옵션 정의 순) */
  primaryGoalOptionIds: string[];
  /** 옵션 외에 덧붙이는 목표·맥락(자유 입력) */
  primaryGoalNotes: string;
  audience: string;
  postsPerWeek: number;
  toneNotes: string;
  disclaimerAcceptedAt?: string;
}

export interface TrendWindowStats {
  windowLabel: string;
  start: string;
  end: string;
  observationCount: number;
  topicCounts: Record<string, number>;
  formatCounts: Record<PostFormat, number>;
  avgEngagementScore: number;
}

export interface TrendComparison {
  daily: TrendWindowStats;
  weekly: TrendWindowStats;
  /** topic -> delta ratio weekly recent vs previous week (if computable) */
  topicMomentum: { topic: string; delta: number; recent: number; previous: number }[];
}

export type PlannedPostStatus = "idea" | "draft" | "scheduled" | "published";

export interface PlannedPost {
  id: Id;
  /** 로컬 캘린더 기준 YYYY-MM-DD */
  plannedDate: string;
  title: string;
  angleSummary?: string;
  format: PostFormat;
  status: PlannedPostStatus;
  createdAt: string;
  updatedAt: string;
}

export const OBSERVATIONS_EXPORT_VERSION = 2 as const;

export interface ObservationsExportFile {
  version: typeof OBSERVATIONS_EXPORT_VERSION;
  exportedAt: string;
  observations: FeedObservation[];
}
