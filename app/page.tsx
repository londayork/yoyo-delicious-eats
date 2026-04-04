"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { Cart } from "@/components/cart"
import { AdminPanel } from "@/components/admin-panel"
import { Footer } from "@/components/footer"
import { CheckoutModal } from "@/components/checkout-modal"
import { PRODUCTS, type Product } from "@/lib/products"

interface CartItem {
  productId: string
  quantity: number
}

export default function YoYosStore() {
  const [customProducts, setCustomProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  // Combine default products with custom added ones
  const allProducts = useMemo(() => [...PRODUCTS, ...customProducts], [customProducts])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { productId: product.id, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.productId === productId)
      if (item && item.quantity > 1) {
        return prevCart.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      }
      return prevCart.filter((item) => item.productId !== productId)
    })
  }

  const getCartItems = () => {
    return cart.map((item) => {
      const product = allProducts.find((p) => p.id === item.productId)
      return {
        ...item,
        product,
      }
    }).filter((item) => item.product !== undefined)
  }

  const getTotal = () => {
    return getCartItems()
      .reduce((sum, item) => sum + (item.product!.priceInCents / 100) * item.quantity, 0)
      .toFixed(2)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowCheckout(true)
    }
  }

  const addProduct = (newProduct: Omit<Product, "id">) => {
    const newItem: Product = {
      id: `custom-${Date.now()}`,
      ...newProduct,
    }
    setCustomProducts([...customProducts, newItem])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={getTotalItems()} 
        showAdmin={showAdmin} 
        onToggleAdmin={() => setShowAdmin(!showAdmin)} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <Hero />
        
        <ProductGrid products={allProducts} onAddToCart={addToCart} />
        
        <Cart 
          items={getCartItems()} 
          total={getTotal()} 
          onRemove={removeFromCart}
          onCheckout={handleCheckout} 
        />
        
        {showAdmin && <AdminPanel onAddProduct={addProduct} />}
      </main>
      
      <Footer />

      {showCheckout && (
        <CheckoutModal 
          cartItems={cart} 
          onClose={() => setShowCheckout(false)} 
        />
      )}
    </div>
  )
}
