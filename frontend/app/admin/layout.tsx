import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { ChartPieSlice, House, SignOut, Storefront, Users } from "@phosphor-icons/react/dist/ssr";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-[#f8faf9]">
        <aside className="fixed left-0 top-0 flex h-full w-72 flex-col bg-[#1f2925] text-white shadow-2xl">
          <div className="flex h-24 items-center px-8">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-sm font-black text-white">AD</div>
              <div>
                <p className="text-lg font-black tracking-tight">Admin Panel</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/35">System overview</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4">
            <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/15">
              <ChartPieSlice size={22} weight="fill" />
              Tổng quan
            </Link>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold text-white/35">
              <Users size={22} weight="bold" />
              Người dùng
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold text-white/35">
              <Storefront size={22} weight="bold" />
              Nhà hàng
            </div>
          </nav>

          <div className="p-4">
            <Link href="/" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-black text-white transition-all hover:bg-white/10">
              <House size={16} weight="bold" />
              Về trang chính
            </Link>
          </div>
        </aside>

        <main className="ml-72 flex-1 p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
