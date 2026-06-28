import { Loader2 } from "lucide-react";

const LoadingState = ({ label = "Loading" }) => (
  <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white/70 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
    <div className="flex items-center gap-2 text-sm font-medium">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  </div>
);

export default LoadingState;
