"use client";

import { useState } from "react";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CalendarIcon, Trash2, CalendarHeart } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createTimeOffAction, deleteTimeOffAction } from "@/lib/actions/dashboard-actions";

type TimeOffData = {
  id: string;
  date: Date;
  reason: string;
  user?: { name: string };
};

export function TimeOffForm({ timeoffs, isAdmin }: { timeoffs: TimeOffData[], isAdmin: boolean }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: "",
      reason: "",
    },
  });

  const onSubmit = async (data: { reason: string }) => {
    if (!selectedDate) {
      toast.error("Izaberite datum sa kalendara.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Set to 12:00 PM local time to prevent timezone shift when converting to UTC
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(12, 0, 0, 0);

      const payload = {
        date: normalizedDate.toISOString(),
        reason: data.reason,
      };
      const res = await createTimeOffAction(payload) as { success: boolean, message: string };
      if (res.success) {
        toast.success(res.message);
        reset();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Došlo je do greške.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Da li želite da uklonite ovaj slobodan dan?")) return;
    setDeletingId(id);
    try {
      const res = await deleteTimeOffAction(id) as { success: boolean, message: string };
      if (res.success) {
         toast.success(res.message);
         router.refresh();
      } else {
         toast.error(res.message);
      }
    } catch {
      toast.error("Došlo je do greške.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
      
      {/* Tabela slobodnih dana */}
      <Card className="glass-panel overflow-hidden">
        <CardHeader>
          <CardTitle>Spisak Slobodnih Dana</CardTitle>
          <CardDescription>Evidencija zakazanih slobodnih dana za radnike. U tom periodu se ne može vršiti zakazivanje termina.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {timeoffs.length === 0 ? (
             <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl m-6">
                Nema unetih slobodnih dana.
             </div>
          ) : (
            <Table>
               <TableHeader>
                  <TableRow>
                     {isAdmin && <TableHead>Radnik</TableHead>}
                     <TableHead>Datum</TableHead>
                     <TableHead>Razlog</TableHead>
                     <TableHead className="text-right">Akcija</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {timeoffs.map((to) => (
                     <TableRow key={to.id}>
                        {isAdmin && (
                           <TableCell className="font-bold">{to.user?.name}</TableCell>
                        )}
                        <TableCell className="font-medium">
                           <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(to.date), "dd. MMM yyyy", { locale: srLatn })}
                           </div>
                        </TableCell>
                        <TableCell>{to.reason}</TableCell>
                        <TableCell className="text-right">
                           <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(to.id)}
                              disabled={deletingId === to.id}
                           >
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Forma za novi TimeOff */}
      <Card className="glass-panel border-primary/20 bg-muted/10">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <CalendarHeart className="w-5 h-5 text-primary" />
               Prijavi Odmor
            </CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               
               <div className="bg-background rounded-xl p-2 border border-border flex justify-center">
                  <Calendar
                     mode="single"
                     selected={selectedDate}
                     onSelect={setSelectedDate}
                     locale={srLatn}
                     className="rounded-xl"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium">Razlog (Opciono)</label>
                  <Input {...register("reason")} placeholder="Godišnji odmor, Bolovanje..." />
                  {errors.reason && <p className="text-xs text-destructive">{errors.reason.message?.toString()}</p>}
               </div>

               <Button type="submit" size="lg" className="w-full flex" disabled={isSubmitting}>
                  {isSubmitting ? "Prijava..." : "Snimi slobodan dan"}
               </Button>
            </form>
         </CardContent>
      </Card>

    </div>
  );
}
