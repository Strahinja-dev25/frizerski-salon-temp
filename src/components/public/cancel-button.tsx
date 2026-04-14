"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function CancelButton() {
  return (
    <Button 
      type="submit" 
      variant="destructive" 
      size="sm" 
      className="w-full text-xs" 
      onClick={(e) => {
        if (!window.confirm("Da li ste sigurni da želite da otkažete ovaj termin?")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="w-3 h-3 mr-1.5" /> Otkaži
    </Button>
  );
}
