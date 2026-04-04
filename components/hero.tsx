import Image from "next/image"
import { Heart } from "lucide-react"

export function Hero() {
  return (
    <section className="py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="relative w-full md:w-1/2 aspect-[3/4] max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/images/yoyo-chef.jpg"
            alt="Yo-Yo, the chef and owner of Yo-Yo's Delicious Eats, cooking fresh shrimp in her kitchen"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 text-balance">
            Sweet Treats & Savory Eats
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl flex items-center justify-center md:justify-start gap-2 text-pretty mb-6">
            Made with love <Heart className="h-5 w-5 text-primary fill-primary" /> Fresh cookies, cupcakes, sea moss & more!
          </p>
          <p className="text-muted-foreground max-w-lg">
            Welcome to Yo-Yo&apos;s kitchen! Every dish is crafted with care using the freshest ingredients. From homemade sweets to healthy sea moss gel, taste the difference that passion makes.
          </p>
        </div>
      </div>
    </section>
  )
}
