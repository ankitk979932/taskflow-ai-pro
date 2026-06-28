export const STATUSES = [
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" }
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export const priorityTone = {
  low: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  medium: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
};
