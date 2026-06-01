import { ManageSidebar } from "@/components/layout/ManageSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ManageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute allowedRoles={["restaurant", "admin"]}>
      <div className="flex min-h-screen bg-[#fffcf8]">
        <ManageSidebar />
        <div className="ml-72 flex-1 p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
