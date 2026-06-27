"use client";

import { useState } from "react";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import { Check, X, Calendar as CalendarIcon, Clock, Scissors, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateAppointmentStatusAction } from "@/lib/actions/dashboard-actions";
import { AppointmentStatus } from "@prisma/client";

type AppointmentData = {
  id: string;
  clientName: string;
  clientPhone: string;
  startTime: Date;
  endTime: Date;
  status: string;
  service: { name: string; price: number };
  user: { name: string };
};

export function AppointmentsTable({ appointments, isAdmin }: { appointments: AppointmentData[]; isAdmin: boolean }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("SVE");
  const [visibleCount, setVisibleCount] = useState<number>(30);

  const filteredAppointments = statusFilter === "SVE"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const visibleAppointments = filteredAppointments.slice(0, visibleCount);
  const hasMore = filteredAppointments.length > visibleCount;

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setProcessingId(id);
    try {
      const payload = { id, status: newStatus };
      const res = await updateAppointmentStatusAction(payload) as { success: boolean; message: string };
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Došlo je do greške.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="glass-panel overflow-hidden shadow-sm border border-black/80 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle>{isAdmin ? "Svi Termini" : "Moji Termini"}</CardTitle>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-center text-sm rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="SVE">Svi termini</option>
          <option value="PENDING">Na čekanju</option>
          <option value="APPROVED">Odobreni</option>
          <option value="COMPLETED">Završeni</option>
          <option value="REJECTED">Odbijeni</option>
          <option value="CANCELLED_BY_CLIENT">Otkazao klijent</option>
          <option value="CANCELLATION_REQUESTED">Zahtev za otkazivanje</option>
        </select>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl m-4">
            Nema termina za izabrani filter.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] pl-4">Klijent</TableHead>
                <TableHead>Usluga</TableHead>
                {isAdmin && <TableHead>Frizer</TableHead>}
                <TableHead>Vreme</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAppointments.map((appt) => {
                const isPending = appt.status === "PENDING";
                const isApproved = appt.status === "APPROVED";
                const isCompleted = appt.status === "COMPLETED";
                const isCancellationRequested = appt.status === "CANCELLATION_REQUESTED";

                return (
                  <TableRow key={appt.id} className={isPending ? "bg-amber-500/5 hover:bg-amber-500/10" : isCancellationRequested ? "bg-red-500/5 border-l-4 border-l-red-500 hover:bg-red-500/10" : ""}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{appt.clientName}</span>
                        <span className="text-xs text-muted-foreground">{appt.clientPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center"><Scissors className="w-3 h-3 mr-1" /> {appt.service.name}</span>
                        <span className="text-xs text-primary">{appt.service.price} RSD</span>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <span className="text-sm flex items-center"><UserIcon className="w-3 h-3 mr-1" /> {appt.user.name}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1 text-muted-foreground" />
                          {format(new Date(appt.startTime), "dd. MMM yyyy", { locale: srLatn })}
                        </span>
                        <span className="text-xs flex items-center mt-0.5 font-bold">
                          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                          {format(new Date(appt.startTime), "HH:mm")} - {format(new Date(appt.endTime), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background border">
                        {isPending && <span className="text-amber-500 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" /> Na čekanju</span>}
                        {isApproved && <span className="text-primary flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" /> Odobren</span>}
                        {isCompleted && <span className="text-green-600 flex items-center"><Check className="w-3 h-3 mr-1" /> Završen</span>}
                        {isCancellationRequested && <span className="text-red-600 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse" /> Zahtev za Otkazivanje</span>}
                        {appt.status === "CANCELLED_BY_CLIENT" && <span className="text-muted-foreground flex items-center">Otkazao Klijent</span>}
                        {appt.status === "REJECTED" && <span className="text-destructive flex items-center">Odbijen/Otkazan</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isPending && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-600"
                            onClick={() => handleStatusChange(appt.id, "APPROVED")}
                            disabled={processingId === appt.id}
                          >
                            <Check className="w-4 h-4 mr-1" /> Odobri
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-500/10 hover:text-red-600 pr-4"
                            onClick={() => handleStatusChange(appt.id, "REJECTED")}
                            disabled={processingId === appt.id}
                          >
                            <X className="w-4 h-4 mr-1" /> Odbij
                          </Button>
                        </div>
                      )}

                      {isApproved && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                            disabled={processingId === appt.id}
                          >
                            <Check className="w-4 h-4 mr-1" /> Završi termin
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Da li ste sigurni da želite da otkažete odobren termin? Klijent će izgubiti rezervaciju.")) {
                                handleStatusChange(appt.id, "REJECTED")
                              }
                            }}
                            disabled={processingId === appt.id}
                          >
                            Otkaži termin
                          </Button>
                        </div>
                      )}

                      {isCancellationRequested && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange(appt.id, "CANCELLED_BY_CLIENT")}
                            disabled={processingId === appt.id}
                          >
                            <Check className="w-4 h-4 mr-1" /> Odobri Otkazivanje
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appt.id, "APPROVED")}
                            disabled={processingId === appt.id}
                          >
                            <X className="w-4 h-4 mr-1" /> Zadrži Termin
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {filteredAppointments.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Prikazano <span className="font-semibold text-foreground">{Math.min(visibleCount, filteredAppointments.length)}</span> od <span className="font-semibold text-foreground">{filteredAppointments.length}</span> termina
          </span>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + 30)}
            >
              Učitaj još 30
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
