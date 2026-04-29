"use client";

import { useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";
import type { Habit } from "@/types/habit";
import { getHabitSlug } from "@/lib/slug";
import { calculateCurrentStreak } from "@/lib/streaks";
import { getTodayISODate } from "@/lib/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type HabitCardProps = {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onToggleComplete: (habit: Habit) => void;
};

const DESCRIPTION_PREVIEW_LENGTH = 120;

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HabitCard({
  habit,
  onEdit,
  onDelete,
  onToggleComplete,
}: HabitCardProps) {
  const [showMore, setShowMore] = useState(false);
  const slug = getHabitSlug(habit.name);
  const today = getTodayISODate();

  const isCompletedToday = habit.completions.includes(today);

  const streak = useMemo(
    () => calculateCurrentStreak(habit.completions, today),
    [habit.completions, today]
  );

  const description = habit.description.trim() || "No description";
  const isLong = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const visibleDescription =
    !isLong || showMore
      ? description
      : `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`;

  return (
    <Card data-testid={`habit-card-${slug}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{habit.name}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open habit actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              data-testid={`habit-edit-${slug}`}
              onClick={() => onEdit(habit)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid={`habit-delete-${slug}`}
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(habit)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-6 text-muted-foreground">
              {visibleDescription}
              {isLong ? (
                <span
                  className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
                  onClick={() => setShowMore((value) => !value)}
                >
                  {showMore ? "Show less" : "Show more"}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p data-testid={`habit-streak-${slug}`} className="font-medium">
              Current streak: {streak}
            </p>
            <p className="text-muted-foreground">
              Frequency: {habit.frequency}
            </p>
            <p className="text-muted-foreground">
              Created: {formatCreatedAt(habit.createdAt)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <Label
              htmlFor={`habit-complete-toggle-${slug}`}
              className="text-sm"
            >
              Complete today
            </Label>
            <Switch
              id={`habit-complete-toggle-${slug}`}
              data-testid={`habit-complete-${slug}`}
              checked={isCompletedToday}
              onCheckedChange={() => onToggleComplete(habit)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
