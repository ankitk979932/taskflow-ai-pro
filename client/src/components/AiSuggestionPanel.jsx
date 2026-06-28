import { useState } from "react";
import { CalendarDays, Clock, Gauge, Sparkles } from "lucide-react";
import ErrorAlert from "./ErrorAlert";
import { aiService } from "../services/aiService";
import { formatDate, getErrorMessage } from "../utils/formatters";

const AiSuggestionPanel = () => {
  const [form, setForm] = useState({ title: "", description: "" });
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSuggest = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuggestion(null);

    try {
      const data = await aiService.suggest(form);
      setSuggestion(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            AI planner
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Estimate effort, due date, and difficulty for any task.</p>
        </div>
        {suggestion?.source ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-normal text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            {suggestion.source}
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSuggest} className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="label">Task title</span>
            <input className="input" name="title" value={form.title} onChange={update} required minLength={2} />
          </label>
          <label className="space-y-1">
            <span className="label">Description</span>
            <input className="input" name="description" value={form.description} onChange={update} />
          </label>
        </div>
        <button className="btn-primary h-10 self-end" disabled={loading || !form.title.trim()}>
          <Sparkles className="h-4 w-4" />
          {loading ? "Thinking" : "Get AI suggestion"}
        </button>
      </form>

      <div className="mt-4">
        <ErrorAlert message={error} />
      </div>

      {suggestion ? (
        <div className="mt-5 grid gap-4 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="font-semibold">{suggestion.effort}h</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Estimated effort</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="font-semibold">{formatDate(suggestion.dueDate)}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Suggested due date</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Gauge className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="font-semibold">{suggestion.difficulty}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Difficulty</p>
            </div>
          </div>
          <p className="md:col-span-3 text-zinc-600 dark:text-zinc-300">{suggestion.reasoning}</p>
        </div>
      ) : null}
    </section>
  );
};

export default AiSuggestionPanel;
