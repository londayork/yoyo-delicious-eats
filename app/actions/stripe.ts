'use server'

import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'

interface CartItem {
  productId: string
  quantity: number
}

export async function startCheckoutSession(cartItems: CartItem[]) {
  // Build line items from cart
  const lineItems = cartItems.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error(`Product with id "${item.productId}" not found`)
    }

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.priceInCents,
      },
      quantity: item.quantity,
    }
  })

  if (lineItems.length === 0) {
    throw new Error('Cart is empty')
  }

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: lineItems,
    mode: 'payment',
  })

  return session.client_secret
}
