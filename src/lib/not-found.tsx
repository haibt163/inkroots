import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export function AppNotFound() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <p className="hanzi-glyph text-6xl text-primary">无</p>
        <h1 className="mt-6 font-display text-3xl font-medium tracking-tight">
          This page is not here
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The radical you asked for is outside the 214.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/">All radicals</Link>
        </Button>
      </div>
    </AppShell>
  );
}
