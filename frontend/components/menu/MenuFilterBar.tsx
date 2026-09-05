"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";

type MenuFilterBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryNames: string[];
  activeCategoryName: string | "all";
  onCategoryChange: (value: string | "all") => void;
};

export function MenuFilterBar({
  searchQuery,
  onSearchChange,
  categoryNames,
  activeCategoryName,
  onCategoryChange,
}: MenuFilterBarProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    const maxScroll = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(maxScroll - node.scrollLeft > 8);
  }

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categoryNames]);

  function scrollByDirection(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    });
  }

  function chipClass(isActive: boolean) {
    return (
      "snap-start shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors " +
      (isActive
        ? "bg-[#ff6b00] text-white"
        : "bg-[#fff7ed] text-[#704322] hover:bg-orange-100")
    );
  }

  return (
    <div className="sticky top-24 z-20 mb-10 rounded-[1.75rem] bg-white p-3 ring-1 ring-[#23140c]/6 sm:p-4">
      <label className="flex h-12 items-center gap-3 rounded-full bg-[#fff7ed] px-4 text-[#a04100] ring-1 ring-[#23140c]/5 focus-within:bg-white focus-within:ring-[#ff6b00]/35">
        <MagnifyingGlass size={18} weight="bold" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm món hoặc nhà hàng"
          className="w-full bg-transparent text-sm font-semibold text-[#23140c] outline-none placeholder:text-[#a36b3f]/55"
        />
      </label>

      <div className="relative mt-3">
        {canScrollLeft ? (
          <button
            type="button"
            aria-label="Danh mục trước"
            onClick={() => scrollByDirection(-1)}
            className="absolute top-1/2 left-0 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#23140c] shadow-md ring-1 ring-[#23140c]/8"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
        ) : null}

        {canScrollRight ? (
          <button
            type="button"
            aria-label="Danh mục sau"
            onClick={() => scrollByDirection(1)}
            className="absolute top-1/2 right-0 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#23140c] shadow-md ring-1 ring-[#23140c]/8"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        ) : null}

        <div
          ref={scrollerRef}
          className={
            "no-scrollbar flex gap-2 overflow-x-auto scroll-smooth py-1 " +
            (canScrollLeft ? "pl-10 " : "pl-1 ") +
            (canScrollRight ? "pr-10" : "pr-1")
          }
        >
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={chipClass(activeCategoryName === "all")}
          >
            Tất cả
          </button>
          {categoryNames.map((categoryName) => (
            <button
              key={categoryName}
              type="button"
              onClick={() => onCategoryChange(categoryName)}
              className={chipClass(activeCategoryName === categoryName)}
            >
              {categoryName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
