"use client";

import { btnSecondaryClassName } from "@/components/ui/styles";
import { useCallback, useState } from "react";

type CopyTextButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

/** 한 덩어리 텍스트만 클립보드로 보낼 때(카드 안 등 소형 UI) */
export function CopyTextButton({
  text,
  label = "복사",
  copiedLabel = "복사됨",
  className = "",
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className={`${btnSecondaryClassName} shrink-0 px-2.5 py-1 text-xs ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
