import { X } from "lucide-react";
import { motion } from "framer-motion";

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="glass w-full max-w-2xl rounded-lg p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button className="btn-ghost size-9 px-0" onClick={onClose} title="Close">
            <X size={17} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
