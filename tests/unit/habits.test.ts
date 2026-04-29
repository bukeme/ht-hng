import { describe, expect, it } from "vitest";
import { toggleHabitCompletion } from "@/lib/habits";
import type { Habit } from "@/types/habit";

describe("toggleHabitCompletion", () => {
  const baseHabit: Habit = {
    id: "habit-1",
    userId: "user-1",
    name: "Drink Water",
    description: "Stay hydrated",
    frequency: "daily",
    createdAt: "2026-04-29T00:00:00.000Z",
    completions: [],
  };

  it("adds a completion date when the date is not present", () => {
    const result = toggleHabitCompletion(baseHabit, "2026-04-29");

    expect(result.completions).toContain("2026-04-29");
    expect(result.completions).toHaveLength(1);
  });

  it("removes a completion date when the date already exists", () => {
    const habit: Habit = {
      ...baseHabit,
      completions: ["2026-04-29"],
    };

    const result = toggleHabitCompletion(habit, "2026-04-29");

    expect(result.completions).not.toContain("2026-04-29");
    expect(result.completions).toHaveLength(0);
  });

  it("does not mutate the original habit object", () => {
    const habit: Habit = {
      ...baseHabit,
      completions: ["2026-04-28"],
    };

    const result = toggleHabitCompletion(habit, "2026-04-29");

    expect(habit.completions).toEqual(["2026-04-28"]);
    expect(result).not.toBe(habit);
  });

  it("does not return duplicate completion dates", () => {
    const habit: Habit = {
      ...baseHabit,
      completions: ["2026-04-29", "2026-04-29"],
    };

    const result = toggleHabitCompletion(habit, "2026-04-29");

    expect(result.completions).toEqual([]);
  });
});
