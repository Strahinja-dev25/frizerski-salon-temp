"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSalonSettingsAction, toggleBookingAction, updateWorkScheduleAction } from "@/lib/actions/dashboard-actions";
import { WorkScheduleDisplay, DAY_NAMES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function ScheduleRow({ schedule, processingDay, onSubmit }: { 
  schedule: WorkScheduleDisplay; 
  processingDay: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, day: WorkScheduleDisplay) => void;
}) {
  const [isOpen, setIsOpen] = useState(schedule.isOpen);
  const [openTime, setOpenTime] = useState(schedule.openingTime);
  const [closeTime, setCloseTime] = useState(schedule.closingTime);

  return (
    <form 
      onSubmit={(e) => onSubmit(e, schedule)}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-xl hover:bg-muted/10 transition-colors"
    >
      <div className="flex items-center gap-4 min-w-[150px]">
        <Switch 
          id={`isOpen-${schedule.dayOfWeek}`}
          name="isOpen"
          checked={isOpen}
          onCheckedChange={setIsOpen}
        />
        <Label htmlFor={`isOpen-${schedule.dayOfWeek}`} className="font-bold text-base min-w-[100px]">{schedule.dayName}</Label>
      </div>
      
      <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
        <Input type="time" name="openingTime" value={openTime} onChange={(e) => setOpenTime(e.target.value)} required className="w-[120px]" />
        <span className="text-muted-foreground font-medium">-</span>
        <Input type="time" name="closingTime" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} required className="w-[120px]" />
      </div>

      <Button 
        type="submit" 
        variant="outline" 
        size="sm" 
        disabled={processingDay === schedule.dayOfWeek}
      >
        {processingDay === schedule.dayOfWeek ? "Čuvam..." : "Sačuvaj"}
      </Button>
    </form>
  );
}

export function SettingsForm({ 
  isBookingActive, 
  schedules 
}: { 
  isBookingActive: boolean, 
  schedules: WorkScheduleDisplay[] 
}) {
  const router = useRouter();
  const [activeWait, setActiveWait] = useState(false);
  const [processingDay, setProcessingDay] = useState<string | null>(null);

  const handleToggleBooking = async (checked: boolean) => {
    setActiveWait(true);
    try {
      const res = await toggleBookingAction(checked) as { success: boolean; message: string };
      if (res.success) {
         toast.success(res.message);
         router.refresh();
      } else {
         toast.error(res.message);
      }
    } catch {
      toast.error("Greška prilikom izmene statusa.");
    } finally {
      setActiveWait(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>, day: WorkScheduleDisplay) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isOpen = formData.get("isOpen") === "on";
    const openingTime = formData.get("openingTime") as string;
    const closingTime = formData.get("closingTime") as string;

    setProcessingDay(day.dayOfWeek);
    try {
      const res = await updateWorkScheduleAction({
        dayOfWeek: day.dayOfWeek,
        isOpen,
        openingTime,
        closingTime
      }) as { success: boolean; message: string };
      
      if (res.success) {
        toast.success(`Radno vreme za ${day.dayName} je ažurirano.`);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Greška prilikom čuvanja.");
    } finally {
      setProcessingDay(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Glavne opcije */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle>Globalni Status Zakazivanja</CardTitle>
          <CardDescription>Pauzirajte celokupan sistem zakazivanja jednim klikom.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row items-center justify-between p-6 bg-muted/30 rounded-lg mx-6 mb-6">
          <div className="space-y-0.5">
             <Label className="text-base">Dozvoli novo zakazivanje</Label>
             <p className="text-sm text-muted-foreground">Kada je isključeno, klijenti će videti poruku da servis trenutno ne prima nove termine.</p>
          </div>
          <Switch 
            checked={isBookingActive} 
            onCheckedChange={handleToggleBooking} 
            disabled={activeWait} 
            className="data-[state=checked]:bg-primary"
          />
        </CardContent>
      </Card>

      {/* Radno vreme */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Redovno Radno Vreme</CardTitle>
          <CardDescription>Definišite po danima generičko radno vreme i pauze.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             {schedules.map((schedule) => (
                <ScheduleRow 
                  key={schedule.dayOfWeek} 
                  schedule={schedule} 
                  processingDay={processingDay} 
                  onSubmit={handleScheduleSubmit} 
                />
             ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
