import type { UserStrategyProfile } from "@/lib/types";
import {
  defaultProfile,
  loadKeywordSets,
  loadObservations,
  loadProfile,
} from "@/lib/storage";

export type WorkspaceStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  done: boolean;
};

function workspaceStepsFromInputs(
  profile: UserStrategyProfile,
  kw: number,
  obs: number,
): WorkspaceStep[] {
  const goalOk = profile.goalPrimary.trim().length > 0;
  const audienceOk = profile.audience.trim().length > 0;

  return [
    {
      id: "settings",
      title: "목표·관객 적기",
      description: "브리프와 초안이 여기 적은 기준에 맞춰져요.",
      href: "/settings",
      done: goalOk && audienceOk,
    },
    {
      id: "keywords",
      title: "키워드 세트 만들기",
      description: "주제 묶음을 만들면, 관측 글에 자동으로 태그가 붙어요.",
      href: "/keywords",
      done: kw > 0,
    },
    {
      id: "observations",
      title: "피드 관측 3건 이상",
      description: "링크드인에서 본 글 본문을 그대로 붙여 넣으면 됩니다.",
      href: "/observations",
      done: obs >= 3,
    },
    {
      id: "brief",
      title: "브리프나 에이전트 돌리기",
      description: "글을 몇 건 모아야 트렌드·브리프가 말이 됩니다.",
      href: "/brief",
      done: obs >= 3 && kw > 0 && goalOk,
    },
  ];
}

export function getWorkspaceSteps(): WorkspaceStep[] {
  return workspaceStepsFromInputs(
    loadProfile(),
    loadKeywordSets().length,
    loadObservations().length,
  );
}

/**
 * 서버 HTML과 클라이언트 첫 페인트를 맞추기 위한 단계(로컬 스토리지 없음 = 기본 프로필·0건).
 * 마운트 후 `getWorkspaceSteps()`로 바꿉니다.
 */
export function getWorkspaceStepsHydrationShell(): WorkspaceStep[] {
  return workspaceStepsFromInputs(defaultProfile(), 0, 0);
}

export function workspaceProgressPercent(steps: WorkspaceStep[]): number {
  const done = steps.filter((s) => s.done).length;
  return Math.round((done / steps.length) * 100);
}
