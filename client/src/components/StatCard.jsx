const StatCard = ({ label, value, hint, icon: Icon }) => (
  <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-normal text-zinc-950 dark:text-white">{value}</p>
      </div>
      {Icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
    </div>
    {hint ? <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
  </div>
);

export default StatCard;
