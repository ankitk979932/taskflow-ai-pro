import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, ListTodo, Plus } from "lucide-react";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import { analyticsService } from "../services/analyticsService";
import { boardService } from "../services/boardService";
import { useAsync } from "../hooks/useAsync";
import { formatDate } from "../utils/formatters";

const DashboardPage = () => {
  const summary = useAsync(() => analyticsService.summary(), []);
  const boards = useAsync(() => boardService.list(), []);

  if (summary.loading || boards.loading) return <LoadingState label="Loading dashboard" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">A quick pulse on work, effort, and overdue tasks.</p>
        </div>
        <Link to="/boards" className="btn-primary">
          <Plus className="h-4 w-4" />
          New board
        </Link>
      </div>

      <ErrorAlert message={summary.error || boards.error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={summary.data?.totalTasks || 0} icon={ListTodo} />
        <StatCard label="Completed" value={summary.data?.completedTasks || 0} hint={`${summary.data?.completionRate || 0}% completion`} icon={CheckCircle2} />
        <StatCard label="Overdue" value={summary.data?.overdueTasks || 0} icon={AlertTriangle} />
        <StatCard label="Effort done" value={`${summary.data?.completedEffort || 0}h`} hint={`${summary.data?.totalEffort || 0}h estimated`} icon={Clock} />
      </div>

      <AiSuggestionPanel />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Boards</h2>
            <Link to="/boards" className="text-sm font-semibold text-emerald-600">
              View all
            </Link>
          </div>
          {boards.data?.length ? (
            <div className="grid gap-3">
              {boards.data.slice(0, 5).map((board) => (
                <Link
                  key={board._id}
                  to={`/boards/${board._id}`}
                  className="rounded-lg border border-zinc-200 p-4 transition hover:border-emerald-300 dark:border-zinc-800 dark:hover:border-emerald-700"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{board.title}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">{board.description || "No description"}</p>
                    </div>
                    <span className="text-sm font-semibold text-zinc-500">
                      {board.completedTasks}/{board.totalTasks}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No boards yet" description="Create a board to start organizing tasks." />
          )}
        </div>

        <div className="panel">
          <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
          <div className="space-y-3">
            {summary.data?.recentActivity?.length ? (
              summary.data.recentActivity.map((item) => (
                <div key={item._id} className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
                  <p className="font-medium">{item.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.task?.title || item.board?.title || "Workspace"} - {formatDate(item.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
