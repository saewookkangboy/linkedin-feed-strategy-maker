"use client";

import { btnSecondaryClassName } from "@/components/ui/styles";
import { useCallback, useState } from "react";

type CopyablePlainBlockProps = {
  /** 루트 래퍼에 붙는 클래스(여백 등) */
  className?: string;
  text: string;
  /** 화면에 보일 때만 줄바꿈 유지(복사는 항상 원문 text) */
  variant?: "paragraphs" | "preformatted";
  copyLabel?: string;
  maxHeightClass?: string;
  monospace?: boolean;
  /** 헤더 왼쪽 보조 라벨 */
  eyebrow?: string;
};

/** JSON·쉘·고정폭 텍스트: 클립보드에는 원문 그대로, 화면은 줄바꿈·긴 문자열이 깨지지 않게 */
export function CopyablePlainBlock({
  className = "",
  text,
  variant = "preformatted",
  copyLabel = "전체 복사",
  maxHeightClass = "max-h-80",
  monospace = true,
  eyebrow,
}: CopyablePlainBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  const lines = text.split("\n");

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--surface)] dark:border-zinc-800/90 dark:bg-[var(--surface)] ${className || "mt-3"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] bg-zinc-50/40 px-3 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/25">
        {eyebrow ? (
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{eyebrow}</span>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => void copy()} className={btnSecondaryClassName}>
          {copied ? "복사됨" : copyLabel}
        </button>
      </div>
      {variant === "paragraphs" ? (
        <div
          className={`${maxHeightClass} overflow-y-auto space-y-3 px-4 py-4 text-sm leading-relaxed text-zinc-800 [overflow-wrap:anywhere] dark:text-zinc-200`}
        >
          {lines
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      ) : (
        <pre
          className={`${maxHeightClass} overflow-auto whitespace-pre-wrap break-words px-4 py-4 text-sm leading-relaxed text-zinc-800 [overflow-wrap:anywhere] dark:text-zinc-200 ${
            monospace ? "font-mono text-[13px] leading-normal" : "font-sans"
          }`}
        >
          {text}
        </pre>
      )}
    </div>
  );
}
