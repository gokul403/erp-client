import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddPeriodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (period: { name: string; start: string; end: string; isBreak: boolean }) => void;
}

export function AddPeriodDialog({ isOpen, onOpenChange, onAdd }: AddPeriodDialogProps) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setStart("");
      setEnd("");
      setIsBreak(false);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!name.trim() || !start || !end) return;
    onAdd({ name: name.trim(), start, end, isBreak });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">Add Timetable Period Column</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Create a new period or break slot in the schedule layout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Period Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Period 9, Lunch Break, Recess"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Time *</label>
              <input
                type="time"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Time *</label>
              <input
                type="time"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isBreak"
              checked={isBreak}
              onChange={(e) => setIsBreak(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="isBreak" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Mark as Break (Disables subject input cards in cells)
            </label>
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
            disabled={!name.trim() || !start || !end}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
          >
            Add Period
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
