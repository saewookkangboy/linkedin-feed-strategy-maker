export type CheckSeverity = "info" | "warn" | "pass";

export interface CheckItem {
  id: string;
  label: string;
  severity: CheckSeverity;
  detail: string;
}

const URL_REGEX = /https?:\/\/\S+/i;
const HASHTAG_REGEX = /#[\p{L}\p{N}_]+/gu;

export function analyzeFeedDraft(text: string): CheckItem[] {
  const trimmed = text.trim();
  const items: CheckItem[] = [];

  if (trimmed.length === 0) {
    items.push({
      id: "empty",
      label: "본문이 비어 있어요",
      severity: "warn",
      detail: "피드에 올릴 본문을 붙여 넣어 주세요.",
    });
    return items;
  }

  const firstLine = trimmed.split(/\r?\n/)[0] ?? "";
  const firstLineLen = firstLine.length;
  if (firstLineLen < 40) {
    items.push({
      id: "hook-short",
      label: "첫 줄이 짧은 편이에요",
      severity: "info",
      detail:
        "접히기 전에 보이는 첫 1~2줄이 중요해요. 핵심이나 약속을 120~180자 안에 넣어 두면 스크롤 멈추기 쉬운 경우가 많습니다.",
    });
  } else if (firstLineLen > 220) {
    items.push({
      id: "hook-long",
      label: "첫 줄이 깁니다",
      severity: "info",
      detail:
        "미리보기에서 잘릴 수 있어요. 첫 줄에 한 줄 요약만 두고, 이어서 본문을 나누는 식도 괜찮습니다.",
    });
  } else {
    items.push({
      id: "hook-ok",
      label: "첫 줄 길이는 무난해요",
      severity: "pass",
      detail: `${firstLineLen}자 — 한눈에 읽히는 길이입니다.`,
    });
  }

  const paragraphs = trimmed.split(/\r?\n\r?\n/).filter(Boolean);
  const firstBlock = paragraphs[0] ?? trimmed;
  if (URL_REGEX.test(firstBlock)) {
    items.push({
      id: "link-early",
      label: "맨 위 블록에 외부 링크가 있어요",
      severity: "warn",
      detail:
        "일부 창작자는 첫 블록 링크가 체류에 불리할 수 있다고 봅니다. 아래쪽이나 첫 댓글로 옮겨 보는 것도 방법이에요. (경험담에 가깝습니다)",
    });
  }

  const hashtags = firstBlock.match(HASHTAG_REGEX) ?? [];
  if (hashtags.length > 3) {
    items.push({
      id: "tags-many",
      label: "위쪽 해시태그가 많아요",
      severity: "warn",
      detail: "한눈에 읽기 어려울 수 있어요. 두세 개로 줄이거나 본문 끝으로 옮겨 보세요.",
    });
  }

  const emojiCount = (trimmed.match(/\p{Emoji_Presentation}/gu) ?? []).length;
  if (emojiCount > 12) {
    items.push({
      id: "emoji",
      label: "이모지가 많이 들어갔어요",
      severity: "info",
      detail: "톤에 따라 과할 수 있어요. 꼭 쓰고 싶은 구간만 남기고 줄여 보세요.",
    });
  }

  const endsWithQuestion = /[?？]\s*$/.test(trimmed.trimEnd());
  if (!endsWithQuestion) {
    items.push({
      id: "cta",
      label: "마지막에 질문이 없어요",
      severity: "info",
      detail:
        "댓글을 부르려면 끝에 답하기 쉬운 질문 하나를 두는 패턴이 흔합니다.",
    });
  } else {
    items.push({
      id: "cta-ok",
      label: "질문으로 끝나요",
      severity: "pass",
      detail: "대화로 이어가기 좋은 마무리예요.",
    });
  }

  if (trimmed.length > 2800) {
    items.push({
      id: "length",
      label: "꽤 긴 글이에요",
      severity: "info",
      detail: "‘더 보기’ 뒤가 길어질수록 소제목·짧은 목록으로 눈길을 나눠 주면 읽기 편해집니다.",
    });
  }

  return items;
}
