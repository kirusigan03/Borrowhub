import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext(null)

const CART_KEY = "borrowhub_cart"

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart())

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(equipmentId) {
    setItems((prev) => {
      const existing = prev.find((i) => i.equipmentId === equipmentId)
      if (existing) {
        return prev.map((i) =>
          i.equipmentId === equipmentId ? { ...i, days: i.days + 1 } : i
        )
      }
      return [...prev, { equipmentId, days: 1 }]
    })
  }

  function removeFromCart(equipmentId) {
    setItems((prev) => prev.filter((i) => i.equipmentId !== equipmentId))
  }

  function updateDays(equipmentId, days) {
    const safeDays = Math.max(1, Number(days) || 1)
    setItems((prev) =>
      prev.map((i) => (i.equipmentId === equipmentId ? { ...i, days: safeDays } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  const cartCount = items.length

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateDays, clearCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
