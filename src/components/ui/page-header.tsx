export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="pb-8">
      {eyebrow && (
        <p className="text-[11px] font-medium tracking-wide text-zinc-400 dark:text-zinc-500">{eyebrow}</p>
      )}
      <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[1.65rem]">
        {title}
      </h1>
      {description && (
        <div className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </div>
      )}
    </header>
  );
}
