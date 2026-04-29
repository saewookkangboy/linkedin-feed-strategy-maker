/** 공통 Tailwind 조각 — 페이지에서 import 해 재사용 */

export const inputClassName =
  "w-full rounded-lg border border-zinc-200/80 bg-[var(--surface)] px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-[#0a66c2]/25 dark:border-zinc-700/80 dark:bg-[var(--surface)] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-[#70b5f9]/20";

export const selectClassName = inputClassName;

export const textareaClassName =
  "w-full rounded-lg border border-zinc-200/80 bg-[var(--surface)] p-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-[#0a66c2]/25 dark:border-zinc-700/80 dark:bg-[var(--surface)] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-[#70b5f9]/20";

export const labelClassName =
  "text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400";

export const sectionCardClassName =
  "rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-5 sm:p-6 dark:border-zinc-800/90";

export const btnPrimaryClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a66c2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0957a5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a66c2] disabled:pointer-events-none disabled:opacity-45 dark:bg-[#378fe9] dark:hover:bg-[#5aa3f0]";

export const btnSecondaryClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 dark:border-zinc-700/80 dark:bg-[var(--surface)] dark:text-zinc-100 dark:hover:bg-zinc-800/50";

export const btnDangerOutlineClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200/80 bg-[var(--surface)] px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50/80 dark:border-red-900/50 dark:bg-[var(--surface)] dark:text-red-300 dark:hover:bg-red-950/30";
