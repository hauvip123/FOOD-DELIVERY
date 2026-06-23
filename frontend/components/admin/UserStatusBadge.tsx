"use client";

interface UserStatusBadgeProps {
  status: string;
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const configs: Record<string, { label: string; class: string }> = {
    active: { label: "Hoạt động", class: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    inactive: { label: "Không hoạt động", class: "bg-slate-50 text-slate-500 ring-slate-100" },
  };

  const config = configs[status] || configs.inactive;

  return (
    <div className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${config.class}`}>
      <span className="flex size-1 rounded-full bg-current" />
      {config.label}
    </div>
  );
}
