import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from '../utils/toastBus'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items))
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        const newQty = next[idx].qty + qty
        const maxStock = product.stock ?? next[idx].stock
        
        // Validar stock disponible
        if (maxStock !== undefined && newQty > maxStock) {
          toast.error(`Stock máximo disponible: ${maxStock}`)
          next[idx] = { ...next[idx], qty: maxStock, stock: maxStock }
        } else {
          next[idx] = { ...next[idx], qty: newQty }
        }
        return next
      }
      
      // Validar stock al agregar nuevo item
      const stockToAdd = product.stock !== undefined && qty > product.stock ? product.stock : qty
      if (product.stock !== undefined && qty > product.stock) {
        toast.error(`Stock máximo disponible: ${product.stock}`)
      }
      
      return [
        ...prev,
        {
          id: product.id,
          name: product.nombre || product.name,
          price: Number(product.precio ?? product.price ?? 0),
          image: product.imagen || product.image || 'https://placehold.co/600x600?text=Producto',
          stock: product.stock,
          qty: stockToAdd,
        },
      ]
    })
  }

  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id))
  
  const updateQty = (id, qty) => {
    setItems((prev) => prev.map((x) => {
      if (x.id === id) {
        const maxStock = x.stock
        if (maxStock !== undefined && qty > maxStock) {
          toast.error(`Stock máximo disponible: ${maxStock}`)
          return { ...x, qty: maxStock }
        }
        return { ...x, qty }
      }
      return x
    }))
  }
  
  const clear = () => setItems([])

  const { count, subtotal } = useMemo(() => {
    const count = items.reduce((s, x) => s + x.qty, 0)
    const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0)
    return { count, subtotal }
  }, [items])

  const value = { items, addItem, removeItem, updateQty, clear, count, subtotal }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
