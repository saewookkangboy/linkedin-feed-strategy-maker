type ComplianceVariant = "default" | "compact";

export function ComplianceNote({ variant = "default" }: { variant?: ComplianceVariant }) {
  const body = (
    <>
      링크드인 <strong>알고리즘을 뜯어보는 도구가 아닙니다</strong>. 트렌드와 브리프는{" "}
      <strong>여기에 붙여 넣은 본문</strong>과 공개된 피드 원칙만 보고 만듭니다. 선택으로 넣은
      게시물 URL도 <strong>자동으로 열어 가져오지 않습니다</strong>. 로그인을 대신 하거나 몰래
      긁어 오지 않으며, 자료는 이 브라우저에만 남습니다.
    </>
  );

  if (variant === "compact") {
    return (
      <details className="group rounded-xl border border-[var(--hairline)] bg-[var(--surface)] text-sm text-zinc-700 dark:border-zinc-800/80 dark:bg-[var(--surface)] dark:text-zinc-300">
        <summary className="cursor-pointer list-none px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <span>링크드인이랑 어떻게 이어지나요?</span>
            <span className="text-[10px] font-normal text-zinc-400 transition group-open:rotate-180 dark:text-zinc-500">
              ▼
            </span>
          </span>
        </summary>
        <div className="border-t border-[var(--hairline)] px-4 pb-4 pt-3 leading-relaxed dark:border-zinc-800/80">
          {body}
        </div>
      </details>
    );
  }

  return (
    <aside className="rounded-xl border border-[var(--hairline)] border-l-[3px] border-l-zinc-400 bg-[var(--surface)] px-4 py-4 text-sm text-zinc-600 dark:border-zinc-800/80 dark:border-l-zinc-500 dark:bg-[var(--surface)] dark:text-zinc-400">
      <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">이렇게 쓰고 있어요</p>
      <p className="mt-2 leading-relaxed">{body}</p>
    </aside>
  );
}
