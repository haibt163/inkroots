import { useEffect, useId, useRef, useState } from "react";
import { Pencil, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Mode = "animate" | "quiz";

export function StrokeWriter({
  character,
  fallback,
}: {
  character: string;
  fallback: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<{
    animateCharacter: () => Promise<void>;
    quiz: (opts: {
      onComplete?: (s: { totalMistakes: number }) => void;
    }) => void;
    cancelQuiz: () => void;
  } | null>(null);
  const { t } = useI18n();
  const labelId = useId();
  const [mode, setMode] = useState<Mode>("animate");
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [quizDone, setQuizDone] = useState<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    writerRef.current = null;
    setStatus("loading");
    setQuizDone(null);
    host.replaceChildren();

    const load = async () => {
      const HanziWriter = (await import("hanzi-writer")).default;
      if (cancelled || !hostRef.current) return;

      const tryChar = async (char: string) =>
        new Promise<boolean>((resolve) => {
          const box = boxRef.current;
          const size = Math.max(
            220,
            Math.min(320, Math.floor(box?.clientWidth || 320)),
          );
          const w = HanziWriter.create(hostRef.current as HTMLElement, char, {
            width: size,
            height: size,
            padding: Math.round(size * 0.08),
            strokeColor: "#1c1814",
            outlineColor: "#e4d9c8",
            radicalColor: "#9b2c1f",
            highlightColor: "#c45c4a",
            drawingColor: "#9b2c1f",
            strokeAnimationSpeed: 1.05,
            delayBetweenStrokes: 140,
            showCharacter: false,
            charDataLoader: (c, onComplete, onError) => {
              const localUrl = `/stroke-data/${encodeURIComponent(c)}.json`;
              fetch(localUrl)
                .then((res) => {
                  if (!res.ok) throw new Error("local-missing");
                  return res.json();
                })
                .then(onComplete)
                .catch(() => {
                  // Fallback to CDN if local stroke data is unavailable
                  fetch(
                    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`,
                  )
                    .then((res) => {
                      if (!res.ok) throw new Error("cdn-missing");
                      return res.json();
                    })
                    .then(onComplete)
                    .catch(onError);
              });
            },
            onLoadCharDataSuccess: () => resolve(true),
            onLoadCharDataError: () => resolve(false),
          });
          writerRef.current = w;
        });

      hostRef.current.replaceChildren();
      let ok = await tryChar(character);
      if (cancelled) return;
      if (!ok && fallback !== character) {
        hostRef.current.replaceChildren();
        ok = await tryChar(fallback);
      }
      if (cancelled) return;
      if (!ok) {
        setStatus("missing");
        writerRef.current = null;
        return;
      }
      setStatus("ready");
      await writerRef.current?.animateCharacter();
    };

    void load();
    return () => {
      cancelled = true;
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
    };
  }, [character, fallback]);

  const replay = () => {
    setMode("animate");
    setQuizDone(null);
    writerRef.current?.cancelQuiz();
    void writerRef.current?.animateCharacter();
  };

  const startQuiz = () => {
    if (!writerRef.current) return;
    setMode("quiz");
    setQuizDone(null);
    writerRef.current.cancelQuiz();
    writerRef.current.quiz({
      onComplete: (summary) => setQuizDone(summary.totalMistakes),
    });
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div
        ref={boxRef}
        className="relative mx-auto aspect-square w-full max-w-[20rem] overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]"
      >
        <div
          ref={hostRef}
          id={labelId}
          className={cn(
            "writer-host flex h-full w-full items-center justify-center",
            status === "missing" && "hidden",
          )}
          aria-label={t("strokeOrder")}
        />
        {status === "missing" ? (
          <p className="hanzi-glyph text-[7.5rem] font-medium leading-none text-foreground">
            {fallback}
          </p>
        ) : null}
        {status === "loading" ? (
          <div
            className="absolute inset-6 rounded-xl bg-muted"
            aria-hidden
          />
        ) : null}
      </div>
      {status === "missing" ? (
        <p className="mt-3 max-w-xs text-center text-sm text-muted-foreground">
          {t("writerMissing")}
        </p>
      ) : (
        <div className="mt-4 flex w-full max-w-[20rem] flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={replay}
            disabled={status !== "ready"}
          >
            {mode === "animate" ? (
              <Play className="size-3.5" aria-hidden />
            ) : (
              <RotateCcw className="size-3.5" aria-hidden />
            )}
            {t("replay")}
          </Button>
          <Button
            type="button"
            variant="seal"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={startQuiz}
            disabled={status !== "ready"}
          >
            <Pencil className="size-3.5" aria-hidden />
            {t("quizStrokes")}
          </Button>
        </div>
      )}
      {mode === "quiz" && quizDone === null && status === "ready" ? (
        <p className="mt-2 text-sm text-muted-foreground">{t("tracing")}</p>
      ) : null}
      {quizDone !== null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("correct")}
          {quizDone > 0 ? ` · ${quizDone}` : ""}
        </p>
      ) : null}
    </div>
  );
}
