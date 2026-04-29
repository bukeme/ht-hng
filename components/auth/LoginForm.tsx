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

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
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

  const onSubmit = async (values: LoginValues) => {
    const result = login(values);

    if (!result.ok) {
      setError("root", { message: result.error });
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Use your email and password to continue.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              data-testid="auth-login-email"
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
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              data-testid="auth-login-password"
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
            data-testid="auth-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </Button>
        </form>
        <p>
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
}
