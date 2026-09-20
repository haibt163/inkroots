import { useMemo, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RadicalCard } from "@/components/radical-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { filterRadicals, RADICAL_COUNT, strokeCounts } from "@/lib/radicals";
import type { Frequency } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

type FreqFilter = Frequency | "all" | "learned";

function Home() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [strokes, setStrokes] = useState<number | "all">("all");
  const [frequency, setFrequency] = useState<FreqFilter>("all");
  const learned = useProgress((s) => s.learned);
  const learnedSet = useMemo(() => new Set(learned), [learned]);

  const list = useMemo(
    () => filterRadicals({ query, strokes, frequency, learnedIds: learnedSet }),
    [query, strokes, frequency, learnedSet],
  );

  const counts = strokeCounts();
  const freqOptions: { id: FreqFilter; label: string }[] = [
    { id: "all", label: t("all") },
    { id: "core", label: t("core") },
    { id: "common", label: t("common") },
    { id: "rare", label: t("rare") },
    { id: "learned", label: t("learned") },
  ];

  const clear = () => {
    setQuery("");
    setStrokes("all");
    setFrequency("all");
  };

  const filtered = query || strokes !== "all" || frequency !== "all";

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
        <div className="max-w-2xl enter-fade">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {t("tagline")}
          </p>
          <h1 className="mt-3 font-display text-[2.35rem] font-medium leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            {t("appName")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("intro")}
          </p>
        </div>

        <div className="mt-8 enter-fade stagger-2">
          <label className="sr-only" htmlFor="radical-search">
            {t("search")}
          </label>
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="radical-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              className="pl-10 pr-10"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label={t("clearFilters")}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 enter-fade stagger-3">
          <ChipRow label={t("filterBy")}>
            {freqOptions.map((opt) => (
              <Chip
                key={opt.id}
                active={frequency === opt.id}
                onClick={() => setFrequency(opt.id)}
              >
                {opt.label}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label={t("strokes")}>
            <Chip active={strokes === "all"} onClick={() => setStrokes("all")}>
              {t("all")}
            </Chip>
            {counts.map((n) => (
              <Chip
                key={n}
                active={strokes === n}
                onClick={() => setStrokes(n)}
              >
                {n}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div className="mt-6 flex items-baseline justify-between gap-3 text-sm text-muted-foreground">
          <p>
            <span className="tabular-nums font-medium text-foreground">
              {list.length}
            </span>{" "}
            {t("results")}
            {list.length !== RADICAL_COUNT ? (
              <span className="text-muted-foreground">
                {" "}
                · {RADICAL_COUNT}
              </span>
            ) : null}
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={clear}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("clearFilters")}
            </button>
          ) : null}
        </div>

        {list.length === 0 ? (
          <EmptyState
            message={
              frequency === "learned" && !query && strokes === "all"
                ? t("emptyLearned")
                : t("noResults")
            }
            action={
              <Button variant="outline" onClick={clear}>
                {t("clearFilters")}
              </Button>
            }
          />
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {list.map((r, i) => (
              <RadicalCard key={r.id} radical={r} index={i} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:w-16">
        {label}
      </span>
      <div className="chip-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">{children}</div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-3.5 text-sm font-medium tabular-nums transition-[background-color,color,transform] duration-150 sm:h-9",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action: ReactNode;
}) {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
