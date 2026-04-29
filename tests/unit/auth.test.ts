import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/auth";

describe("auth store", () => {
  beforeEach(() => {
    // reset state before each test
    useAuthStore.setState({
      users: [],
      session: null,
      hydrated: false,
    });
  });

  // 👇 add the new tests here
  it("returns null when session is null", () => {
    useAuthStore.setState({
      users: [],
      session: null,
    });

    const user = useAuthStore.getState().currentUser();
    expect(user).toBeNull();
  });

  it("returns null when session exists but user not found", () => {
    useAuthStore.setState({
      users: [],
      session: { userId: "123", email: "test@test.com" },
    });

    const user = useAuthStore.getState().currentUser();
    expect(user).toBeNull();
  });
  it("fails when email is empty", () => {
    const result = useAuthStore
      .getState()
      .signup({ email: "", password: "password123" });
    expect(result.ok).toBe(false);
  });

  it("fails when password is empty", () => {
    const result = useAuthStore
      .getState()
      .signup({ email: "test@test.com", password: "" });
    expect(result.ok).toBe(false);
  });

  it("fails when both email and password are empty on login", () => {
    const result = useAuthStore.getState().login({ email: "", password: "" });
    expect(result.ok).toBe(false);
  });
  it("clears session on logout", () => {
    const store = useAuthStore.getState();

    store.signup({ email: "test@test.com", password: "password123" });

    store.logout();

    expect(useAuthStore.getState().session).toBeNull();
  });
  it("auto hydrates when not hydrated", () => {
    const store = useAuthStore.getState();

    useAuthStore.setState({ hydrated: false });

    store.login({ email: "test@test.com", password: "password123" });

    expect(useAuthStore.getState().hydrated).toBe(true);
  });
  it("hydrate does nothing on server", () => {
    const originalWindow = global.window;

    // simulate server
    // @ts-ignore
    delete global.window;

    const store = useAuthStore.getState();

    expect(() => store.hydrate()).not.toThrow();

    global.window = originalWindow;
  });
});
