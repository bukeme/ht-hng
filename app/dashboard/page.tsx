"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { HabitList } from "@/components/habits/HabitList";
import { useAuthStore } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const users = useAuthStore((state) => state.users);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  const currentUser = useMemo(() => {
    if (!session) return null;
    return (
      users.find(
        (user) => user.id === session.userId && user.email === session.email
      ) ?? null
    );
  }, [session, users]);

  //   useEffect(() => {
  //     if (!session) {
  //       router.replace("/login");
  //     }
  //   }, [session, router]);

  return (
    <ProtectedRoute>
      <main
        className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
        data-testid="dashboard-page"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <header className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">Dashboard</h1>
              <p className="truncate text-sm text-muted-foreground">
                Signed in as {currentUser?.email ?? session?.email}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              data-testid="auth-logout-button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              Log out
            </Button>
          </header>

          <HabitList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
