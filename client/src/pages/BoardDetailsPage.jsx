import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ArrowLeft, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingState from "../components/LoadingState";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { activityService } from "../services/activityService";
import { boardService } from "../services/boardService";
import { taskService } from "../services/taskService";
import { useAsync } from "../hooks/useAsync";
import { PRIORITIES, STATUSES } from "../utils/constants";
import { formatDate, getErrorMessage } from "../utils/formatters";

const groupTasks = (tasks) =>
  STATUSES.reduce((acc, status) => {
    acc[status.value] = tasks.filter((task) => task.status === status.value);
    return acc;
  }, {});

const BoardDetailsPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: "", priority: "", overdue: "", sort: "newest" });
  const [page, setPage] = useState(1);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState(false);
  const [boardForm, setBoardForm] = useState({ title: "", description: "" });
  const [actionError, setActionError] = useState("");

  const boardState = useAsync(async () => {
    const board = await boardService.get(boardId);
    setBoardForm({ title: board.title, description: board.description || "" });
    return board;
  }, [boardId]);

  const taskState = useAsync(
    () =>
      taskService.list({
        board: boardId,
        search: filters.search || undefined,
        priority: filters.priority || undefined,
        overdue: filters.overdue || undefined,
        sort: filters.sort || undefined,
        page,
        limit: 12
      }),
    [boardId, filters.search, filters.priority, filters.overdue, filters.sort, page]
  );

  const activityState = useAsync(() => activityService.list({ board: boardId, limit: 12 }), [boardId]);
  const taskItems = taskState.data?.data || [];
  const taskPage = taskState.data?.pagination;
  const grouped = useMemo(() => groupTasks(taskItems), [taskItems]);

  const handleCreateTask = async (payload) => {
    await taskService.create({ ...payload, board: payload.board || boardId });
    await taskState.refresh();
    setShowTaskForm(false);
    activityState.refresh();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) return;

    const taskId = result.draggableId;
    const nextStatus = result.destination.droppableId;

    try {
      await taskService.move(taskId, nextStatus);
      await taskState.refresh();
      await activityState.refresh();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const updateBoard = async (event) => {
    event.preventDefault();
    setActionError("");
    try {
      const updated = await boardService.update(boardId, boardForm);
      boardState.setData(updated);
      setEditingBoard(false);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const deleteBoard = async () => {
    if (!window.confirm("Delete this board and all tasks?")) return;
    await boardService.remove(boardId);
    navigate("/boards");
  };

  const updateFilter = (nextFilters) => {
    setPage(1);
    setFilters(nextFilters);
  };

  if (boardState.loading || taskState.loading) return <LoadingState label="Loading board" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to="/boards" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300">
            <ArrowLeft className="h-4 w-4" />
            Boards
          </Link>
          {editingBoard ? (
            <form onSubmit={updateBoard} className="grid gap-2 sm:grid-cols-[260px_1fr_auto]">
              <input className="input" value={boardForm.title} onChange={(e) => setBoardForm({ ...boardForm, title: e.target.value })} required />
              <input className="input" value={boardForm.description} onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })} />
              <button className="btn-primary">Save</button>
            </form>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-normal">{boardState.data?.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{boardState.data?.description || "No description"}</p>
            </>
          )}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button className="btn-secondary" onClick={() => setEditingBoard((value) => !value)}>
            {editingBoard ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editingBoard ? "Cancel" : "Edit"}
          </button>
          <button className="btn-danger" onClick={deleteBoard}>
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button className="btn-primary" onClick={() => setShowTaskForm((value) => !value)}>
            {showTaskForm ? <Plus className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {showTaskForm ? "Close" : "New task with AI"}
          </button>
        </div>
      </div>

      <ErrorAlert message={boardState.error || taskState.error || actionError} />

      {showTaskForm ? (
        <section className="panel">
          <h2 className="mb-4 text-lg font-semibold">New task</h2>
          <TaskForm boards={[boardState.data]} boardId={boardId} onSubmit={handleCreateTask} submitLabel="Create task" />
        </section>
      ) : null}

      <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="input pl-9"
              placeholder="Search tasks"
              value={filters.search}
              onChange={(e) => updateFilter({ ...filters, search: e.target.value })}
            />
          </label>
          <select className="input" value={filters.priority} onChange={(e) => updateFilter({ ...filters, priority: e.target.value })}>
            <option value="">All priorities</option>
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <select className="input" value={filters.overdue} onChange={(e) => updateFilter({ ...filters, overdue: e.target.value })}>
            <option value="">All dates</option>
            <option value="true">Overdue only</option>
          </select>
          <select className="input" value={filters.sort} onChange={(e) => updateFilter({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="due-asc">Due date soonest</option>
            <option value="due-desc">Due date latest</option>
          </select>
        </div>
      </section>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid min-w-0 gap-4 xl:grid-cols-4">
          {STATUSES.map((status) => (
            <section key={status.value} className="min-h-[360px] min-w-0 rounded-lg border border-zinc-200 bg-zinc-100/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-normal text-zinc-600 dark:text-zinc-300">{status.label}</h2>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-950 dark:text-zinc-300">
                  {grouped[status.value]?.length || 0}
                </span>
              </div>
              <Droppable droppableId={status.value}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-0 space-y-3">
                    {(grouped[status.value] || []).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(dragProvided) => (
                          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                            <TaskCard task={task} dragHandleProps={dragProvided.dragHandleProps} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {!grouped[status.value]?.length ? (
                      <div className="rounded-lg border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        Drop tasks here
                      </div>
                    ) : null}
                  </div>
                )}
              </Droppable>
            </section>
          ))}
        </div>
      </DragDropContext>

      {!taskItems.length ? <EmptyState title="No tasks match this view" description="Create a task or relax the filters." /> : null}

      {taskPage ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-zinc-500 dark:text-zinc-400">
            Page {taskPage.page} of {taskPage.pages}
          </span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={taskPage.page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              Previous
            </button>
            <button className="btn-secondary" disabled={taskPage.page >= taskPage.pages} onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          </div>
        </div>
      ) : null}

      <section className="panel">
        <h2 className="mb-4 text-lg font-semibold">Activity log</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {activityState.data?.length ? (
            activityState.data.map((item) => (
              <div key={item._id} className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
                <p className="font-medium">{item.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.task?.title || item.board?.title || "Workspace"} - {formatDate(item.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity for this board yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BoardDetailsPage;
