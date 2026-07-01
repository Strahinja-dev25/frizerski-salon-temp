import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scissors, ShieldAlert, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/20 p-6 text-center">
      <div className="max-w-md w-full bg-background p-10 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
        {/* Dekorativni element u pozadini */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3">
          <ShieldAlert className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-heading font-bold mb-4 tracking-tight">Pristup ograničen</h1>
        
        <div className="space-y-4 mb-10">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Registracija novih naloga unutar aplikacije je onemogućena. 
          </p>
          <div className="bg-muted p-4 rounded-xl border border-border/50">
            <p className="text-sm font-medium">
              Nove naloge kreira isključivo <span className="text-primary font-bold">Administrator</span> ili <span className="text-primary font-bold">Direktor</span>.
            </p>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Ako ste radnik salona, obratite se šefu da vas doda u sistem.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button className="w-full h-12 rounded-xl text-md font-semibold gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]">
              <ArrowLeft className="w-4 h-4" />
              Nazad na početnu
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="w-full h-12 rounded-xl text-md font-medium">
              Prijava za postojeće korisnike
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 grayscale opacity-50">
          <Scissors className="h-4 w-4" />
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground">TestFriz System</span>
        </div>
      </div>
    </div>
  );
}
