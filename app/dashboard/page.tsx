"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Button } from "@/components/ui/button";
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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <ProtectedRoute>
      <main
        className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
        data-testid="dashboard-page"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <header className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Signed in as {currentUser?.email ?? session?.email}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleLogout}
              data-testid="auth-logout-button"
            >
              Log out
            </Button>
          </header>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Authentication is working. You can connect the habit features
              next.
            </p>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
