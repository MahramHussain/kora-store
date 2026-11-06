"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
  sellerNote?: string;
  maxStock?: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => { success: boolean; message?: string };
  removeFromCart: (id: string | number, size: string, image: string, customName?: string, customNumber?: string, playerName?: string, patch?: string, sellerNote?: string) => void;
  updateQuantity: (id: string | number, size: string, image: string, customName: string | undefined, customNumber: string | undefined, newQuantity: number, playerName?: string, patch?: string, sellerNote?: string) => void;
  clearCart: () => void;
  syncCartStock: () => Promise<void>;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { isSignedIn, isLoaded } = useAuth();

  // 1. Load the cart from local storage when the user boots the store
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("kora_vault_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart data:", error);
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
                  (i.patch || "") === (localItem.patch || "") &&
                  (i.sellerNote || "") === (localItem.sellerNote || "")
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

  // Synchronize cart with live inventory stock and clamp any quantities exceeding actual stock
  const syncCartStock = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch("/api/cart/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ id: i.id, size: i.size, playerName: i.playerName })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const stocks: Record<string, number> = data.stocks || {};

        setCart((prevCart) => {
          let hasChanged = false;
          const nextCart = prevCart.map((item) => {
            const key = `${item.id}___${item.size || ""}___${item.playerName || ""}`;
            const liveStock = stocks[key] !== undefined ? stocks[key] : (item.maxStock ?? 999);
            const clampedQty = liveStock > 0 ? Math.min(item.quantity, liveStock) : item.quantity;

            if (item.maxStock !== liveStock || item.quantity !== clampedQty) {
              hasChanged = true;
              return {
                ...item,
                quantity: clampedQty,
                maxStock: liveStock,
              };
            }
            return item;
          });
          return hasChanged ? nextCart : prevCart;
        });
      }
    } catch (err) {
      console.error("Failed to sync cart stock:", err);
    }
  }, [cart]);

  // Run stock validation on initial boot whenever cart items exist
  useEffect(() => {
    if (isInitialized && cart.length > 0) {
      syncCartStock();
    }
  }, [isInitialized]);

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
    let result = { success: true };
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => 
          item.id === newItem.id && 
          item.size === newItem.size && 
          item.image === newItem.image &&
          (item.customName || "") === (newItem.customName || "") &&
          (item.customNumber || "") === (newItem.customNumber || "") &&
          (item.playerName || "") === (newItem.playerName || "") &&
          (item.patch || "") === (newItem.patch || "") &&
          (item.sellerNote || "") === (newItem.sellerNote || "")
      );

      const maxLimit = newItem.maxStock ?? existingItem?.maxStock ?? 999;

      if (existingItem) {
        const potentialQty = existingItem.quantity + newItem.quantity;
        const clampedQty = Math.min(potentialQty, maxLimit);

        return prevCart.map((item) =>
          item.id === newItem.id && 
          item.size === newItem.size && 
          item.image === newItem.image &&
          (item.customName || "") === (newItem.customName || "") &&
          (item.customNumber || "") === (newItem.customNumber || "") &&
          (item.playerName || "") === (newItem.playerName || "") &&
          (item.patch || "") === (newItem.patch || "") &&
          (item.sellerNote || "") === (newItem.sellerNote || "")
            ? { ...item, quantity: clampedQty, maxStock: maxLimit }
            : item
        );
      }

      const clampedQty = Math.min(newItem.quantity, maxLimit);
      return [...prevCart, { ...newItem, quantity: clampedQty, maxStock: maxLimit }];
    });
    return result;
  };

  const removeFromCart = (id: string | number, size: string, image: string, customName?: string, customNumber?: string, playerName?: string, patch?: string, sellerNote?: string) => {
    setCart((prevCart) => prevCart.filter((item) => 
      !(item.id === id && 
        item.size === size && 
        item.image === image && 
        (item.customName || "") === (customName || "") &&
        (item.customNumber || "") === (customNumber || "") &&
        (item.playerName || "") === (playerName || "") &&
        (item.patch || "") === (patch || "") &&
        (item.sellerNote || "") === (sellerNote || "")
      )
    ));
  };

  // The inventory-bounded quantity engine
  const updateQuantity = (
    id: string | number, 
    size: string, 
    image: string, 
    customName: string | undefined, 
    customNumber: string | undefined, 
    newQuantity: number, 
    playerName?: string, 
    patch?: string, 
    sellerNote?: string
  ) => {
    if (newQuantity <= 0) {
      // If they drop the quantity to 0, just remove it entirely
      removeFromCart(id, size, image, customName, customNumber, playerName, patch, sellerNote);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const isMatch =
          item.id === id && 
          item.size === size && 
          item.image === image &&
          (item.customName || "") === (customName || "") &&
          (item.customNumber || "") === (customNumber || "") &&
          (item.playerName || "") === (playerName || "") &&
          (item.patch || "") === (patch || "") &&
          (item.sellerNote || "") === (sellerNote || "");

        if (!isMatch) return item;

        const maxAllowed = item.maxStock !== undefined ? item.maxStock : 999;
        const clampedQuantity = Math.min(newQuantity, maxAllowed);
        return { ...item, quantity: clampedQuantity };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("kora_vault_cart");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, syncCartStock, cartCount }}>
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
