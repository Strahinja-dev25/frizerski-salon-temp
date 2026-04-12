# Here are all the guidelines that you need to follow for this project

## Opste stavke
Uloge (RBAC): Stroga diferencijacija između ADMIN i RADNIK uloga putem middleware-a. Radnik nikada ne sme imati pristup API rutama koje menjaju cene ili brišu druge radnike.

Jezik i Valuta: Celokupan UI mora biti na srpskom jeziku (latinica), a valuta isključivo RSD.

Pravila otkazivanja: Implementirati logiku da klijent ne može samostalno otkazati termin ako je do njega ostalo manje od 18 sati.

## Tehnicke stavke
Next.js App Router: Koristi isključivo App Router arhitekturu sa Server i Client komponentama tamo gde je prikladno.

Type Safety: Svaka funkcija, prop i API odgovor moraju imati definisane TypeScript interfejse. Zabranjeno korišćenje any tipa.

Prisma & Zod: Koristi Zod za validaciju podataka koji stižu sa frontenda pre nego što se proslede Prismi u bazu.

Clerk Auth: Integrisati Clerk za autentifikaciju, koristeći publicMetadata za čuvanje uloga korisnika (admin/staff).

Brzina učitavanja: Optimizacija slika putem next/image i korišćenje "Skeleton" ekrana dok se podaci sa dashboard-a učitavaju.

**Automatsko održavanje baze (Vercel Cron):** Baza mora da ostane brza i čista. Implementirati API rutu (npr. `/api/cron/cleanup`) koja će biti okidana preko Vercel Cron Jobs (svake noći u 00:00). Njen jedini zadatak je: `db.appointment.deleteMany({ where: { endTime: { lt: pre20Dana } } })`. Obezbediti da je ova ruta zaštićena tajnim ključem (CRON_SECRET) kako ne bi mogla javno da se okida. Bezbednost i efikasnost su najbitniji.

**Arhitektura Foldera (Strict Layering):** 
Zahtevam čistu "Service Layer" arhitekturu.
`src/` folder sadrzi sve bitne foldere za aplikaciju (sve sto direktno pravi aplikacuju), ima sledece foldere:
  1. `app/` folder sadrži isključivo prezentacione React komponente (View sloj) bez direktnih `db` poziva.
  2. `components/` ako ti treba da odvojis komponente stranica na poseban fajl.
  3. `lib/actions/` sadrži Next.js Server Actions (Controller sloj) koji rade validaciju sa Zod-om i okidaju servise.
  4. `services/` (npr. `booking-service.ts`, `settings-service.ts`) sadrže apsolutno svu Prisma logiku (Data Access sloj).
  5. `types/` ako treba za typescript interface-eve koji se ponavjaju.

## Dizajn stavke
Tailwind Config: Sve glavne boje i fontovi moraju biti definisani u tailwind.config.js. Menjanjem te dve-tri linije koda, ceo sajt mora da promeni vizuelni identitet (za drugog klijenta).

Glassmorphism: Koristi backdrop-blur i polu-transparentne pozadine sa tankim border-white/10 ivicama za kartice.

Dark/Light Mode: Implementirati next-themes. Boje moraju biti konzistentne—tamna tema ne sme biti čista crna, već duboka siva/teget (slate-950 ili slično).

Responsive design: Mobile-first pristup. Kalendar na dashboard-u mora biti pregledan i na telefonu (npr. horizontalni skrol ili list view za mobilne).

Framer Motion: Koristi suptilne animacije (fade-in, hover scale) za interaktivne elemente da bi sajt delovao "živo".

## SEO stavke
Metadata API: Svaka stranica mora imati definisan title i description (npr. "Najbolji muški frizer u Kragujevcu - TestFriz").

OpenGraph: Automatski generisani tagovi za deljenje na društvenim mrežama (slika salona, naslov).

Semantic HTML: Koristiti pravilne tagove (<header>, <main>, <footer>, <h1>-<h3>) kako bi Google lakše indeksirao usluge salona.

Local SEO: Implementirati JSON-LD šemu za lokalni biznis (LocalBusiness schema) kako bi se radno vreme i lokacija ispravno prikazivali na Google mapi.

## Sajt mora biti spreman za deploy na Vercel jednim klikom. Sva osetljiva podešavanja (Database URL, Clerk Keys) moraju biti isključivo u .env fajlu, a on mora biti u gitignore i ne sme biti dostupan nikome.
