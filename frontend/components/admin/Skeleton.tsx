"use client";

interface SkeletonProps {
  count?: number;
}

export default function Skeleton({ count = 5 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="h-32 animate-pulse rounded-[2.5rem] bg-white ring-1 ring-slate-100" 
        />
      ))}
    </>
  );
}
