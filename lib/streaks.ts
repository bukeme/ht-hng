function getTodayISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const uniqueDates = Array.from(new Set(completions)).sort();

  if (uniqueDates.length === 0) {
    return 0;
  }

  const resolvedToday = today ?? getTodayISODate();

  if (!uniqueDates.includes(resolvedToday)) {
    return 0;
  }

  let streak = 0;
  let cursor = toUtcDate(resolvedToday);

  while (true) {
    const key = toDateKey(cursor);

    if (!uniqueDates.includes(key)) {
      break;
    }

    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
