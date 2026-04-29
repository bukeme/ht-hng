"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Habit } from "@/types/habit";
import { useAuthStore } from "@/lib/auth";
import { getTodayISODate, useHabitStore } from "@/lib/habits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HabitCard } from "./HabitCard";
import { HabitForm } from "./HabitForm";

export function HabitList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const users = useAuthStore((state) => state.users);
  const session = useAuthStore((state) => state.session);

  const hydrateHabits = useHabitStore((state) => state.hydrate);
  const habits = useHabitStore((state) => state.habits);
  const hydrated = useHabitStore((state) => state.hydrated);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);

  useEffect(() => {
    hydrateHabits();
  }, [hydrateHabits]);

  const currentUser = useMemo(() => {
    if (!session) return null;
    return (
      users.find(
        (user) => user.id === session.userId && user.email === session.email
      ) ?? null
    );
  }, [session, users]);

  const userHabits = useMemo(() => {
    if (!currentUser) return [];
    return habits.filter((habit) => habit.userId === currentUser.id);
  }, [currentUser, habits]);

  const handleToggle = (habit: Habit) => {
    toggleCompletion(habit.id, getTodayISODate());
  };

  if (!hydrated) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading habits…</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Your habits</h2>
          <p className="text-sm text-muted-foreground">
            Track progress, streaks, and daily completion.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          data-testid="create-habit-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create habit
        </Button>
      </div>

      {userHabits.length === 0 ? (
        <div
          data-testid="empty-state"
          className="rounded-2xl border border-dashed p-8 text-center"
        >
          <p className="text-base font-medium">No habits yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first habit to start tracking.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {userHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={setEditingHabit}
              onDelete={setDeletingHabit}
              onToggleComplete={handleToggle}
            />
          ))}
        </div>
      )}

      {currentUser ? (
        <HabitForm
          open={createOpen}
          onOpenChange={setCreateOpen}
          userId={currentUser.id}
        />
      ) : null}

      {currentUser && editingHabit ? (
        <HabitForm
          open={!!editingHabit}
          onOpenChange={(open) => {
            if (!open) setEditingHabit(null);
          }}
          userId={currentUser.id}
          habit={editingHabit}
        />
      ) : null}

      <Dialog
        open={!!deletingHabit}
        onOpenChange={(open) => {
          if (!open) setDeletingHabit(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete habit</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The habit will be removed from your
              list.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingHabit(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-testid="confirm-delete-button"
              onClick={() => {
                if (deletingHabit) {
                  deleteHabit(deletingHabit.id);
                  setDeletingHabit(null);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
