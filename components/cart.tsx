"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2, CreditCard } from "lucide-react"
import type { Product } from "@/lib/products"

interface CartItemWithProduct {
  productId: string
  quantity: number
  product: Product | undefined
}

interface CartProps {
  items: CartItemWithProduct[]
  total: string
  onRemove: (productId: string) => void
  onCheckout: () => void
}

export function Cart({ items, total, onRemove, onCheckout }: CartProps) {
  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShoppingBag className="h-6 w-6" />
          Your Cart
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Your cart is empty. Start shopping!</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={item.productId} 
                className="flex justify-between items-center py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-card-foreground">
                    {item.product?.name}
                    {item.quantity > 1 && (
                      <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                    )}
                  </p>
                  <p className="text-primary font-semibold">
                    ${((item.product?.priceInCents || 0) / 100 * item.quantity).toFixed(2)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onRemove(item.productId)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-card-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">${total}</span>
              </div>
              <Button onClick={onCheckout} className="w-full" size="lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Checkout with Stripe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
