import { ManagedOverviewResponse } from "@/lib/order";
import { motion } from "framer-motion";
import { ChartBar } from "@phosphor-icons/react";
const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
  preparing: "bg-orange-50 text-orange-700 ring-orange-100",
  delivering: "bg-sky-50 text-sky-700 ring-sky-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};
function StatusChart({ data, total }: { data: ManagedOverviewResponse["statusBreakdown"]; total: number }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(35,20,12,0.38)] ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Trạng thái</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">Luồng đơn hàng</h2>
        </div>
        <ChartBar size={30} weight="bold" className="text-orange-500" />
      </div>
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#23140c]/10 px-4 py-14 text-center">
            <p className="text-sm font-bold text-[#704322]/45">Chưa có đơn hàng để vẽ biểu đồ.</p>
          </div>
        ) : data.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.status}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone[item.status] ?? "bg-stone-50 text-stone-700 ring-stone-100"}`}>
                  {item.label}
                </span>
                <span className="text-sm font-black text-[#23140c]">{item.count} đơn</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#23140c]/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(6, (item.count / maxCount) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 22 }}
                  className="h-full rounded-full bg-[#ff6b00]"
                />
              </div>
              <p className="mt-1 text-[11px] font-bold text-[#704322]/40">{percent}% tổng đơn</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default StatusChart;