import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Clock, MapPin, Star, Scissors, Quote, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"

import { getAllServices } from "@/services/appointment-service"
import { getAllWorkSchedules } from "@/services/settings-service"

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  // Fetch services and schedule concurrently
  const [services, schedules] = await Promise.all([
    getAllServices(),
    getAllWorkSchedules()
  ])

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24">

        {/* HERO SECTION */}
        <section className="relative px-4 py-20 overflow-hidden md:py-32 lg:py-48 flex items-center justify-center min-h-[80vh]">
          {/* Background effect */}
          <div className="absolute inset-0 bg-background/90 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-50 dark:opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] opacity-50 dark:opacity-20"></div>
          </div>

          <div className="container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/50 backdrop-blur-sm text-sm font-medium mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Zakažite termin odmah
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Vaš stil. <br />
              <span className="text-gradient-primary">Naša umetnost.</span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Vrhunski frizerski salon gde tradicija sreće moderan stil. Otkrijte mesto gde oživljava vaša najbolja verzija.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <Link href="/zakazivanje">
                <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all">
                  Zakaži termin <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#usluge">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 border-border bg-background/50 backdrop-blur-sm text-lg hover:bg-muted">
                  Naše usluge
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* O NAMA */}
        <section id="o-nama" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden glass border-border/50">
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  {/* Placeholder for about image */}
                  <Scissors className="h-24 w-24 text-muted-foreground/30" />
                  <span className="absolute bottom-4 text-xs font-mono text-muted-foreground">O nama - Slika</span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <h2 className="font-heading text-4xl md:text-5xl font-bold">O nama</h2>
                <div className="w-16 h-1.5 bg-primary rounded-full"></div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  TestFriz je nastao iz strasti prema perfektnom izgledu i besprekornoj nezi. Naš salon u Beogradu predstavlja oazu stila gde je svaki klijent u centru pažnje.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Naš tim se stalno usavršava prateći najnovije svetske trendove kako bi vam pružio premium uslugu. Zalažemo se za kvalitet, preciznost i opuštenu atmosferu.
                </p>
                <ul className="grid grid-cols-2 gap-4 mt-4">
                  {["Premium usluga", "Iskusni majstori", "Najbolji preparati", "Opuštena atmosfera"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 font-medium">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* GALERIJA */}
        <section id="galerija" className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Galerija</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-lg">
              Prelistajte radove naših majstora i pronadjite inspiraciju za vas sledeći stil.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square rounded-2xl overflow-hidden relative group bg-muted border border-border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-muted-foreground/50 text-sm font-mono">Slika {item}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold tracking-wider">IG</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USLUGE */}
        <section id="usluge" className="py-20 md:py-32 bg-background border-y border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16 relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Naše Usluge</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Sve što Vam je potrebno za savršen izgled, na jednom mestu uz potpuno transparentne cene.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
              {services.map((service) => (
                <Card key={service.id} className="glass group hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-heading font-bold text-2xl group-hover:text-primary transition-colors">{service.name}</h3>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-2xl text-foreground">{service.price}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">RSD</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-8 min-h-[3rem] line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        {service.durationMinutes} min
                      </div>
                      <Link href={`/zakazivanje?service=${service.id}`} className="hidden sm:inline-flex rounded-full px-4 font-medium text-sm items-center justify-center h-8 hover:bg-primary/20 hover:text-primary group-hover:bg-primary/10 transition-colors">
                        Zakaži
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {services.length === 0 && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Trenutno nema unetih usluga.
                </div>
              )}
            </div>

            <div className="mt-16 text-center">
              <Link href="/zakazivanje">
                <Button size="lg" className="rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 hover:scale-105 transition-transform">
                  Idi na zakazivanje
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ISKUSTVA (Recenzije) */}
        <section id="iskustva" className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Iskustva klijenata</h2>
              <div className="flex justify-center gap-1 mb-4 text-primary">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-6 h-6 fill-current" />)}
              </div>
              <p className="text-muted-foreground text-lg">Ocena 5.0 iz preko 200+ Google recenzija.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Marko D.", text: "Najbolji salon u gradu. Majstori su precizni i vidi se da vole ono što rade. Sve preporuke!" },
                { name: "Nikola S.", text: "Odlična usluga od prvog trenutka. Atmosfera je uvek vrhunska a šišanje savršeno bez izuzetka." },
                { name: "Stefan J.", text: "Jedino mesto gde me majstor stvarno razume. Fenomenalno uređen lokal i besprekorna čistoća." },
              ].map((rev, i) => (
                <Card key={i} className="glass">
                  <CardContent className="p-8">
                    <Quote className="w-10 h-10 text-primary/30 mb-6" />
                    <p className="text-foreground text-lg font-medium leading-relaxed mb-8">&quot;{rev.text}&quot;</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-bold font-heading text-muted-foreground border border-border">
                        {rev.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{rev.name}</p>
                        <div className="flex text-primary">
                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* KONTAKT & RADNO VREME */}
        <section id="kontakt" className="py-20 md:py-32 bg-muted/50 border-t border-border relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">

              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Pronadjite nas</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Spremni za transformaciju? Zakažite vaš termin online ili nas kontaktirajte putem društvenih mreža. Radujemo se vašem dolasku!
                  </p>
                </div>

                <div className="flex flex-col gap-6 bg-background rounded-3xl p-8 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-2xl flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Adresa</h4>
                      <p className="text-muted-foreground">Ulica Testova 123, 11000 Beograd, Srbija</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-2xl flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-4">Radno Vreme</h4>
                      <div className="flex flex-col gap-2 w-full max-w-sm">
                        {schedules.map((schedule) => (
                          <div key={schedule.dayOfWeek} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 gap-20">
                            <span className="font-medium text-muted-foreground">{schedule.dayName}</span>
                            <span className="font-bold">
                              {schedule.isOpen ? `${schedule.openingTime} - ${schedule.closingTime}` : <span className="text-destructive">Zatvoreno</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-full min-h-[400px] w-full rounded-3xl overflow-hidden border border-border bg-muted flex items-center justify-center relative">
                <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                  <MapPin className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-bold text-2xl mb-2">Pronađite nas na Mapi</h3>
                  <p className="text-muted-foreground mb-6">Ovde ide Google Maps interaktivna mapa lokala.</p>
                  <Button variant="outline" className="rounded-full">Otvori u Google Maps</Button>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
