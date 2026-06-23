import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { ComponentType } from "react";
import { itemVariants } from "./type";
type DashboardIcon = ComponentType<{ size?: number; weight?: "bold" | "fill" }>;

function StatCard({ label, value, note, icon: Icon, colorClass }: { label: string; value: number; note: string; icon: DashboardIcon; colorClass: string }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)]"
    >
      {/* Perpetual micro-interaction: Subtle pulse bg */}
      <motion.div 
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -right-4 -top-4 size-32 rounded-full blur-3xl ${colorClass.split(' ')[0]}`}
      />

      <div className="relative flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div className={`grid size-12 place-items-center rounded-2xl ${colorClass} shadow-lg transition-transform group-hover:scale-110`}>
            <Icon size={24} weight="bold" />
          </div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowUpRight size={20} className="text-slate-300" />
          </motion.div>
        </div>
        
        <div className="mt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-2 font-mono text-4xl font-black tracking-tighter text-stone-900">
            {value.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex size-1.5 rounded-full bg-orange-500" />
            <p className="text-xs font-bold text-slate-400">{note}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default StatCard;