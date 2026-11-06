import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddRowDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => void;
}

export function AddRowDialog({ isOpen, onOpenChange, onAdd }: AddRowDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">Append Timetable Day Row</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Specify a custom label or week day for the new row.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Row Label *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saturday, Special Session"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim()}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
          >
            Add Row
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
