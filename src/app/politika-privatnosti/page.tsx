import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

export const metadata: Metadata = {
  title: "Politika Privatnosti | [Ime Salona]",
  description: "Saznajte kako frizerski salon [Ime Salona] prikuplja, koristi i štiti vaše lične podatke.",
};

export default function PolitikaPrivatnostiPage() {
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
              Politika Privatnosti
            </h1>
            <p className="text-sm text-muted-foreground">
              Poslednje ažuriranje: {lastUpdated}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Usklađeno sa Zakonom o zaštiti podataka o ličnosti (ZZPL).
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Ova Politika privatnosti objašnjava kako frizerski salon{" "}
              <strong>[Ime Salona]</strong> prikuplja, koristi i štiti podatke o
              ličnosti koje nam prosleđujete koristeći našu aplikaciju za
              zakazivanje. Vaša privatnost nam je najviši prioritet.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                1. Koje podatke prikupljamo?
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Kada zakazujete termin preko naše aplikacije, prikupljamo
                sledeće podatke:
              </p>
              <ul className="flex flex-col gap-2 ml-4">
                {[
                  "Vaše ime i prezime",
                  "Broj telefona (neophodan za potvrdu termina i kontakt u slučaju hitnih izmena)",
                  "E-mail adresu (za slanje potvrde o zakazivanju)",
                  "Istoriju vaših zakazanih termina i odabranih usluga",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                2. Kako i zašto koristimo podatke?
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Podatke koje ostavite u aplikaciji koristimo isključivo u svrhe
                vođenja evidencije termina i pružanja što kvalitetnije usluge.
                Vaš broj telefona ili e-mail možemo koristiti kako bismo vam
                poslali automatski podsetnik o predstojećem terminu. Nećemo vam
                slati reklamne (Spam) poruke ukoliko za to niste dali izričit
                pristanak.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                3. Sistem za zakazivanje i plaćanje
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Online zakazivanje termina realizuje se putem sopstvene aplikacije
                razvijene direktno za potrebe salona <strong>[Ime Salona]</strong>.
                Ne koristimo nikakve eksterne platforme za zakazivanje (kao što su
                Fresha, Booksy, Calendly ili slične). Svi podaci koje unesete
                ostaju isključivo u okviru naše infrastrukture.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Plaćanje:</strong> Naša aplikacija ne nudi opciju online
                plaćanja karticama unapred. Sve usluge se plaćaju isključivo
                direktno u salonu — gotovinom ili karticom na licu mesta. Putem
                aplikacije se ne prikupljaju nikakvi podaci o platnim karticama.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                4. Automatska obaveštenja putem e-maila
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Nakon zakazivanja termina, vaša e-mail adresa se koristi
                isključivo za slanje sledećih <strong>automatskih transakcionih
                obaveštenja</strong> vezanih za vaš termin:
              </p>
              <ul className="flex flex-col gap-2 ml-4">
                {[
                  "Potvrda da je termin odobren od strane frizera",
                  "Obaveštenje u slučaju da termin nije mogao biti odobren",
                  "Potvrda otkazivanja termina",
                  "Jutarnji podsetnik na dan termina (oko 6:00)",
                  "Obaveštenje o statusu zahteva za otkazivanje",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Ova obaveštenja su <strong>isključivo transakcione prirode</strong> —
                šalju se samo u vezi sa vašim konkretnim terminom i ne predstavljaju
                marketinšku komunikaciju. Vaše podatke <strong>ne koristimo</strong> za
                slanje promotivnih poruka, newsletter-a ni popusta bez vašeg izričitog
                pristanka.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                5. Koliko dugo čuvamo podatke?
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Vaše podatke čuvamo onoliko dugo koliko je potrebno za pružanje
                usluge i vođenje evidencije u skladu sa zakonskim obavezama.
                Možete u svakom trenutku zatražiti brisanje svojih podataka
                kontaktiranjem salona na e-mail ili telefon navedene u nastavku.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                6. Sigurnost i deljenje sa trećim licima
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed">
                Vaši podaci se čuvaju na sigurnim serverima i zaštićeni su od
                neovlašćenog pristupa. Mi ni pod kojim okolnostima ne prodajemo,
                ne iznajmljujemo i ne prosleđujemo vaše kontakt podatke
                marketinškim agencijama niti bilo kojim trećim licima. Pristup
                podacima imaju isključivo zaposleni u salonu u svrhu organizacije
                radnog dana.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl font-bold">
                7. Vaša prava po Zakonu
              </h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground leading-relaxed mb-2">
                Kao korisnik naše aplikacije imate zakonsko pravo da u svakom
                trenutku:
              </p>
              <ul className="flex flex-col gap-2 ml-4">
                {[
                  "Zatražite uvid u to kojim tačno vašim podacima raspolažemo",
                  "Zatražite izmenu (ispravku) netačnih podataka",
                  'Zatražite potpuno brisanje vašeg naloga i svih pratećih podataka ("pravo na zaborav") iz naše baze',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-4 p-6 rounded-2xl bg-muted border border-border flex flex-col gap-2">
              <p className="font-semibold">Kontakt za zaštitu podataka</p>
              <p className="text-sm text-muted-foreground">
                Svoja prava možete iskoristiti tako što ćete nas kontaktirati:
              </p>
              <p className="text-sm text-muted-foreground">
                📧 E-mail: <strong>[Vaš Email]</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                📞 Telefon: <strong>[Vaš Broj]</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Takođe pogledajte naše{" "}
                <Link
                  href="/uslovi-koriscenja"
                  className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Uslove korišćenja
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
