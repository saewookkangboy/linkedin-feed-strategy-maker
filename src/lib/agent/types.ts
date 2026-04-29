export interface AgentAnalysis {
  summaryBullets: string[];
  topTopics: { topic: string; count: number }[];
  formatMix: { format: string; sharePercent: number }[];
  engagementNote: string;
  risksOrGaps: string[];
  sampleSize: number;
}

export type AgentMode = "deterministic" | "openai";
