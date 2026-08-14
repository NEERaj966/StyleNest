import React, { useEffect, useMemo, useState } from 'react'
import { OrderDataContext } from './OrderDataContext.js'

const CART_STORAGE_KEY = 'canteenCartItems'

const OrderContext = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (err) {
      console.log(err)
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item) => {
    if (!item) return
    const itemId = item._id ?? item.id
    if (!itemId) return

    setCartItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === itemId)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [
        ...prev,
        {
          id: itemId,
          name: item.name,
          price: Number(item.price) || 0,
          imageUrl: item.imageUrl || '',
          category: item.category || 'Other',
          quantity: 1,
        },
      ]
    })
  }

  const updateQuantity = (id, quantity) => {
    const qty = Number(quantity)
    if (!id || Number.isNaN(qty)) return

    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
      return
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)),
    )
  }

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems],
  )

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  )

  return (
    <OrderDataContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </OrderDataContext.Provider>
  )
}

export default OrderContext
