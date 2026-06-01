"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, resetPassword } from "@/lib/auth";
import { ArrowLeft, LockSimple } from "@phosphor-icons/react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, password });
      setMessage("Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (caughtError) {
      const message = caughtError instanceof ApiError ? caughtError.message : "Không thể đặt lại mật khẩu lúc này.";
      setError(message === "Reset password token is invalid or expired" ? "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#fff7ed] px-4 py-12">
      <section className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-[#ff6b00]">
          <ArrowLeft size={18} weight="bold" /> Quay lại đăng nhập
        </Link>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(35,20,12,0.35)] ring-1 ring-black/5 sm:p-10">
          <h1 className="text-4xl font-black tracking-tight text-[#23140c]">Đặt lại mật khẩu</h1>
          <p className="mt-3 font-medium text-[#704322]/70">Nhập mật khẩu mới cho tài khoản của bạn.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="reset-password" className="text-sm font-black uppercase tracking-widest text-[#23140c]/40">Mật khẩu mới</label>
              <div className="relative">
                <LockSimple size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40" />
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reset-confirm-password" className="text-sm font-black uppercase tracking-widest text-[#23140c]/40">Xác nhận mật khẩu</label>
              <div className="relative">
                <LockSimple size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40" />
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
            {message && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-16 w-full rounded-2xl bg-[#23140c] text-lg font-black text-white shadow-xl transition-all hover:bg-[#ff6b00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
