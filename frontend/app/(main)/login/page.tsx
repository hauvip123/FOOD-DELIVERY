"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ApiError, getPostLoginRedirectPath } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { EnvelopeSimple, LockSimple, ArrowRight } from "@phosphor-icons/react";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services";

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google script failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));
    document.head.appendChild(script);
  });
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let isMounted = true;

    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted || !window.google || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) {
              setError("Không nhận được thông tin đăng nhập từ Google.");
              return;
            }

            setError("");
            setIsGoogleSubmitting(true);
            try {
              const session = await loginWithGoogle(response.credential);
              router.push(getPostLoginRedirectPath(session.user.role));
              router.refresh();
            } catch (caughtError) {
              const message =
                caughtError instanceof ApiError
                  ? caughtError.message
                  : "Không thể đăng nhập bằng Google lúc này.";
              setError(
                message === "Google login is not configured"
                  ? "Chưa cấu hình Google Client ID ở backend."
                  : message,
              );
            } finally {
              setIsGoogleSubmitting(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "circle",
        });
      })
      .catch(() => {
        if (isMounted) {
          setError("Không tải được Google Login. Vui lòng thử lại sau.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [googleClientId, loginWithGoogle, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password });
      router.push(getPostLoginRedirectPath(session.user.role));
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError
          ? caughtError.message
          : "Không thể đăng nhập lúc này.";
      setError(
        message === "Invalid email or password"
          ? "Email hoặc mật khẩu không đúng."
          : message,
      );
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
                <span className="text-xl font-black tracking-tighter text-[#23140c]">
                  HungerDash
                </span>
              </Link>

              <h1 className="text-4xl font-black tracking-tight text-[#23140c] sm:text-5xl">
                Chào bạn trở lại!
              </h1>
              <p className="mt-4 text-lg font-medium text-[#704322]/70">
                Món ngon đang chờ bạn khám phá. Đăng nhập ngay nhé!
              </p>

              <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="login-email"
                    className="text-sm font-black uppercase tracking-widest text-[#23140c]/40 px-1"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <EnvelopeSimple
                      size={24}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40 transition-colors group-focus-within:text-[#ff6b00]"
                    />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="example@mail.com"
                      autoComplete="email"
                      disabled={isSubmitting || isGoogleSubmitting}
                      className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-black uppercase tracking-widest text-[#23140c]/40"
                    >
                      Mật khẩu
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-bold text-[#ff6b00] hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative group">
                    <LockSimple
                      size={24}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-[#704322]/40 transition-colors group-focus-within:text-[#ff6b00]"
                    />
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isSubmitting || isGoogleSubmitting}
                      className="h-16 w-full rounded-2xl bg-[#fff7ed] pl-14 pr-6 text-lg font-bold text-[#23140c] outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#ff6b00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {error && (
                  <p
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#23140c] text-lg font-black text-white shadow-xl transition-all hover:bg-[#ff6b00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  <ArrowRight
                    size={22}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </form>

              <div className="relative my-10 flex items-center justify-center">
                <div className="h-px w-full bg-[#704322]/10" />
                <span className="absolute bg-white px-4 text-sm font-bold text-[#704322]/40">
                  Hoặc đăng nhập nhanh
                </span>
              </div>

              <div className="rounded-[1.75rem] border border-[#23140c]/10 bg-[#fffaf5] p-3 shadow-[0_18px_45px_-28px_rgba(35,20,12,0.35)]">
                <div className="relative flex min-h-20 items-center justify-center overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-[#23140c]/5">
                  <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-[#ff6b00]/25 to-transparent" />
                  {googleClientId ? (
                    <>
                      <div
                        ref={googleButtonRef}
                        className={
                          isGoogleSubmitting
                            ? "pointer-events-none opacity-45 transition-opacity"
                            : "transition-opacity"
                        }
                      />
                      {isGoogleSubmitting && (
                        <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
                          <span className="rounded-full border border-[#ff6b00]/15 bg-[#fff7ed] px-4 py-2 text-sm font-black text-[#704322] shadow-sm">
                            Đang kết nối Google...
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-5 text-center">
                      <p className="text-sm font-black text-[#23140c]">
                        Chưa cấu hình Google Client ID
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#704322]/60">
                        Thêm NEXT_PUBLIC_GOOGLE_CLIENT_ID để bật nút đăng nhập.
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-xs font-bold leading-relaxed text-[#704322]/55">
                  Dùng tài khoản Google để vào HungerDash mà không cần nhập mật
                  khẩu.
                </p>
              </div>

              <p className="mt-10 text-center font-bold text-[#704322]/70">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="text-[#ff6b00] hover:underline"
                >
                  Đăng ký miễn phí
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Right Side: Visual Bento */}
          <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-[#ff6b00] lg:block">
            <Image
              src="https://cdn.tgdd.vn/2020/09/CookProduct/30-1200x676-1.jpg"
              alt="Login Visual"
              fill
              className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-125"
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/40 via-transparent to-[#ff6b00]/20" />

            <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="w-fit rounded-4xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl"
              >
                <p className="text-xl font-black text-white">
                  &quot;Giao hàng cực nhanh, đồ ăn vẫn còn nóng hổi khi tới
                  tay.&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Image
                    src="https://owa.bestprice.vn/images/media/5o4a9277a-693a3d407fff7.jpg"
                    alt="Login Visual"
                    width={40}
                    height={40}
                    className="rounded-full object-cover transition-transform duration-[20s] hover:scale-125"
                  />
                  <div>
                    <p className="text-sm font-black text-white">Thanh Xuân</p>
                    <p className="text-xs font-bold text-white/60">
                      Người dùng tại Q1, HCM
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="self-end w-fit rounded-4xl bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-[#ff6b00]">
                    <ArrowRight size={24} weight="bold" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#23140c]">
                      Hơn 12k quán ngon
                    </p>
                    <p className="text-sm font-bold text-[#704322]/60">
                      Đang phục vụ ngay bây giờ
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
