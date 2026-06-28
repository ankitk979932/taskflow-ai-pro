import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ErrorAlert from "../components/ErrorAlert";
import LoadingState from "../components/LoadingState";
import StatCard from "../components/StatCard";
import { analyticsService } from "../services/analyticsService";
import { useAsync } from "../hooks/useAsync";

const palette = ["#10b981", "#06b6d4", "#f59e0b", "#f43f5e"];

const AnalyticsPage = () => {
  const { data, loading, error } = useAsync(() => analyticsService.summary(), []);

  if (loading) return <LoadingState label="Loading analytics" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Analytics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Track status, priority, effort, and overdue work.</p>
      </div>
      <ErrorAlert message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={data?.totalTasks || 0} icon={ListTodo} />
        <StatCard label="Completed" value={data?.completedTasks || 0} hint={`${data?.completionRate || 0}% completion`} icon={CheckCircle2} />
        <StatCard label="Overdue" value={data?.overdueTasks || 0} icon={AlertTriangle} />
        <StatCard label="Effort" value={`${data?.totalEffort || 0}h`} hint={`${data?.completedEffort || 0}h completed`} icon={Clock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <h2 className="mb-4 text-lg font-semibold">Tasks by status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h2 className="mb-4 text-lg font-semibold">Priority mix</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.priorityBreakdown || []} dataKey="value" nameKey="name" outerRadius={105} label>
                  {(data?.priorityBreakdown || []).map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel xl:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Effort by status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.effortByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="effort" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPage;
