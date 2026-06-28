import { CalendarDays, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatters";
import { priorityTone } from "../utils/constants";

const TaskCard = ({ task, dragHandleProps }) => (
  <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-700">
    <div className="flex items-start justify-between gap-3" {...dragHandleProps}>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-950 dark:text-white">{task.title}</h3>
        {task.description ? <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{task.description}</p> : null}
      </div>
      <Link to={`/tasks/${task._id}`} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-white" title="Open task">
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      <span className={`rounded-full px-2 py-1 font-semibold ${priorityTone[task.priority] || priorityTone.medium}`}>
        {task.priority}
      </span>
      <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
        <Clock className="h-3.5 w-3.5" />
        {task.estimatedEffort || 0}h
      </span>
      <span className={`inline-flex items-center gap-1 ${task.isOverdue ? "text-rose-600 dark:text-rose-300" : "text-zinc-500 dark:text-zinc-400"}`}>
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(task.dueDate)}
      </span>
    </div>
  </div>
);

export default TaskCard;
