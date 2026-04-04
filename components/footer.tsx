import { Mail, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4 text-center space-y-3">
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          yoyodeats@gmail.com
        </p>
        <p className="text-muted-foreground flex items-center justify-center gap-1">
          © 2026 Yo-Yo&apos;s Delicious Eats • Made with <Heart className="h-4 w-4 text-secondary fill-secondary" />
        </p>
      </div>
    </footer>
  )
}
