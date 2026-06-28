import { Navigate, Outlet } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-screen bg-zinc-50 dark:bg-zinc-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
      <section className="hidden bg-zinc-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-300">TaskFlow AI Pro</p>
          <h1 className="mt-6 max-w-xl text-5xl font-bold tracking-normal">Plan boards, move tasks, and estimate work with AI.</h1>
        </div>
        <div className="grid gap-4 text-sm text-zinc-300">
          {["Kanban boards with drag and drop", "Analytics for effort and overdue work", "Gemini suggestions for task planning"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
