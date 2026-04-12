"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Scissors } from "lucide-react"
import { useAuth, UserButton } from "@clerk/nextjs"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Početna", href: "/" },
  { name: "O nama", href: "/#o-nama" },
  { name: "Slike", href: "/#galerija" },
  { name: "Usluge", href: "/#usluge" },
  { name: "Iskustva", href: "/#iskustva" },
  { name: "Kontakt", href: "/#kontakt" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useAuth()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <Scissors className="h-5 w-5" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">TestFriz</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted ${
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isLoaded && (
            <div className="hidden sm:block">
              {!isSignedIn ? (
                <Link href="/sign-in">
                  <Button variant="outline" className="border-border rounded-full">
                    Prijava
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button className="rounded-full shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all">
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
                </div>
              )}
            </div>
          )}

          <div className="hidden sm:block">
            <Link href="/zakazivanje">
              <Button className="rounded-full shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
                Zakaži termin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="sm:hidden shrink-0 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-l-border/30 w-[80vw] sm:max-w-sm">
              <div className="flex flex-col h-full gap-6 mt-8">
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-4 py-3 text-lg font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-3 pb-6">
                  <Link href="/zakazivanje">
                    <Button size="lg" className="w-full rounded-full bg-foreground text-background dark:bg-primary dark:text-primary-foreground">
                      Zakaži termin
                    </Button>
                  </Link>
                  {isLoaded && !isSignedIn && (
                    <Link href="/sign-in">
                      <Button variant="outline" size="lg" className="w-full rounded-full">
                        Prijava za radnike
                      </Button>
                    </Link>
                  )}
                  {isLoaded && isSignedIn && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-muted">
                      <Link href="/dashboard">
                        <Button variant="ghost" className="rounded-full">
                          Dashboard
                        </Button>
                      </Link>
                      <UserButton />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
