import { Plus } from "lucide-react";

export function DataShell({ title, subtitle, actionLabel, onAction, children }: { title: string; subtitle: string; actionLabel: string; onAction: () => void; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">Operations</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <button className="btn-primary" onClick={onAction}>
          <Plus size={18} />
          {actionLabel}
        </button>
      </div>
      {children}
    </section>
  );
}
