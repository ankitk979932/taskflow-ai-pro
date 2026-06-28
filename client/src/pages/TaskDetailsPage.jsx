import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorAlert from "../components/ErrorAlert";
import LoadingState from "../components/LoadingState";
import TaskForm from "../components/TaskForm";
import { boardService } from "../services/boardService";
import { taskService } from "../services/taskService";
import { useAsync } from "../hooks/useAsync";
import { getErrorMessage } from "../utils/formatters";

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const taskState = useAsync(() => taskService.get(taskId), [taskId]);
  const boardsState = useAsync(() => boardService.list(), []);

  useEffect(() => {
    setError("");
  }, [taskId]);

  const updateTask = async (payload) => {
    const updated = await taskService.update(taskId, payload);
    taskState.setData(updated);
  };

  const deleteTask = async () => {
    setDeleting(true);
    setError("");
    try {
      await taskService.remove(taskId);
      navigate(taskState.data?.board?._id ? `/boards/${taskState.data.board._id}` : "/boards");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  if (taskState.loading || boardsState.loading) return <LoadingState label="Loading task" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={taskState.data?.board?._id ? `/boards/${taskState.data.board._id}` : "/boards"} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300">
            <ArrowLeft className="h-4 w-4" />
            Back to board
          </Link>
          <h1 className="text-2xl font-bold tracking-normal">Task details</h1>
        </div>
        <button className="btn-danger" onClick={() => setConfirmDeleteOpen(true)}><Trash2 className="h-4 w-4" />Delete</button>
      </div>
      <ErrorAlert message={taskState.error || boardsState.error || error} />
      <section className="panel">
        <TaskForm boards={boardsState.data || []} initialTask={taskState.data} onSubmit={updateTask} submitLabel="Update task" />
      </section>
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete task?"
        description={`This will permanently delete "${taskState.data?.title || "this task"}".`}
        confirmLabel="Delete task"
        loading={deleting}
        onConfirm={deleteTask}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};

export default TaskDetailsPage;
