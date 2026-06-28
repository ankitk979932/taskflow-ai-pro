import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";
import EmptyState from "../components/EmptyState";
import { boardService } from "../services/boardService";
import { useAsync } from "../hooks/useAsync";
import { getErrorMessage } from "../utils/formatters";

const BoardsPage = () => {
  const { data: boards, setData: setBoards, loading, error } = useAsync(() => boardService.list(), []);
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitError, setSubmitError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSubmitError("");
    setActionError("");
    try {
      const board = await boardService.create(form);
      setBoards((current) => [board, ...(current || [])]);
      setForm({ title: "", description: "" });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeBoard = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setActionError("");
    try {
      await boardService.remove(deleteTarget._id);
      setBoards((current) => current.filter((board) => board._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Loading boards" />;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="panel h-fit">
        <h1 className="text-xl font-bold tracking-normal">Create board</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <ErrorAlert message={submitError} />
          <label className="space-y-1">
            <span className="label">Title</span>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={2} />
          </label>
          <label className="space-y-1">
            <span className="label">Description</span>
            <textarea className="input min-h-24 resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <button className="btn-primary w-full" disabled={saving}><Plus className="h-4 w-4" />{saving ? "Creating" : "Create board"}</button>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Boards</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Open a board to create, filter, move, and search tasks.</p>
        </div>
        <ErrorAlert message={error || actionError} />
        {boards?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boards.map((board) => (
              <article key={board._id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/boards/${board._id}`} className="min-w-0">
                    <h2 className="line-clamp-2 font-semibold text-zinc-950 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">{board.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">{board.description || "No description"}</p>
                  </Link>
                  <button className="icon-btn h-9 w-9 shrink-0" onClick={() => setDeleteTarget(board)} title="Delete board">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                  <span>{board.totalTasks || 0} tasks</span>
                  <span>{board.completedTasks || 0} done</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No boards found" description="Create your first board with the form on the left." />
        )}
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete board?"
        description={`This will delete "${deleteTarget?.title || "this board"}" and all tasks inside it.`}
        confirmLabel="Delete board"
        loading={deleting}
        onConfirm={removeBoard}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default BoardsPage;
