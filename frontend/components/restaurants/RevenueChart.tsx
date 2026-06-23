import { ManagedOverviewResponse } from "@/lib/order";
import {
  ChartLineUp,
} from "@phosphor-icons/react";
import { formatCompactMoney } from "./FormatCompactMoney";
function shortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}
function RevenueChart({ data }: { data: ManagedOverviewResponse["revenueSeries"] }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 320 : 24 + (index * 592) / (data.length - 1);
    const y = 190 - (item.revenue / maxRevenue) * 150;
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `24,206 ${line} 616,206`;

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(35,20,12,0.38)] ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b00]">Doanh thu</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#23140c]">7 ngày gần nhất</h2>
        </div>
        <ChartLineUp size={30} weight="bold" className="text-orange-500" />
      </div>
      <div className="overflow-hidden rounded-[1.5rem] bg-[#fffcf8] p-3 ring-1 ring-[#23140c]/5">
        <svg viewBox="0 0 640 240" className="h-64 w-full" role="img" aria-label="Biểu đồ doanh thu 7 ngày">
          {[40, 90, 140, 190].map((y) => (
            <line key={y} x1="24" x2="616" y1={y} y2={y} stroke="#23140c" strokeOpacity="0.07" strokeWidth="1" />
          ))}
          <polygon points={area} fill="#ff6b00" opacity="0.09" />
          <polyline points={line} fill="none" stroke="#ff6b00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.date}>
              <circle cx={point.x} cy={point.y} r="7" fill="#fffcf8" stroke="#ff6b00" strokeWidth="4" />
              <text x={point.x} y="226" textAnchor="middle" className="fill-[#704322] text-[12px] font-bold">
                {shortDate(point.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-7">
        {data.map((item) => (
          <div key={item.date} className="rounded-[1rem] bg-[#fffcf8] px-3 py-2 ring-1 ring-[#23140c]/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#704322]/35">{shortDate(item.date)}</p>
            <p className="mt-1 truncate text-xs font-black text-[#23140c]">{formatCompactMoney(item.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default RevenueChart;