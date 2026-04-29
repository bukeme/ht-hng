"use client";

import { create } from "zustand";
import type { Habit } from "@/types/habit";
import { STORAGE_KEYS } from "./constants";
import { readJson, writeJson } from "./storage";
import { validateHabitName } from "./validators";

type CreateHabitInput = {
  userId: string;
  name: string;
  description?: string;
};

type UpdateHabitInput = {
  name: string;
  description: string;
};

type HabitState = {
  habits: Habit[];
  hydrated: boolean;
  hydrate: () => void;
  createHabit: (input: CreateHabitInput) => Habit | null;
  updateHabit: (habitId: string, input: UpdateHabitInput) => Habit | null;
  deleteHabit: (habitId: string) => void;
  toggleCompletion: (habitId: string, date: string) => Habit | null;
  habitsForUser: (userId: string) => Habit[];
};

function persistHabits(habits: Habit[]) {
  writeJson(STORAGE_KEYS.habits, habits);
}

function uniqueSortedDates(dates: string[]) {
  return Array.from(new Set(dates)).sort();
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getTodayISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = uniqueSortedDates(habit.completions);

  if (completions.includes(date)) {
    return {
      ...habit,
      completions: completions.filter((item) => item !== date),
    };
  }

  return {
    ...habit,
    completions: uniqueSortedDates([...completions, date]),
  };
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;

    const habits = readJson<Habit[]>(STORAGE_KEYS.habits, []);
    set({ habits, hydrated: true });
  },

  createHabit: ({ userId, name, description = "" }) => {
    const validation = validateHabitName(name);

    if (!validation.valid) {
      return null;
    }

    const habit: Habit = {
      id: createId(),
      userId,
      name: validation.value,
      description: description.trim(),
      frequency: "daily",
      createdAt: new Date().toISOString(),
      completions: [],
    };

    const habits = [...get().habits, habit];
    set({ habits });
    persistHabits(habits);

    return habit;
  },

  updateHabit: (habitId, input) => {
    const validation = validateHabitName(input.name);

    if (!validation.valid) {
      return null;
    }

    const habits = get().habits;
    const existing = habits.find((habit) => habit.id === habitId);

    if (!existing) {
      return null;
    }

    const updated: Habit = {
      ...existing,
      name: validation.value,
      description: input.description.trim(),
      frequency: "daily",
    };

    const nextHabits = habits.map((habit) =>
      habit.id === habitId ? updated : habit
    );

    set({ habits: nextHabits });
    persistHabits(nextHabits);

    return updated;
  },

  deleteHabit: (habitId) => {
    const nextHabits = get().habits.filter((habit) => habit.id !== habitId);
    set({ habits: nextHabits });
    persistHabits(nextHabits);
  },

  toggleCompletion: (habitId, date) => {
    const habit = get().habits.find((item) => item.id === habitId);

    if (!habit) {
      return null;
    }

    const updated = toggleHabitCompletion(habit, date);
    const nextHabits = get().habits.map((item) =>
      item.id === habitId ? updated : item
    );

    set({ habits: nextHabits });
    persistHabits(nextHabits);

    return updated;
  },

  habitsForUser: (userId) => {
    return get().habits.filter((habit) => habit.userId === userId);
  },
}));
