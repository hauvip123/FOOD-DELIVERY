"use client";

interface RestaurantStatusBadgeProps {
  isOpen: boolean;
}

export default function RestaurantStatusBadge({ isOpen }: RestaurantStatusBadgeProps) {
  return (
    <div className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${
      isOpen 
        ? "bg-emerald-50 text-emerald-600 ring-emerald-100" 
        : "bg-slate-50 text-slate-400 ring-slate-100"
    }`}>
      <span className={`flex size-1 rounded-full ${isOpen ? "bg-emerald-500" : "bg-slate-400"}`} />
      {isOpen ? "Đang mở" : "Tạm nghỉ"}
    </div>
  );
}
