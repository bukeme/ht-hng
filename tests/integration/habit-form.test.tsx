import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HabitList } from "@/components/habits/HabitList";
import { useAuthStore } from "@/lib/auth";
import { useHabitStore, getTodayISODate } from "@/lib/habits";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Habit } from "@/types/habit";

const currentUser = {
  id: "user-1",
  email: "user@example.com",
  password: "password123",
  createdAt: "2026-04-29T00:00:00.000Z",
};

const session = {
  userId: "user-1",
  email: "user@example.com",
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function seedStores(habits: Habit[] = []) {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([currentUser]));
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));

  useAuthStore.setState({
    users: [currentUser],
    session,
    hydrated: true,
  });

  useHabitStore.setState({
    habits,
    hydrated: true,
  });
}

describe("habit form", () => {
  beforeEach(() => {
    seedStores();
  });

  it("shows a validation error when habit name is empty", async () => {
    const user = userEvent.setup();

    render(<HabitList />);

    await user.click(screen.getByTestId("create-habit-button"));
    await user.click(screen.getByTestId("habit-save-button"));

    expect(await screen.findByText("Habit name is required")).toBeTruthy();
  });

  it("creates a new habit and renders it in the list", async () => {
    const user = userEvent.setup();

    render(<HabitList />);

    await user.click(screen.getByTestId("create-habit-button"));
    await user.type(screen.getByTestId("habit-name-input"), "Drink Water");
    await user.type(
      screen.getByTestId("habit-description-input"),
      "Drink at least 2 liters of water every day."
    );
    await user.click(screen.getByTestId("habit-save-button"));

    expect(await screen.findByTestId("habit-card-drink-water")).toBeTruthy();

    const storedHabits = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.habits) || "[]"
    );

    expect(storedHabits).toHaveLength(1);
    expect(storedHabits[0]).toMatchObject({
      name: "Drink Water",
      userId: currentUser.id,
      frequency: "daily",
    });
  });

  it("edits an existing habit and preserves immutable fields", async () => {
    const habit: Habit = {
      id: "habit-1",
      userId: currentUser.id,
      name: "Read Books",
      description: "Read for 20 minutes",
      frequency: "daily",
      createdAt: "2026-04-20T12:00:00.000Z",
      completions: ["2026-04-29"],
    };

    seedStores([habit]);

    const user = userEvent.setup();
    render(<HabitList />);

    await user.click(
      screen.getByRole("button", { name: /open habit actions/i })
    );
    await user.click(await screen.findByTestId("habit-edit-read-books"));

    const nameInput = await screen.findByTestId("habit-name-input");
    const descriptionInput = screen.getByTestId(
      "habit-description-input"
    ) as HTMLTextAreaElement;

    await user.clear(nameInput);
    await user.type(nameInput, "Read Daily");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Read 30 minutes every day.");
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByTestId("habit-card-read-daily")).toBeTruthy();
    });

    const storedHabits = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.habits) || "[]"
    );

    expect(storedHabits[0]).toMatchObject({
      id: "habit-1",
      userId: currentUser.id,
      createdAt: "2026-04-20T12:00:00.000Z",
      completions: ["2026-04-29"],
      name: "Read Daily",
      description: "Read 30 minutes every day.",
      frequency: "daily",
    });
  });

  it("deletes a habit only after explicit confirmation", async () => {
    const habit: Habit = {
      id: "habit-1",
      userId: currentUser.id,
      name: "Meditate",
      description: "Meditate for 10 minutes",
      frequency: "daily",
      createdAt: "2026-04-20T12:00:00.000Z",
      completions: [],
    };

    seedStores([habit]);

    const user = userEvent.setup();
    render(<HabitList />);

    expect(screen.getByTestId("habit-card-meditate")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /open habit actions/i })
    );
    await user.click(await screen.findByTestId("habit-delete-meditate"));

    expect(screen.getByTestId("habit-card-meditate")).toBeTruthy();

    await user.click(screen.getByTestId("confirm-delete-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("habit-card-meditate")).toBeNull();
    });

    const storedHabits = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.habits) || "[]"
    );
    expect(storedHabits).toHaveLength(0);
  });

  it("toggles completion and updates the streak display", async () => {
    const habit: Habit = {
      id: "habit-1",
      userId: currentUser.id,
      name: "Drink Water",
      description: "Drink at least 2 liters of water every day.",
      frequency: "daily",
      createdAt: "2026-04-20T12:00:00.000Z",
      completions: [],
    };

    seedStores([habit]);

    const user = userEvent.setup();
    render(<HabitList />);

    const slug = "drink-water";
    expect(screen.getByTestId(`habit-streak-${slug}`).textContent).toContain(
      "0"
    );

    await user.click(screen.getByTestId(`habit-complete-${slug}`));

    await waitFor(() => {
      expect(screen.getByTestId(`habit-streak-${slug}`).textContent).toContain(
        "1"
      );
    });

    const storedHabits = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.habits) || "[]"
    );

    expect(storedHabits[0].completions).toContain(getTodayISODate());
  });
});
