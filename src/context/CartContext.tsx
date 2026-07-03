"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

export type CartItem = {
  id: string | number;
  name: string;
  price: string; 
  image: string;
  size: string;
  quantity: number;
  customName?: string;
  customNumber?: string;
  playerName?: string;
  patch?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number, size: string, image: string, customName?: string, customNumber?: string, playerName?: string, patch?: string) => void;
  updateQuantity: (id: string | number, size: string, image: string, customName: string | undefined, customNumber: string | undefined, newQuantity: number, playerName?: string, patch?: string) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isSignedIn, isLoaded } = useAuth();

  // 1. Load the vault from local storage when the user boots the store
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("kora_vault_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load vault data:", error);
    }
    setIsInitialized(true);
  }, []);

  // 1b. Fetch from DB if user logs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const fetchDbCart = async () => {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const dbCart: CartItem[] = await res.json();
            
            // Merge logic: Combine local items with DB items
            setCart((prevLocalCart) => {
              const mergedCart = [...dbCart];
              prevLocalCart.forEach(localItem => {
                const existing = mergedCart.find(i => 
                  i.id === localItem.id && 
                  i.size === localItem.size && 
                  i.image === localItem.image &&
                  (i.customName || "") === (localItem.customName || "") &&
                  (i.customNumber || "") === (localItem.customNumber || "") &&
                  (i.playerName || "") === (localItem.playerName || "") &&
                  (i.patch || "") === (localItem.patch || "")
                );
                if (!existing) {
                  mergedCart.push(localItem);
                }
              });
              return mergedCart;
            });
          }
        } catch (error) {
          console.error("Failed to sync DB cart", error);
        }
      };
      fetchDbCart();
    }
  }, [isLoaded, isSignedIn]);

  // 2. Automatically sync whatever they add/remove directly into their local storage AND database
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("kora_vault_cart", JSON.stringify(cart));
      
      if (isSignedIn) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart })
        }).catch(err => console.error("Failed to push cart to DB", err));
      }
    }
  }, [cart, isInitialized, isSignedIn]);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => 
          item.id === newItem.id && 
          item.size === newItem.size && 
          item.image === newItem.image &&
          (item.customName || "") === (newItem.customName || "") &&
          (item.customNumber || "") === (newItem.customNumber || "") &&
          (item.playerName || "") === (newItem.playerName || "") &&
          (item.patch || "") === (newItem.patch || "")
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === newItem.id && 
          item.size === newItem.size && 
          item.image === newItem.image &&
          (item.customName || "") === (newItem.customName || "") &&
          (item.customNumber || "") === (newItem.customNumber || "") &&
          (item.playerName || "") === (newItem.playerName || "") &&
          (item.patch || "") === (newItem.patch || "")
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: string | number, size: string, image: string, customName?: string, customNumber?: string, playerName?: string, patch?: string) => {
    setCart((prevCart) => prevCart.filter((item) => 
      !(item.id === id && 
        item.size === size && 
        item.image === image && 
        (item.customName || "") === (customName || "") &&
        (item.customNumber || "") === (customNumber || "") &&
        (item.playerName || "") === (playerName || "") &&
        (item.patch || "") === (patch || "")
      )
    ));
  };

  // THE NEW QUANTITY ENGINE
  const updateQuantity = (id: string | number, size: string, image: string, customName: string | undefined, customNumber: string | undefined, newQuantity: number, playerName?: string, patch?: string) => {
    if (newQuantity <= 0) {
      // If they drop the quantity to 0, just remove it entirely
      removeFromCart(id, size, image, customName, customNumber, playerName, patch);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && 
        item.size === size && 
        item.image === image &&
        (item.customName || "") === (customName || "") &&
        (item.customNumber || "") === (customNumber || "") &&
        (item.playerName || "") === (playerName || "") &&
        (item.patch || "") === (patch || "")
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("kora_vault_cart");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
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