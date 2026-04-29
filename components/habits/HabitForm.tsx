"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Habit } from "@/types/habit";
import { useHabitStore } from "@/lib/habits";
import { validateHabitName } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HabitFormValues = {
  name: string;
  description: string;
  frequency: "daily";
};

type HabitFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  habit?: Habit | null;
};

export function HabitForm({
  open,
  onOpenChange,
  userId,
  habit = null,
}: HabitFormProps) {
  const createHabit = useHabitStore((state) => state.createHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormValues>({
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      name: habit?.name ?? "",
      description: habit?.description ?? "",
      frequency: "daily",
    });
    clearErrors();
  }, [open, habit, reset, clearErrors]);

  const onSubmit = async (values: HabitFormValues) => {
    const validation = validateHabitName(values.name);

    if (!validation.valid) {
      setError("name", { message: validation.error ?? "Invalid habit name" });
      return;
    }

    const description = values.description.trim();

    if (habit) {
      const updated = updateHabit(habit.id, {
        name: validation.value,
        description,
      });

      if (!updated) {
        setError("root", {
          message: "Unable to update habit",
        });
        return;
      }
    } else {
      const created = createHabit({
        userId,
        name: validation.value,
        description,
      });

      if (!created) {
        setError("root", {
          message: "Unable to create habit",
        });
        return;
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit habit" : "Create habit"}</DialogTitle>
          <DialogDescription>
            {habit
              ? "Update the habit details and save your changes."
              : "Add a new habit to your dashboard."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          data-testid="habit-form"
        >
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit name</Label>
            <Input
              id="habit-name"
              data-testid="habit-name-input"
              placeholder="Drink water"
              {...register("name", {
                required: "Habit name is required",
              })}
              aria-invalid={!!errors.name}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-description">Description</Label>
            <textarea
              id="habit-description"
              data-testid="habit-description-input"
              rows={4}
              placeholder="Optional notes about this habit"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-frequency">Frequency</Label>
            <select
              id="habit-frequency"
              data-testid="habit-frequency-select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("frequency")}
              defaultValue="daily"
            >
              <option value="daily">Daily</option>
            </select>
          </div>

          {errors.root ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="habit-save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
