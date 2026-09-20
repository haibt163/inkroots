import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StrokeWriter } from "@/components/stroke-writer";
import { Button } from "@/components/ui/button";
import { speakChinese, stopSpeaking } from "@/lib/audio";
import { getRadicalIcon } from "@/lib/icons";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import {
  exampleMeaning,
  getRadical,
  meaningOf,
  neighbors,
  storyOf,
} from "@/lib/radicals";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/radical/$id")({
  component: RadicalPage,
  loader: ({ params }) => {
    const id = Number(params.id);
    const radical = getRadical(id);
    if (!radical) throw notFound();
    return { radical };
  },
});

function RadicalPage() {
  const { radical } = Route.useLoaderData();
  const { lang, t } = useI18n();
  const learned = useProgress((s) => s.learned.includes(radical.id));
  const toggle = useProgress((s) => s.toggleLearned);
  const { prev, next } = neighbors(radical.id);
  const Icon = getRadicalIcon(radical.icon);
  const [speaking, setSpeaking] = useState(false);

  const play = async (text: string) => {
    setSpeaking(true);
    try {
      await speakChinese(text);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <AppShell>
      <article className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("back")}
          </Link>
          <div className="flex items-center gap-2">
            {prev ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/radical/$id"
                  params={{ id: String(prev.id) }}
                  aria-label={`${t("previous")} ${prev.character}`}
                >
                  <ArrowLeft className="size-3.5" aria-hidden />
                  <span className="hanzi-glyph">{prev.character}</span>
                </Link>
              </Button>
            ) : null}
            {next ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/radical/$id"
                  params={{ id: String(next.id) }}
                  aria-label={`${t("next")} ${next.character}`}
                >
                  <span className="hanzi-glyph">{next.character}</span>
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid items-start gap-8 sm:mt-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <StrokeWriter
            character={radical.writerChar}
            fallback={radical.character}
          />

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {String(radical.id).padStart(3, "0")}
              <span className="mx-1.5 text-border">·</span>
              {radical.strokes} {t("strokes").toLowerCase()}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <h1 className="hanzi-glyph text-6xl font-medium leading-none text-foreground sm:text-8xl">
                {radical.character}
              </h1>
              <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Icon className="size-5" strokeWidth={1.6} aria-hidden />
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <p className="text-xl text-muted-foreground">{radical.pinyin}</p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={t("listen")}
                aria-pressed={speaking}
                onClick={() => {
                  if (speaking) {
                    stopSpeaking();
                    setSpeaking(false);
                    return;
                  }
                  void play(radical.character);
                }}
              >
                {speaking ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
            </div>

            <p className="mt-3 font-display text-2xl capitalize leading-snug text-foreground">
              {meaningOf(radical, lang)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {radical.simplified ? (
                <span>
                  {t("simplified")}{" "}
                  <span className="hanzi-glyph text-foreground">
                    {radical.simplified}
                  </span>
                </span>
              ) : null}
              {radical.variant ? (
                <span>
                  {t("asComponent")}{" "}
                  <span className="hanzi-glyph text-lg text-foreground">
                    {radical.variant}
                  </span>
                </span>
              ) : null}
            </div>

            <Button
              type="button"
              variant={learned ? "seal" : "outline"}
              className="mt-6"
              onClick={() => toggle(radical.id)}
            >
              <Check className="size-4" aria-hidden />
              {learned ? t("markedLearned") : t("markLearned")}
            </Button>

            <section className="mt-10">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t("story")}
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground">
                {storyOf(radical, lang)}
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t("examples")}
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {radical.examples.map((ex) => (
                  <li
                    key={ex.character}
                    className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
                  >
                    <div className="min-w-0">
                      <p className="hanzi-glyph text-2xl leading-none">
                        {ex.character}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {ex.pinyin}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-foreground">
                        {exampleMeaning(ex, lang)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        "text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground",
                      )}
                      aria-label={`${t("listen")} ${ex.character}`}
                      onClick={() => void play(ex.character)}
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </article>
    </AppShell>
  );
}
