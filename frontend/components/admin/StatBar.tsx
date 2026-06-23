import { motion } from "framer-motion";

function StatBar({ label, value, max, color = "bg-orange-500" }: { label: string; value: number; max: number; color?: string }) {
  const percent = max > 0 ? Math.max(5, (value / max) * 100) : 0;
  
  return (
    <div className="group/bar">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 group-hover/bar:text-slate-900 transition-colors">{label}</span>
        <span className="font-mono text-sm font-black text-stone-900">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={`h-full rounded-full ${color} shadow-[0_0_12px_-2px_rgba(255,107,0,0.3)]`} 
        />
      </div>
    </div>
  );
}
export default StatBar;;