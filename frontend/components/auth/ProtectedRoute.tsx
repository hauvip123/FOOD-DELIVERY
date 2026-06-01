"use client";

import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const normalizedRole = normalizeRole(user?.role);
  const isRoleAllowed = !allowedRoles || allowedRoles.map(normalizeRole).includes(normalizedRole);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isRoleAllowed) {
        router.push("/"); // Or an unauthorized page
      }
    }
  }, [isAuthenticated, isLoading, isRoleAllowed, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isRoleAllowed) {
    return null;
  }

  return <>{children}</>;
}
