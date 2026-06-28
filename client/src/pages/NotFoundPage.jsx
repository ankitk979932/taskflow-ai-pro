import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-950 dark:bg-zinc-950 dark:text-white">
    <div className="max-w-md text-center">
      <p className="text-sm font-bold uppercase tracking-normal text-emerald-600">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-normal">Page not found</h1>
      <p className="mt-3 text-zinc-500 dark:text-zinc-400">The page you opened does not exist in this workspace.</p>
      <Link className="btn-primary mt-6" to="/">Go dashboard</Link>
    </div>
  </main>
);

export default NotFoundPage;
