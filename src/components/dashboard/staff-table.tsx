"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserRoleAction } from "@/lib/actions/dashboard-actions";
import { Role } from "@prisma/client";
import { User as UserIcon, Shield } from "lucide-react";

type StaffData = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function StaffTable({ staff }: { staff: StaffData[] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!confirm(`Da li ste sigurni da želite da dodelite ${newRole} permisije ovom korisniku?`)) return;
    
    setProcessingId(userId);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Došlo je do greške prilikom promene uloge.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Spisak Radnika (RBAC)</CardTitle>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
             Nema registrovanih radnika. Kada se novi radnik uloguje preko Login panela pojaviće se ovde sa STAFF rolom.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ime i Prezime</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trenutna Uloga</TableHead>
                <TableHead className="text-right">Upravljanje Ulogama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-heading text-sm text-muted-foreground">
                        {user.name[0]}
                     </div>
                     {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                     <div className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background border">
                        {user.role === "ADMIN" ? (
                           <span className="text-primary flex items-center"><Shield className="w-3 h-3 mr-1" /> Admin</span>
                        ) : (
                           <span className="text-muted-foreground flex items-center"><UserIcon className="w-3 h-3 mr-1" /> Frizer</span>
                        )}
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select 
                       disabled={processingId === user.id}
                       value={user.role} 
                       onValueChange={(val) => handleRoleChange(user.id, val as Role)}
                    >
                      <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                        <SelectValue placeholder="Promeni Ulogu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">Frizer (STAFF)</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
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
