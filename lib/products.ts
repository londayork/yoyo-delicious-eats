export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  image: string
}

// This is the source of truth for all products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: 'chocolate-chip-cookies',
    name: 'Chocolate Chip Cookies',
    description: 'Fresh homemade chocolate chip cookies, golden brown and delicious',
    priceInCents: 1299, // $12.99
    image: '/images/chocolate-chip-cookies.jpg',
  },
  {
    id: 'strawberry-cupcakes',
    name: 'Strawberry Cupcakes',
    description: 'Beautiful strawberry cupcakes with pink frosting and fresh strawberry topping',
    priceInCents: 1599, // $15.99
    image: '/images/strawberry-cupcakes.jpg',
  },
  {
    id: 'sea-moss-gel',
    name: 'Sea Moss Gel',
    description: 'Organic sea moss gel packed with nutrients for your health and wellness',
    priceInCents: 2500, // $25.00
    image: '/images/sea-moss-gel.jpg',
  },
]
