"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Check } from "lucide-react";
import { cancelAppointmentByClientAction } from "@/lib/actions/dashboard-actions";
import { useRouter } from "next/navigation";

type Props = {
  appointmentId: string;
  clientEmail: string;
  canDirectCancel: boolean; // true = >18h, false = <18h
};

export function ApprovedCancelButton({ appointmentId, clientEmail, canDirectCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (canDirectCancel) {
      if (!window.confirm("Da li ste sigurni da želite da otkažete ovaj termin?")) return;
    } else {
      if (!window.confirm("Do vašeg termina je ostalo manje od 18 sati. Želite li da pošaljete zahtev za otkazivanje frizeru?")) return;
    }

    setLoading(true);
    try {
      const res = await cancelAppointmentByClientAction(appointmentId, clientEmail);
      if (res.success) {
        if (canDirectCancel) {
          router.refresh();
        } else {
          setSent(true);
        }
      } else {
        alert(res.message);
      }
    } catch {
      alert("Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
        <Check className="w-3 h-3" /> Zahtev poslat
      </div>
    );
  }

  return (
    <Button
      variant={canDirectCancel ? "destructive" : "outline"}
      size="sm"
      className={`w-full text-xs ${!canDirectCancel ? "border-amber-500 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600" : ""}`}
      onClick={handleCancel}
      disabled={loading}
    >
      {canDirectCancel ? (
        <><Trash2 className="w-3 h-3 mr-1.5" /> Otkaži termin</>
      ) : (
        <><Clock className="w-3 h-3 mr-1.5" /> Zatraži otkazivanje</>
      )}
    </Button>
  );
}
