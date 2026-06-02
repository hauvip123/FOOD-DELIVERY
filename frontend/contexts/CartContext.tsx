"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { BackendCartResponse, getMyCart, replaceMyCart } from "@/lib/cart";
import { useAuth } from "@/contexts/AuthContext";

export type CartItem = {
  id: number;
  cartItemId?: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  flushCartSync: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isSyncing: boolean;
  errorMessage: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "hunger-dash-cart";
const CART_SYNC_DELAY = 300;

function mapBackendCart(response: BackendCartResponse, currentItems: CartItem[] = []): CartItem[] {
  return response.cartItem.map((item) => {
    const currentItem = currentItems.find((cartItem) => cartItem.id === item.dishId);

    return {
      id: item.dishId,
      cartItemId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      restaurantId: response.cart?.restaurantId ?? currentItem?.restaurantId ?? 0,
      restaurantName: currentItem?.restaurantName ?? (response.cart ? `Nhà hàng #${response.cart.restaurantId}` : "Nhà hàng"),
      image: currentItem?.image,
    };
  });
}

function addItemOptimistically(items: CartItem[], newItem: Omit<CartItem, "quantity">) {
  const existingItem = items.find((item) => item.id === newItem.id);
  if (existingItem) {
    return items.map((item) =>
      item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item,
    );
  }
  return [...items, { ...newItem, quantity: 1 }];
}

function removeItemOptimistically(items: CartItem[], itemId: number) {
  const existingItem = items.find((item) => item.id === itemId);
  if (!existingItem) {
    return items;
  }

  if (existingItem.quantity > 1) {
    return items.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item,
    );
  }

  return items.filter((item) => item.id !== itemId);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const itemsRef = useRef<CartItem[]>([]);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncVersionRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const applyBackendCart = useCallback((response: BackendCartResponse) => {
    setItems((currentItems) => mapBackendCart(response, currentItems));
  }, []);

  const syncCartNow = useCallback(async (version: number, snapshot: CartItem[]) => {
    if (!isAuthenticated) {
      return;
    }

    setIsSyncing(true);
    try {
      const response = await replaceMyCart({
        items: snapshot.map((item) => ({
          dishId: item.id,
          restaurantId: item.restaurantId,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
      });

      if (version === syncVersionRef.current) {
        applyBackendCart(response);
      }
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể đồng bộ giỏ hàng.");
      try {
        const response = await getMyCart();
        applyBackendCart(response);
      } catch {
        // Keep the instant local UI if server recovery also fails.
      }
    } finally {
      if (version === syncVersionRef.current) {
        setIsSyncing(false);
      }
    }
  }, [applyBackendCart, isAuthenticated]);

  const scheduleCartSync = useCallback((nextItems: CartItem[]) => {
    if (!isAuthenticated) {
      return;
    }

    syncVersionRef.current += 1;
    const version = syncVersionRef.current;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      syncCartNow(version, nextItems);
    }, CART_SYNC_DELAY);
  }, [isAuthenticated, syncCartNow]);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart", error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    let isCurrentRequest = true;

    async function loadCart() {
      setIsSyncing(true);
      setErrorMessage("");
      try {
        const response = await getMyCart();
        if (isCurrentRequest) {
          applyBackendCart(response);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải giỏ hàng.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsSyncing(false);
        }
      }
    }

    loadCart();

    return () => {
      isCurrentRequest = false;
    };
  }, [applyBackendCart, isAuthLoading, isAuthenticated]);

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuthenticated, isLoaded]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const addToCart = useCallback(async (newItem: Omit<CartItem, "quantity">) => {
    setErrorMessage("");

    const currentItems = itemsRef.current;
    const currentRestaurantId = currentItems[0]?.restaurantId;
    if (currentRestaurantId && currentRestaurantId !== newItem.restaurantId) {
      setErrorMessage("Giỏ hàng chỉ hỗ trợ món từ một nhà hàng. Hãy xóa giỏ hiện tại trước khi chọn nhà hàng khác.");
      return;
    }

    const nextItems = addItemOptimistically(currentItems, newItem);
    itemsRef.current = nextItems;
    setItems(nextItems);
    scheduleCartSync(nextItems);
  }, [scheduleCartSync]);

  const removeFromCart = useCallback(async (itemId: number) => {
    setErrorMessage("");

    const nextItems = removeItemOptimistically(itemsRef.current, itemId);
    itemsRef.current = nextItems;
    setItems(nextItems);
    scheduleCartSync(nextItems);
  }, [scheduleCartSync]);

  const clearCart = useCallback(async () => {
    setErrorMessage("");
    itemsRef.current = [];
    setItems([]);
    scheduleCartSync([]);
  }, [scheduleCartSync]);

  const flushCartSync = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    syncVersionRef.current += 1;
    await syncCartNow(syncVersionRef.current, itemsRef.current);
  }, [isAuthenticated, syncCartNow]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo<CartContextType>(() => ({
    items,
    addToCart,
    removeFromCart,
    clearCart,
    flushCartSync,
    totalItems,
    totalPrice,
    isSyncing,
    errorMessage,
  }), [addToCart, clearCart, errorMessage, flushCartSync, isSyncing, items, removeFromCart, totalItems, totalPrice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
