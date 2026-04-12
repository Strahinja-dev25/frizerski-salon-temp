"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { srLatn } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Check, ChevronRight, Clock, MapPin, Scissors, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

import { bookAppointmentAction } from "@/lib/actions/booking-actions";
import * as z from "zod";

type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

type Staff = {
  id: string;
  name: string;
};

interface BookingFormProps {
  services: Service[];
  staff: Staff[];
}

export function BookingForm({ services, staff }: BookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.find((s) => s.id === preselectedServiceId) || null
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Ako se usluga izmeni ili dodamo param preko URL-a
    if (preselectedServiceId && step === 1 && !selectedService) {
      const s = services.find((s) => s.id === preselectedServiceId);
      if (s) {
         setSelectedService(s);
         setStep(2);
      }
    }
  }, [preselectedServiceId, services, step, selectedService]);

  useEffect(() => {
    // Dohvati slotove kada se promene staff, date ili service (duzina)
    async function fetchSlots() {
      if (!selectedStaff || !selectedDate || !selectedService) {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime(null);
      
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `/api/booking/slots?date=${dateStr}&staffId=${selectedStaff.id}&duration=${selectedService.durationMinutes}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        } else {
          toast.error("Greška pri učitavanju slobodnih termina.");
          setAvailableSlots([]);
        }
      } catch (error) {
        toast.error("Doslo je do greske sa serverom.");
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedStaff, selectedDate, selectedService]);

  // Forma za klijenta
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        clientName: z.string().min(2, "Ime je obavezno"),
        clientEmail: z.string().email("Neispravan email"),
        clientPhone: z.string().min(6, "Telefon je obavezan"),
      })
    ),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
    },
  });

  const onSubmit = async (data: { clientName: string; clientEmail: string; clientPhone: string }) => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      toast.error("Molimo Vas popunite sve korake.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Sastavljamo startTime string koji backend trazi, tj Date objekat
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const startDateTimeStr = `${dateStr}T${selectedTime}:00`;
      
      const payload = {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        serviceId: selectedService.id,
        userId: selectedStaff.id,
        startTime: startDateTimeStr
      };

      const result = await bookAppointmentAction(payload) as { success: boolean; message: string; error?: { issues?: { message: string }[]; message?: string } };
      
      if (!result.success) {
         if (result.error?.issues) {
            // Zod v4 parsing error msg
            toast.error(result.error.issues[0]?.message || "Greška pri validaciji.");
         } else {
            toast.error(result.error?.message || result.message || "Došlo je do greške prilikom zakazivanja.");
         }
      } else {
         toast.success("Vaš termin je uspešno zakazan! Očekujte potvrdu na email.");
         // Resetovanje forme ili redirekcija na success stranu
         router.push("/status?email=" + data.clientEmail);
      }
    } catch (error) {
      toast.error("Greška sa mrežom. Molimo pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[1fr_350px] gap-8">
      
      {/* GLAVNA FORMA (LEVA STRANA) */}
      <div className="flex flex-col gap-6">
        
        {/* KORAK 1: USLUGA */}
        <Card className={`glass transition-all duration-300 ${step === 1 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setStep(1)}>
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
               <CardTitle className="text-xl">Odabir usluge</CardTitle>
            </div>
            {selectedService && step !== 1 && <Button variant="ghost" size="sm">Izmeni</Button>}
          </CardHeader>
          <AnimatePresence>
            {step === 1 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <CardContent className="pt-0">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                        }}
                        className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedService?.id === service.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">{service.name}</h4>
                          <span className="font-bold text-primary">{service.price} RSD</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {service.durationMinutes} min
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* KORAK 2: FRIZER (STAFF) */}
        <Card className={`glass transition-all duration-300 ${step === 2 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
           <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => { if(selectedService) setStep(2)}}>
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
               <CardTitle className="text-xl">Izaberite frizera</CardTitle>
            </div>
            {selectedStaff && step > 2 && <Button variant="ghost" size="sm">Izmeni</Button>}
          </CardHeader>
          <AnimatePresence>
            {step === 2 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <CardContent className="pt-0">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {staff.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStaff(s);
                          setStep(3);
                        }}
                        className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-4 ${selectedStaff?.id === s.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                      >
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-heading font-bold text-lg text-muted-foreground">
                          {s.name[0]}
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold">{s.name}</span>
                           <span className="text-xs text-muted-foreground">Top Majstor</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* KORAK 3: DATUM I VREME */}
        <Card className={`glass transition-all duration-300 ${step === 3 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
           <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => { if(selectedStaff) setStep(3)}}>
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
               <CardTitle className="text-xl">Datum i Vreme</CardTitle>
            </div>
            {selectedTime && step > 3 && <Button variant="ghost" size="sm">Izmeni</Button>}
          </CardHeader>
          <AnimatePresence>
            {step === 3 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <CardContent className="pt-0 flex flex-col md:flex-row gap-8">
                  
                  {/* Calendar */}
                  <div className="bg-background rounded-2xl p-2 border border-border shrink-0 self-start">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                           const maxDate = addDays(new Date(), 14); // Maksimalno 14 dana
                           return date < new Date(new Date().setHours(0,0,0,0)) || date > maxDate;
                        }}
                        locale={srLatn}
                        className="rounded-xl"
                     />
                  </div>

                  {/* Time slots */}
                  <div className="flex-1 flex flex-col">
                     <h4 className="font-semibold mb-4 text-sm uppercase text-muted-foreground tracking-wider flex items-center justify-between">
                        Dostupni Termini
                        {isLoadingSlots && <span className="text-xs normal-case animate-pulse text-primary">Učitavanje...</span>}
                     </h4>
                     
                     {!isLoadingSlots && availableSlots.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground bg-muted/50 rounded-xl border border-border border-dashed">
                           Nažalost, nema slobodnih termina za odabrani datum.
                        </div>
                     ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                           {availableSlots.map((time) => (
                              <Button
                                 key={time}
                                 variant={selectedTime === time ? "default" : "outline"}
                                 className={`h-12 w-full font-semibold text-lg transition-all ${selectedTime === time ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:border-primary'}`}
                                 onClick={() => {
                                    setSelectedTime(time);
                                    setTimeout(() => setStep(4), 300);
                                 }}
                              >
                                 {time}
                              </Button>
                           ))}
                        </div>
                     )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* KORAK 4: PODACI (Form) */}
        <Card className={`glass transition-all duration-300 ${step === 4 ? 'ring-2 ring-primary' : 'opacity-80'}`}>
           <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => { if(selectedTime) setStep(4)}}>
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>4</div>
               <CardTitle className="text-xl">Vaši podaci</CardTitle>
            </div>
          </CardHeader>
          <AnimatePresence>
            {step === 4 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <CardContent className="pt-0">
                  <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="flex flex-col gap-2">
                        <Label htmlFor="clientName">Ime i Prezime</Label>
                        <Input id="clientName" placeholder="Zoran Jovanović" {...register("clientName")} className="h-12" />
                        {errors.clientName && <span className="text-xs text-destructive">{errors.clientName.message?.toString()}</span>}
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <Label htmlFor="clientPhone">Telefon</Label>
                           <Input id="clientPhone" placeholder="060 123 4567" {...register("clientPhone")} className="h-12" />
                           {errors.clientPhone && <span className="text-xs text-destructive">{errors.clientPhone.message?.toString()}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                           <Label htmlFor="clientEmail">Email</Label>
                           <Input id="clientEmail" placeholder="vas@email.com" {...register("clientEmail")} className="h-12" />
                           {errors.clientEmail && <span className="text-xs text-destructive">{errors.clientEmail.message?.toString()}</span>}
                        </div>
                     </div>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

      </div>

      {/* REZIME ZAKAZIVANJA (DESNA STRANA) */}
      <div className="flex flex-col">
         <Card className="glass sticky top-24 border-primary/20 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-primary/50 w-full" />
            <CardHeader className="pb-4 border-b border-border/50">
               <CardTitle className="text-xl">Vaš termin</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-6">
               
               {/* Summary Items */}
               <div className="flex gap-4 items-start">
                  <div className="bg-muted p-2.5 rounded-lg shrink-0 mt-0.5">
                     <Scissors className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Usluga</p>
                     <p className="font-bold text-foreground text-lg">{selectedService?.name || "-"}</p>
                     {selectedService && <p className="text-sm font-medium text-primary mt-1">{selectedService.price} RSD</p>}
                  </div>
               </div>

               <div className="flex gap-4 items-start">
                  <div className="bg-muted p-2.5 rounded-lg shrink-0 mt-0.5">
                     <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Frizer</p>
                     <p className="font-bold text-foreground text-lg">{selectedStaff?.name || "-"}</p>
                  </div>
               </div>

               <div className="flex gap-4 items-start">
                  <div className="bg-muted p-2.5 rounded-lg shrink-0 mt-0.5">
                     <CalendarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Vreme</p>
                     <p className="font-bold text-foreground text-lg">
                        {selectedDate && selectedTime 
                           ? `${format(selectedDate, "dd. MMM", { locale: srLatn })} u ${selectedTime}`
                           : "-"}
                     </p>
                  </div>
               </div>
               
               <div className="mt-4 pt-6 border-t border-border">
                  <Button 
                     type="submit" 
                     form="booking-form"
                     size="lg" 
                     disabled={step !== 4 || isSubmitting}
                     className="w-full h-14 rounded-full font-bold text-lg shadow-lg"
                  >
                     {isSubmitting ? "Molimo sačekajte..." : "Potvrdi termin"}
                  </Button>
               </div>
               <p className="text-xs text-center text-muted-foreground">
                  Plaćanje se vrši u salonu. Ukoliko ste sprečeni da dođete, potrebno je otkazati minimum 18h ranije.
               </p>
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
