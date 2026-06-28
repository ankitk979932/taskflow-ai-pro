import { BarChart3, LayoutDashboard, LogOut, Moon, Sun, Trello } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/boards", label: "Boards", icon: Trello },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        <div className="text-xl font-bold tracking-normal">TaskFlow AI Pro</div>
        <nav className="mt-8 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-3 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-4">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">Welcome back</p>
              <h2 className="truncate text-base font-semibold">{user?.name}</h2>
            </div>
            <nav className="flex shrink-0 items-center gap-2">
              <div className="hidden gap-1 md:flex lg:hidden">
                {links.map(({ to, label }) => (
                  <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "text-zinc-600 dark:text-zinc-300"}`}>
                    {label}
                  </NavLink>
                ))}
              </div>
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button className="icon-btn" onClick={logout} title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl min-w-0 px-4 pb-24 pt-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-3 py-2 shadow-soft backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden" aria-label="Primary navigation">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>
              <Icon className="h-5 w-5" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
