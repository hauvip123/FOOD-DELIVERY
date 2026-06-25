"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, CreditCard, XCircle } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { verifyVnpayReturn, VnpayReturnResponse } from "@/lib/order";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function VnpayReturnContent() {
  const searchParams = useSearchParams();
  const queryString = useMemo(() => searchParams.toString(), [searchParams]);
  const [result, setResult] = useState<VnpayReturnResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrentRequest = true;

    async function verifyPayment() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await verifyVnpayReturn(queryString);
        if (isCurrentRequest) {
          setResult(data);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Không thể xác minh thanh toán VNPay.",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    if (queryString) {
      verifyPayment();
    } else {
      setErrorMessage("Thiếu dữ liệu trả về từ VNPay.");
      setIsLoading(false);
    }

    return () => {
      isCurrentRequest = false;
    };
  }, [queryString]);

  const isSuccess = Boolean(result?.isSuccess);
  const order = result?.order;
  const toneClass = isLoading
    ? "bg-orange-50 text-[#ff6b00]"
    : isSuccess
      ? "bg-emerald-50 text-emerald-600"
      : "bg-red-50 text-red-600";

  return (
    <div className="flex min-h-[80dvh] items-center justify-center bg-[#fffcf8] px-4 py-24 text-center">
      <div className="w-full max-w-lg rounded-4xl bg-white p-8 shadow-[0_20px_50px_-25px_rgba(35,20,12,0.35)] ring-1 ring-black/5">
        <div
          className={
            "mx-auto mb-6 grid size-20 place-items-center rounded-3xl " +
            toneClass
          }
        >
          {isLoading ? (
            <CreditCard size={42} weight="bold" />
          ) : isSuccess ? (
            <CheckCircle size={44} weight="fill" />
          ) : (
            <XCircle size={44} weight="fill" />
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#23140c]">
          {isLoading
            ? "Đang xác minh VNPay"
            : isSuccess
              ? "Thanh toán thành công"
              : "Thanh toán chưa thành công"}
        </h1>
        <p className="mt-3 text-sm font-bold leading-relaxed text-[#704322]/60">
          {isLoading
            ? "Hệ thống đang kiểm tra chữ ký và kết quả giao dịch."
            : isSuccess
              ? "Đơn hàng của bạn đã được ghi nhận đã thanh toán."
              : errorMessage || "VNPay trả về giao dịch không thành công."}
        </p>

        {order && (
          <div className="mt-7 rounded-3xl bg-[#fffcf8] p-5 text-left ring-1 ring-[#23140c]/5">
            <div className="flex justify-between gap-4 text-sm font-bold text-[#704322]/65">
              <span>Đơn hàng</span>
              <span className="text-[#23140c]">#{order.id}</span>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-sm font-bold text-[#704322]/65">
              <span>Số tiền</span>
              <span className="text-[#ff6b00]">
                {formatMoney(order.totalAmount)}
              </span>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-sm font-bold text-[#704322]/65">
              <span>Trạng thái</span>
              <span className="text-[#23140c]">
                {order.paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#23140c] px-6 text-sm font-black text-white transition-all hover:bg-[#ff6b00] active:scale-95"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/restaurants"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-50 px-6 text-sm font-black text-[#ff6b00] transition-all hover:bg-orange-100 active:scale-95"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-[80dvh] bg-[#fffcf8]" />}>
      <VnpayReturnContent />
    </Suspense>
  );
}
