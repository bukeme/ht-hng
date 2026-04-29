"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { useAuthStore } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const session = useAuthStore((state) => state.session);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && session) {
      router.replace("/dashboard");
    }
  }, [hydrated, session, router]);

  if (!hydrated) {
    return <SplashScreen />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </main>
  );
}
