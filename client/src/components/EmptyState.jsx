const EmptyState = ({ title, description, action }) => (
  <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
    <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
    {description ? <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
