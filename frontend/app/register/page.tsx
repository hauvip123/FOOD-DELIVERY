"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ApiError, register } from "@/lib/auth";
import { User, EnvelopeSimple, LockSimple, ArrowRight, GithubLogo, GoogleLogo } from "@phosphor-icons/react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên hiển thị, email và mật khẩu.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      router.push("/login?registered=1&email=" + encodeURIComponent(email.trim()));
    } catch (caughtError) {
      const message = caughtError instanceof ApiError ? caughtError.message : "Không thể đăng ký lúc này.";
      setError(message === "User already exists" ? "Email này đã được đăng ký." : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#fff7ed]">
      <div className="mx-auto flex min-h-dvh max-w-[1400px] items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="grid w-full gap-10 overflow-hidden rounded-[3rem] bg-white p-4 shadow-[0_40px_100px_-40px_rgba(35,20,12,0.15)] ring-1 ring-black/5 lg:grid-cols-2 lg:p-10">

          {/* Left Side: Form */}
          <div className="flex flex-col justify-center px-4 py-8 sm:px-12 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="mb-12 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#ff6b00] text-lg font-black text-white italic">
                  HD
                </div>
                <span className="text-xl font-black tracking-tighter text-[#23140c]">HungerDash</span>
              </Link>

              <h1 className="text-4xl font-black tracking-tight text-[#23140c] sm:text-5xl">Bắt đầu ngay!</h1>
              <p className="mt-4 text-lg font-medium text-[#704322]/70">
                Tạo tài khoản để nhận ngay ưu đãi giảm 50% cho đơn hàng đầu tiên.
              </p>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="register-username" className="text-sm font-black uppercase tracking-widest text-[#23140c]/40 px-1">Tên hiển thị</label>
                  <div className="relative group">
                    <User size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40 transition-colors group-focus-within:text-[#ff6b00]" />
                    <input
                      id="register-username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                      disabled={isSubmitting}
                      className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-email" className="text-sm font-black uppercase tracking-widest text-[#23140c]/40 px-1">Email</label>
                  <div className="relative group">
                    <EnvelopeSimple size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40 transition-colors group-focus-within:text-[#ff6b00]" />
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="example@mail.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-sm font-black uppercase tracking-widest text-[#23140c]/40 px-1">Mật khẩu</label>
                  <div className="relative group">
                    <LockSimple size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40 transition-colors group-focus-within:text-[#ff6b00]" />
                    <input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#23140c] text-lg font-black text-white shadow-xl transition-all hover:bg-[#ff6b00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
                  <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <div className="relative my-8 flex items-center justify-center">
                <div className="h-px w-full bg-[#704322]/10" />
                <span className="absolute bg-white px-4 text-sm font-bold text-[#704322]/40">Hoặc đăng ký bằng</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-black/5 font-black text-[#23140c] transition-colors hover:bg-black/5">
                  <GoogleLogo size={24} weight="bold" /> Google
                </button>
                <button className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-black/5 font-black text-[#23140c] transition-colors hover:bg-black/5">
                  <GithubLogo size={24} weight="bold" /> Github
                </button>
              </div>

              <p className="mt-8 text-center font-bold text-[#704322]/70">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-[#ff6b00] hover:underline">Đăng nhập tại đây</Link>
              </p>
            </motion.div>
          </div>

          {/* Right Side: Visual Bento */}
          <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-[#23140c] lg:block">
            <Image
              src="https://visitbadinh.com.vn/DataFiles/2023/11/Blog/20231123-110650-nEgGyqhy.webp"
              alt="Register Visual"
              fill
              className="object-cover opacity-80 transition-transform duration-[25s] hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#23140c] via-transparent to-transparent" />

            <div className="absolute bottom-10 left-10 right-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex -space-x-3 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="size-12 rounded-full border-4 border-[#23140c] bg-orange-200 overflow-hidden">
                      <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="user" width={100} height={100} />
                    </div>
                  ))}
                  <div className="grid size-12 place-items-center rounded-full border-4 border-[#23140c] bg-[#ff6b00] text-xs font-black text-white">
                    +2k
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white">Tham gia cùng cộng đồng HungerDash</h3>
                <p className="mt-2 text-sm font-medium text-white/60">Hơn 50,000 người đã tin dùng và đặt món mỗi ngày.</p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
