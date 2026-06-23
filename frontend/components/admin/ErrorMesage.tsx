import { ReactNode } from "react";
import { WarningCircle } from "@phosphor-icons/react";

interface ErrorMessageProps {
  errorMessage: string;
  title?: string;
  action?: ReactNode;
}

function ErrorMessage({ errorMessage, title = "Đã xảy ra lỗi", action }: ErrorMessageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="grid size-20 place-items-center rounded-3xl bg-red-50 text-red-500">
        <WarningCircle size={40} weight="bold" />
      </div>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-stone-900">{title}</h2>
      <p className="mt-2 text-slate-500 font-bold">{errorMessage}</p>
      {action ? (
        action
      ) : (
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 rounded-2xl bg-stone-900 px-8 py-3 text-sm font-black text-white transition-transform active:scale-95"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;