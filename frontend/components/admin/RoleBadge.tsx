"use client";

import { ComponentType } from "react";
import { 
  ShieldCheck, 
  Storefront, 
  User as UserIcon 
} from "@phosphor-icons/react";

type BadgeIcon = ComponentType<{ size?: number; weight?: "bold" | "fill" }>;



export default function RoleBadge({ role }: {role: string}) {
  const configs: Record<string, { label: string; icon: BadgeIcon; class: string }> = {
    admin: { label: "Admin", icon: ShieldCheck, class: "bg-purple-50 text-purple-600 ring-purple-100" },
    restaurant: { label: "Nhà hàng", icon: Storefront, class: "bg-blue-50 text-blue-600 ring-blue-100" },
    customer: { label: "Khách hàng", icon: UserIcon, class: "bg-orange-50 text-orange-600 ring-orange-100" },
  };

  const config = configs[role] || configs.customer;
  const Icon = config.icon;

  return (
    <div className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${config.class}`}>
      <Icon size={12} weight="bold" />
      {config.label}
    </div>
  );
}
