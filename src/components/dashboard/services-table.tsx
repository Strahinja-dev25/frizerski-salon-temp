"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Scissors } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServiceAction, deleteServiceAction } from "@/lib/actions/dashboard-actions";
import { createServiceSchema } from "@/lib/validations";

type ServiceData = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
};

export function ServicesTable({ services }: { services: ServiceData[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      price: 1000,
      durationMinutes: 30,
      description: "",
    },
  });

  const onSubmit = async (data: { name: string; price: string | number; durationMinutes: string | number; description: string }) => {
    setIsSubmitting(true);
    try {
      const p = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        durationMinutes: Number(data.durationMinutes),
      };
      
      const res = await createServiceAction(p) as { success: boolean; message: string };
      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Došlo je do greške.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigurno želite da obrišete ovu uslugu?")) return;
    
    setDeletingId(id);
    try {
      const res = await deleteServiceAction(id) as { success: boolean; message: string };
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Došlo je do greške prilikom brisanja.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upravljanje Uslugama</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Dodaj uslugu</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass">
            <DialogHeader>
              <DialogTitle>Nova Usluga</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Naziv usluge</label>
                <Input {...register("name")} placeholder="Muško šišanje" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message?.toString()}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cena (RSD)</label>
                <Input type="number" {...register("price", { valueAsNumber: true })} placeholder="1500" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message?.toString()}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trajanje (Minuti)</label>
                <Input type="number" step="5" {...register("durationMinutes", { valueAsNumber: true })} placeholder="30" />
                {errors.durationMinutes && <p className="text-xs text-destructive">{errors.durationMinutes.message?.toString()}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kratak opis (Opciono)</label>
                <Input {...register("description")} placeholder="Pranje i feniranje uključeno..." />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Snimanje..." : "Sačuvaj Uslugu"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
             Nema kreiranih usluga.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv Usluge</TableHead>
                <TableHead>Trajanje</TableHead>
                <TableHead>Cena (RSD)</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-muted-foreground" />
                        {service.name}
                     </div>
                  </TableCell>
                  <TableCell>{service.durationMinutes} min</TableCell>
                  <TableCell className="font-bold">{service.price}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                       variant="destructive" 
                       size="sm" 
                       onClick={() => handleDelete(service.id)}
                       disabled={deletingId === service.id}
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
  );
}
