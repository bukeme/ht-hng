"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type SignupValues = {
  email: string;
  password: string;
};

export function SignupForm() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const signup = useAuthStore((state) => state.signup);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && session) {
      router.replace("/dashboard");
    }
  }, [hydrated, session, router]);

  const onSubmit = async (values: SignupValues) => {
    const result = signup(values);

    if (!result.ok) {
      setError("root", { message: result.error });
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create your account to get started.</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              data-testid="auth-signup-email"
              placeholder="name@example.com"
              {...register("email", {
                required: "Email is required",
              })}
              aria-invalid={!!errors.email}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              data-testid="auth-signup-password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
              })}
              aria-invalid={!!errors.password}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <Button
            className="w-full"
            type="submit"
            data-testid="auth-signup-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Sign up"}
          </Button>
        </form>
        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </CardContent>
    </Card>
  );
}
