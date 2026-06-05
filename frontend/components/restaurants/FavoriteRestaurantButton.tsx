"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { addFavoriteRestaurant, removeFavoriteRestaurant } from "@/lib/restaurant";

type FavoriteRestaurantButtonProps = {
  restaurantId: number;
  initialIsFavorite?: boolean;
  size?: "md" | "lg";
  variant?: "dark" | "light" | "card";
  onChange?: (restaurantId: number, isFavorite: boolean) => void;
};

const variantClasses = {
  dark: "bg-white/10 text-white ring-white/10 hover:bg-white/20",
  light: "bg-white/95 text-[#23140c] ring-black/5 hover:bg-red-50 hover:text-red-500",
  card: "bg-orange-50 text-[#ff6b00] ring-orange-100 hover:bg-red-50 hover:text-red-500",
};

export function FavoriteRestaurantButton({
  restaurantId,
  initialIsFavorite = false,
  size = "md",
  variant = "light",
  onChange,
}: FavoriteRestaurantButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isFavorite = initialIsFavorite;
  const [isBusy, setIsBusy] = useState(false);

  async function handleToggle() {
    if (isLoading || isBusy) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const nextValue = !isFavorite;
    setIsBusy(true);
    onChange?.(restaurantId, nextValue);

    try {
      if (nextValue) {
        await addFavoriteRestaurant(restaurantId);
      } else {
        await removeFavoriteRestaurant(restaurantId);
      }
    } catch {
      onChange?.(restaurantId, !nextValue);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isBusy || isLoading}
      aria-label={isFavorite ? "Bỏ yêu thích nhà hàng" : "Thêm nhà hàng yêu thích"}
      title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
      className={`grid place-items-center rounded-[1rem] ring-1 transition-all disabled:pointer-events-none disabled:opacity-60 active:scale-90 ${size === "lg" ? "size-14 rounded-2xl" : "size-12"} ${isFavorite ? "bg-red-500 text-white ring-red-500 hover:bg-red-600" : variantClasses[variant]}`}
    >
      <Heart size={size === "lg" ? 28 : 24} weight={isFavorite ? "fill" : "bold"} />
    </button>
  );
}
