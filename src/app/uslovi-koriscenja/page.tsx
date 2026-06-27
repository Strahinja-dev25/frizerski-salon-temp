import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

export const metadata: Metadata = {
  title: "Uslovi Korišćenja | [Ime Salona]",
  description: "Pročitajte uslove korišćenja frizerskog salona [Ime Salona] za online zakazivanje termina.",
};

export default function UsloviKoriscenjaPage() {
  const lastUpdated = new Date().toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Uslovi Korišćenja
            </h1>
            <p className="text-sm text-muted-foreground">
              Poslednje ažuriranje: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none flex flex-col gap-8">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Korišćenjem veb sajta/aplikacije frizerskog salona{" "}
              <strong>[Ime Salona]</strong> (u daljem tekstu: Salon), prihvatate
              ove Uslove korišćenja u potpunosti. Molimo vas da ih pažljivo
              pročitate.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                1. Zakazivanje i otkazivanje termina
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Aplikacija omogućava korisnicima pregled slobodnih termina i
                online zakazivanje usluga. Ukoliko ste sprečeni da dođete u
                zakazano vreme, molimo vas da termin otkažete ili pomerate kroz
                aplikaciju (ili pozivom) najmanje <strong>24 sata ranije</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Politika nepojavljivanja (No-show):</strong> Ukoliko se
                klijent ne pojavi na zakazani termin bez prethodnog otkazivanja,
                Salon zadržava pravo da ograniči mogućnost daljeg online
                zakazivanja. U slučaju učestalog nepojavljivanja, naredni termini
                možu biti uslovljeni plaćanjem avansa radi potvrđivanja rezervacije.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                2. Politika kašnjenja
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Cenimo vaše i naše vreme. Ukoliko klijent kasni više od 15
                minuta na zakazani termin, Salon zadržava pravo da skrati
                trajanje usluge ili otkaže termin, u zavisnosti od rasporeda
                narednih klijenata, kako ne bi došlo do pomeranja čitavog radnog
                dana.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                3. Cene usluga
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Sve cene navedene u aplikaciji su informativnog karaktera. Iako
                se trudimo da cenovnik u aplikaciji bude maksimalno ažuran,
                konačna cena usluge može varirati u zavisnosti od dužine kose,
                količine utrošenog materijala i specifičnih zahteva klijenta na
                samom licu mesta.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                4. Starosna granica
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Online zakazivanje je dozvoljeno svim korisnicima. Međutim, za
                hemijske tretmane (kao što su farbanje kose, trajni uvijaci i
                slične usluge), <strong>salon zadržava pravo da zahteva prisustvo
                roditelja ili zakonskog staratelja za maloletnike ispod 18
                godina</strong>. Maloletnima može biti odbijena usluga na licu
                mesta bez prisustva staratelja, bez obzira na izvršenu rezervaciju.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                5. Autorska prava
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Sav materijal, vizuelni identitet, fotografije frizura i dizajn
                aplikacije su intelektualno vlasništvo salona{" "}
                <strong>[Ime Salona]</strong>. Zabranjeno je kopiranje,
                preuzimanje i distribuiranje sadržaja bez našeg pismenog
                odobrenja.
              </p>
            </section>

            <div className="mt-4 p-6 rounded-2xl bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                Za sva pitanja u vezi sa ovim uslovima, kontaktirajte nas na{" "}
                <strong>[Vaš Email]</strong> ili pogledajte našu{" "}
                <Link
                  href="/politika-privatnosti"
                  className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Politiku privatnosti
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
