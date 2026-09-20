import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <TooltipProvider delayDuration={400}>
      <div className="relative isolate flex min-h-dvh flex-col bg-background text-foreground">
        <AppHeader />
        <main id="content" className="flex-1 bg-background">
          {children}
        </main>
        <footer className="border-t border-border bg-background py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <p className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
            {t("footer")}
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
