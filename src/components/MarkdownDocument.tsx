"use client";

import { btnSecondaryClassName } from "@/components/ui/styles";
import { useCallback, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownDocumentProps = {
  markdown: string;
  /** 카드·스크롤 영역에 덧붙일 클래스 */
  className?: string;
  showCopy?: boolean;
  copyButtonLabel?: string;
  /** 스크롤 최대 높이 (Tailwind 클래스) */
  maxHeightClass?: string;
};

const mdComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-8 text-2xl font-semibold tracking-tight text-zinc-900 first:mt-0 dark:text-zinc-50"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-7 text-xl font-semibold tracking-tight text-zinc-900 first:mt-0 dark:text-zinc-50"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-5 text-lg font-semibold text-zinc-900 first:mt-0 dark:text-zinc-50" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mt-4 text-base font-semibold text-zinc-900 first:mt-0 dark:text-zinc-50" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-3 text-[15px] leading-[1.65] text-zinc-800 first:mt-0 dark:text-zinc-200" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="break-words pl-0.5" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-50" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => <em className="italic text-zinc-800 dark:text-zinc-200" {...props} />,
  a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
    const external = Boolean(href && /^https?:\/\//i.test(href));
    return (
      <a
        href={href}
        className="font-medium text-[#0a66c2] underline decoration-[#0a66c2]/30 underline-offset-2 hover:decoration-[#0a66c2] dark:text-[#90caf9] dark:decoration-[#90caf9]/40"
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...props}
      />
    );
  },
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-0 border-t border-zinc-200 dark:border-zinc-700" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-4 border-l-4 border-[#0a66c2]/40 py-1 pl-4 text-[15px] leading-relaxed text-zinc-700 dark:border-[#90caf9]/50 dark:text-zinc-300"
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full border-collapse text-left text-sm text-zinc-800 dark:text-zinc-200" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => <thead className="bg-zinc-50 dark:bg-zinc-900/80" {...props} />,
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-zinc-100 px-3 py-2 align-top dark:border-zinc-800" {...props} />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => <tr className="even:bg-zinc-50/50 dark:even:bg-zinc-900/30" {...props} />,
  code: ({
    className,
    children,
    ...props
  }: ComponentPropsWithoutRef<"code"> & { className?: string }) => {
    const isFenced = Boolean(className?.includes("language-"));
    if (isFenced) {
      return (
        <code
          className={`block font-mono text-[13px] leading-relaxed text-zinc-100 ${className ?? ""}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4 dark:border-zinc-600" {...props} />
  ),
};

export function MarkdownDocument({
  markdown,
  className = "",
  showCopy = true,
  copyButtonLabel = "원문 마크다운 복사",
  maxHeightClass = "max-h-[70vh]",
}: MarkdownDocumentProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [markdown]);

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--surface)] dark:border-zinc-800/90 dark:bg-[var(--surface)]">
        {showCopy && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hairline)] bg-zinc-50/40 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/25">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">문서</span>
            <button type="button" onClick={() => void copy()} className={btnSecondaryClassName}>
              {copied ? "복사됨" : copyButtonLabel}
            </button>
          </div>
        )}
        <div
          className={`${maxHeightClass} overflow-y-auto px-5 py-6 [overflow-wrap:anywhere] dark:text-zinc-100`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
