import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "@/components/auth/SignupForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/lib/auth";
import { STORAGE_KEYS } from "@/lib/constants";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: replaceMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("auth flow", () => {
  beforeEach(() => {
    localStorage.clear();
    replaceMock.mockReset();
    useAuthStore.setState({
      users: [],
      session: null,
      hydrated: true,
    });
  });

  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();

    render(<SignupForm />);

    await user.type(screen.getByTestId("auth-signup-email"), "new@example.com");
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      const sessionRaw = localStorage.getItem(STORAGE_KEYS.session);
      expect(sessionRaw).not.toBeNull();
    });

    const session = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.session) || "null"
    );
    expect(session).toMatchObject({
      email: "new@example.com",
    });
    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for duplicate signup email", async () => {
    localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([
        {
          id: "user-1",
          email: "new@example.com",
          password: "password123",
          createdAt: "2026-04-29T00:00:00.000Z",
        },
      ])
    );

    useAuthStore.setState({
      users: [
        {
          id: "user-1",
          email: "new@example.com",
          password: "password123",
          createdAt: "2026-04-29T00:00:00.000Z",
        },
      ],
      session: null,
      hydrated: true,
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId("auth-signup-email"), "new@example.com");
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "User already exists"
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("submits the login form and stores the active session", async () => {
    const existingUser = {
      id: "user-1",
      email: "login@example.com",
      password: "password123",
      createdAt: "2026-04-29T00:00:00.000Z",
    };

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([existingUser]));
    useAuthStore.setState({
      users: [existingUser],
      session: null,
      hydrated: true,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "login@example.com"
    );
    await user.type(screen.getByTestId("auth-login-password"), "password123");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      const sessionRaw = localStorage.getItem(STORAGE_KEYS.session);
      expect(sessionRaw).not.toBeNull();
    });

    const session = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.session) || "null"
    );
    expect(session).toMatchObject({
      userId: "user-1",
      email: "login@example.com",
    });
    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error for invalid login credentials", async () => {
    const existingUser = {
      id: "user-1",
      email: "login@example.com",
      password: "password123",
      createdAt: "2026-04-29T00:00:00.000Z",
    };

    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([existingUser]));
    useAuthStore.setState({
      users: [existingUser],
      session: null,
      hydrated: true,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "login@example.com"
    );
    await user.type(
      screen.getByTestId("auth-login-password"),
      "wrong-password"
    );
    await user.click(screen.getByTestId("auth-login-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password"
    );
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });
});
