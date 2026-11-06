import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PeriodConfig {
  id: string;
  name: string;
  time: string;
  isBreak: boolean;
}

interface EditPeriodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  period: PeriodConfig | null;
  onSave: (updatedPeriod: PeriodConfig) => void;
  onDelete: (periodId: string) => void;
}

export function EditPeriodDialog({
  isOpen,
  onOpenChange,
  period,
  onSave,
  onDelete,
}: EditPeriodDialogProps) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (isOpen && period) {
      setName(period.name);
      setIsBreak(period.isBreak);
      const times = (period.time || "").split("-");
      if (times.length === 2) {
        setStart(times[0].trim());
        setEnd(times[1].trim());
      } else {
        setStart("");
        setEnd("");
      }
    }
  }, [isOpen, period]);

  const handleSave = () => {
    if (!period || !name.trim() || !start || !end) return;
    onSave({
      id: period.id,
      name: name.trim(),
      time: `${start} - ${end}`,
      isBreak,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-background border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">Configure Column Details</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Update labels, timing intervals or mark breaks for this column.
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
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Time *</label>
              <input
                type="text"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="e.g. 08:00"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Time *</label>
              <input
                type="text"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="e.g. 08:45"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editIsBreak"
              checked={isBreak}
              onChange={(e) => setIsBreak(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="editIsBreak" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Mark as Break (Disables subject input cards in cells)
            </label>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
          <div>
            {period && (
              <button
                type="button"
                onClick={() => onDelete(period.id)}
                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition cursor-pointer"
              >
                Delete Column
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || !start || !end}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
            >
              Save Details
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
