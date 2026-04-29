import type { AgentMode } from "@/lib/agent/types";

export type OrchestrationHarnessStepPayload = {
  mode: AgentMode;
  markdown: string;
};
