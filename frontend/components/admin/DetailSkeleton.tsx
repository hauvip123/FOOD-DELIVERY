"use client";

export default function DetailSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      <div className="h-12 w-44 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="h-[32rem] animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
        <div className="h-[32rem] animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" />
      </div>
    </div>
  );
}
