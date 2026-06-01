"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("hunger-dash-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("hunger-dash-cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
