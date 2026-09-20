import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { meaningOf, RADICALS } from "@/lib/radicals";
import type { Radical } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({ component: PracticePage });

type Question = {
  radical: Radical;
  options: string[];
  answer: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function buildRound(lang: "en" | "vi"): Question[] {
  const pool = RADICALS.filter((r) => r.frequency !== "rare");
  const picked = shuffle(pool).slice(0, 10);
  return picked.map((radical) => {
    const answer = meaningOf(radical, lang);
    const others = shuffle(
      pool.filter((r) => r.id !== radical.id).map((r) => meaningOf(r, lang)),
    )
      .filter((m, i, all) => all.indexOf(m) === i && m !== answer)
      .slice(0, 3);
    return {
      radical,
      answer,
      options: shuffle([answer, ...others]),
    };
  });
}

function PracticePage() {
  const { lang, t } = useI18n();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildRound(lang), [lang, seed]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }, [lang, seed]);

  const q = questions[index];
  const total = questions.length;

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const choose = (option: string) => {
    if (picked || !q) return;
    setPicked(option);
    if (option === q.answer) setScore((s) => s + 1);
  };

  const advance = () => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          {t("quizTitle")}
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {t("quizLead")}
        </h1>

        {done ? (
          <div className="mt-10 rounded-2xl bg-card px-6 py-12 text-center shadow-[var(--shadow-border)]">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {t("score")}
            </p>
            <p className="mt-3 font-display text-6xl font-medium tabular-nums">
              {score}
              <span className="text-2xl text-muted-foreground">/{total}</span>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button onClick={restart}>{t("playAgain")}</Button>
              <Button variant="outline" asChild>
                <Link to="/">{t("back")}</Link>
              </Button>
            </div>
          </div>
        ) : q ? (
          <div className="mt-10">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                {t("questionOf")}{" "}
                <span className="tabular-nums font-medium text-foreground">
                  {index + 1}
                </span>{" "}
                {t("of")} {total}
              </p>
              <p className="tabular-nums">
                {score} {t("correct").toLowerCase()}
              </p>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${((index + (picked ? 1 : 0)) / total) * 100}%` }}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-card px-6 py-10 text-center shadow-[var(--shadow-border)]">
              <p className="hanzi-glyph text-7xl font-medium leading-none text-foreground sm:text-8xl">
                {q.radical.character}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {q.radical.pinyin}
              </p>
              <p className="mt-6 text-sm font-medium">{t("chooseMeaning")}</p>
            </div>

            <ul className="mt-6 grid gap-2">
              {q.options.map((opt) => {
                const isAnswer = opt === q.answer;
                const isPick = picked === opt;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      disabled={Boolean(picked)}
                      onClick={() => choose(opt)}
                      className={cn(
                        "flex min-h-12 w-full items-center justify-center rounded-xl px-4 text-base font-medium capitalize text-foreground sm:text-sm",
                        "shadow-[var(--shadow-border)] transition-[background-color,color,transform,box-shadow] duration-150",
                        !picked &&
                          "bg-card hover:shadow-[var(--shadow-border-hover)]",
                        picked && isAnswer && "bg-primary text-primary-foreground",
                        picked &&
                          isPick &&
                          !isAnswer &&
                          "bg-secondary text-muted-foreground line-through",
                        picked && !isAnswer && !isPick && "bg-card opacity-50",
                      )}
                    >
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>

            {picked ? (
              <div className="mt-6">
                <Button className="w-full" onClick={advance}>
                  {index + 1 >= total ? t("seeResults") : t("nextQuestion")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-10">
            <Button onClick={restart}>{t("startQuiz")}</Button>
          </div>
        )}
      </section>
    </AppShell>
  );
}
