import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SealMark } from "@/components/seal-mark";
import { useI18n } from "@/lib/i18n";
import { RADICAL_COUNT } from "@/lib/radicals";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { lang, setLang, t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const learned = useProgress((s) => s.learned.length);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <SealMark glyph="永" className="size-8 text-base" />
          <span className="min-w-0">
            <span className="block font-display text-[15px] font-medium leading-tight tracking-tight text-foreground">
              {t("appName")}
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              {t("tagline")}
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <NavLink to="/" active={pathname === "/"}>
            {t("radicals")}
          </NavLink>
          <NavLink to="/practice" active={pathname.startsWith("/practice")}>
            {t("practice")}
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <p
            className="hidden tabular-nums text-xs text-muted-foreground sm:block"
            aria-label={`${learned} ${t("progressLabel")} ${t("of")} ${RADICAL_COUNT}`}
          >
            <span className="font-medium text-foreground">{learned}</span>
            <span className="mx-0.5">/</span>
            {RADICAL_COUNT} {t("progressLabel")}
          </p>
          <div
            className="flex h-11 rounded-full bg-secondary p-0.5"
            role="group"
            aria-label="Language"
          >
            <LangBtn active={lang === "en"} onClick={() => setLang("en")}>
              EN
            </LangBtn>
            <LangBtn active={lang === "vi"} onClick={() => setLang("vi")}>
              VI
            </LangBtn>
          </div>
        </div>
      </div>
      <nav className="flex border-t border-border md:hidden">
        <MobileNav to="/" active={pathname === "/"}>
          {t("radicals")}
        </MobileNav>
        <MobileNav to="/practice" active={pathname.startsWith("/practice")}>
          {t("practice")}
        </MobileNav>
      </nav>
    </header>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: "/" | "/practice";
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-[background-color,color] duration-150",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function MobileNav({
  to,
  active,
  children,
}: {
  to: "/" | "/practice";
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex h-12 flex-1 items-center justify-center text-sm font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function LangBtn({
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
        "h-10 min-w-10 rounded-full px-3 text-xs font-medium tracking-wide transition-[background-color,color,transform] duration-150",
        active
          ? "bg-card text-foreground shadow-[var(--shadow-border)]"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
