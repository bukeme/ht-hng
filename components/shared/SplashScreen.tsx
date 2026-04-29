"use client";

export function SplashScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className="flex flex-col items-center justify-center gap-3 text-center"
        data-testid="splash-screen"
      >
        <div className="h-14 w-14 animate-pulse rounded-2xl border bg-muted" />
        <h1 className="text-2xl font-semibold tracking-tight">Habit Tracker</h1>
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    </main>
  );
}
