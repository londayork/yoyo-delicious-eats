"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Shield } from "lucide-react"
import type { Product } from "@/lib/products"

interface AdminPanelProps {
  onAddProduct: (product: Omit<Product, "id">) => void
}

export function AdminPanel({ onAddProduct }: AdminPanelProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return
    
    onAddProduct({
      name,
      description: description || `Delicious ${name} from Yo-Yo's kitchen`,
      priceInCents: Math.round(parseFloat(price) * 100),
      image: image || "/images/chocolate-chip-cookies.jpg",
    })
    
    setName("")
    setDescription("")
    setPrice("")
    setImage("")
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" />
          Admin Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
