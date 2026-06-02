import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: LucideIcon }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-normal">{value}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-md bg-gradient-to-br from-brand-indigo/15 to-brand-cyan/15 text-brand-indigo dark:text-brand-cyan">
          <Icon size={21} />
        </div>
      </div>
    </motion.div>
  );
}
