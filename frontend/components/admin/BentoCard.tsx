import { motion } from "framer-motion";
import { DashboardIcon, itemVariants } from "./type";
import { ReactNode } from "react";

function BentoCard({ 
  children, 
  className = "", 
  title, 
  subtitle,
  icon: Icon
}: { 
  children: ReactNode; 
  className?: string; 
  title?: string;
  subtitle?: string;
  icon?: DashboardIcon;
}) {
  return (
    <motion.div 
      variants={itemVariants}
      className={`group relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      {(title || Icon) && (
        <div className="mb-8 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-black tracking-tight text-stone-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs font-bold text-slate-400">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="grid size-10 place-items-center rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-orange-50 group-hover:text-orange-500">
              <Icon size={20} weight="bold" />
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
export default BentoCard;