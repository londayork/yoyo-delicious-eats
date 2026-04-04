"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Settings, Cookie } from "lucide-react"

interface HeaderProps {
  cartCount: number
  showAdmin: boolean
  onToggleAdmin: () => void
}

export function Header({ cartCount, showAdmin, onToggleAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Yo-Yo&apos;s Delicious Eats
          </h1>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={onToggleAdmin} 
            variant={showAdmin ? "default" : "outline"}
            size="sm"
            className="hidden sm:flex"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
          <Button 
            onClick={onToggleAdmin} 
            variant={showAdmin ? "default" : "outline"}
            size="icon"
            className="sm:hidden"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="secondary" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">({cartCount})</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
