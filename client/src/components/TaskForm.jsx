import { useState } from "react";
import { Sparkles } from "lucide-react";
import ErrorAlert from "./ErrorAlert";
import { PRIORITIES, STATUSES } from "../utils/constants";
import { aiService } from "../services/aiService";
import { getErrorMessage, toDateInput } from "../utils/formatters";

const initialState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  estimatedEffort: 4
};

const TaskForm = ({ boards = [], initialTask = null, boardId = "", onSubmit, submitLabel = "Save task" }) => {
  const [form, setForm] = useState(() => ({
    ...initialState,
    ...initialTask,
    board: initialTask?.board?._id || initialTask?.board || boardId,
    dueDate: toDateInput(initialTask?.dueDate)
  }));
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [reasoning, setReasoning] = useState("");

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSuggest = async () => {
    if (!form.title.trim()) {
      setError("Task title is required before asking AI.");
      return;
    }

    setAiLoading(true);
    setError("");
    try {
      const suggestion = await aiService.suggest({ title: form.title, description: form.description });
      setForm((current) => ({
        ...current,
        estimatedEffort: suggestion.effort,
        dueDate: suggestion.dueDate,
        priority: suggestion.difficulty === "High" ? "high" : suggestion.difficulty === "Low" ? "low" : "medium"
      }));
      setReasoning(suggestion.reasoning);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        estimatedEffort: Number(form.estimatedEffort || 0),
        dueDate: form.dueDate || null
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="label">Title</span>
          <input className="input" name="title" value={form.title} onChange={update} required minLength={2} />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="label">Description</span>
          <textarea className="input min-h-24 resize-y" name="description" value={form.description} onChange={update} />
        </label>
        <label className="space-y-1">
          <span className="label">Board</span>
          <select className="input" name="board" value={form.board || ""} onChange={update} required>
            <option value="" disabled>Select board</option>
            {boards.map((board) => (
              <option key={board._id} value={board._id}>{board.title}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Status</span>
          <select className="input" name="status" value={form.status} onChange={update}>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Priority</span>
          <select className="input" name="priority" value={form.priority} onChange={update}>
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Due date</span>
          <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={update} />
        </label>
        <label className="space-y-1">
          <span className="label">Effort hours</span>
          <input className="input" type="number" name="estimatedEffort" min="0" max="200" value={form.estimatedEffort} onChange={update} />
        </label>
      </div>
      {reasoning ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{reasoning}</p> : null}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={handleSuggest} className="btn-secondary" disabled={aiLoading}>
          <Sparkles className="h-4 w-4" />
          {aiLoading ? "Suggesting" : "AI suggest"}
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving" : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
