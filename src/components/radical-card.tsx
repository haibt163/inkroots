import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { getRadicalIcon } from "@/lib/icons";
import { meaningOf } from "@/lib/radicals";
import type { Radical } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function RadicalCard({
  radical,
  index,
}: {
  radical: Radical;
  index: number;
}) {
  const { lang } = useI18n();
  const learned = useProgress((s) => s.learned.includes(radical.id));
  const Icon = getRadicalIcon(radical.icon);
  const delay = Math.min(index, 12) * 30;

  return (
    <Link
      to="/radical/$id"
      params={{ id: String(radical.id) }}
      className={cn(
        "group relative flex flex-col rounded-xl bg-card p-3.5 shadow-[var(--shadow-border)]",
        "outline-none transition-[transform,box-shadow] duration-200 ease-out",
        "[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[var(--shadow-border-hover)]",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "enter-fade",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="tabular-nums text-[11px] font-medium text-muted-foreground">
          {String(radical.id).padStart(3, "0")}
          <span className="mx-1 text-border">·</span>
          {radical.strokes}
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <p className="hanzi-glyph mt-3 text-center text-[2.65rem] font-medium leading-none text-foreground sm:text-[2.85rem]">
        {radical.character}
      </p>
      {radical.variant ? (
        <p className="hanzi-glyph mt-1.5 text-center text-sm text-muted-foreground">
          {radical.variant}
        </p>
      ) : (
        <div className="mt-1.5 h-5" />
      )}
      <p className="mt-2 text-center font-sans text-[13px] text-muted-foreground">
        {radical.pinyin}
      </p>
      <p className="mt-0.5 truncate text-center text-sm font-medium capitalize">
        {meaningOf(radical, lang)}
      </p>
      {learned ? (
        <span className="absolute bottom-3 left-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
    </Link>
  );
}
