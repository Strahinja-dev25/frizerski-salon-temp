import Link from "next/link"
import { Scissors, MapPin, MapPinned, Phone, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted py-12 md:py-16 mt-auto border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Info */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <Scissors className="h-5 w-5" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">TestFriz</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              Vrhunski frizerski salon gde tradicija sreće moderan stil. Naš cilj je da svaki klijent izađe sa osmehom na licu i savršenom frizurom.
            </p>
            <div className="flex gap-4 mt-2">
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs font-bold">
                IG
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs font-bold">
                FB
              </Link>
              <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <MapPinned className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 flex flex-col gap-4">
            <h3 className="font-heading font-semibold text-foreground text-lg">Brzi Linkovi</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/#o-nama" className="text-muted-foreground hover:text-primary transition-colors text-sm">O nama</Link>
              </li>
              <li>
                <Link href="/#usluge" className="text-muted-foreground hover:text-primary transition-colors text-sm">Naše Usluge</Link>
              </li>
              <li>
                <Link href="/#galerija" className="text-muted-foreground hover:text-primary transition-colors text-sm">Galerija</Link>
              </li>
              <li>
                <Link href="/status" className="text-muted-foreground hover:text-primary transition-colors text-sm">Proveri status termina</Link>
              </li>
              <li>
                <Link href="/zakazivanje" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Zakaži termin online</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
            <h3 className="font-heading font-semibold text-foreground text-lg">Kontakt & Odricanje</h3>
            <ul className="flex flex-col gap-3 font-medium">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="bg-background p-2 rounded-md border border-border">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                Ulica Testova 123, Beograd
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="bg-background p-2 rounded-md border border-border">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                060 123 4567
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="bg-background p-2 rounded-md border border-border">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                testfriz@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} TestFriz Salon. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
