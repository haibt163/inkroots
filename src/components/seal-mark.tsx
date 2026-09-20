import { cn } from "@/lib/utils";

export function SealMark({
  className,
  glyph = "一",
}: {
  className?: string;
  glyph?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground",
        "hanzi-glyph text-lg font-medium shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]",
        className,
      )}
    >
      {glyph}
    </span>
  );
}
