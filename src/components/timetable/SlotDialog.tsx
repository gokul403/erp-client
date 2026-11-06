import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PeriodSlot {
  subject: string;
  teacher: string;
  room: string;
  color: "blue" | "orange" | "purple" | "green" | "yellow" | "indigo" | "red" | "cyan" | "gray" | "neutral";
  colSpan?: number;
}

interface SlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeDay: string;
  activePeriodId: string;
  initialValue: PeriodSlot | null;
  teachers: any[];
  commonSubjects: string[];
  colorOptions: { value: PeriodSlot["color"]; label: string; bg: string; border: string }[] ;
  onSave: (payload: { subject: string; teacher: string; room: string; color: PeriodSlot["color"]; colSpan: number }) => void;
  onDelete: () => void;
}

export function SlotDialog({
  isOpen,
  onOpenChange,
  activeDay,
  activePeriodId,
  initialValue,
  teachers,
  commonSubjects,
  colorOptions,
  onSave,
  onDelete,
}: SlotDialogProps) {
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [color, setColor] = useState<PeriodSlot["color"]>("blue");
  const [colSpan, setColSpan] = useState(1);
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  // Sync state with initialValue when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        setSubject(initialValue.subject || "");
        setTeacher(initialValue.teacher || "");
        setRoom(initialValue.room || "");
        setColor(initialValue.color || "blue");
        setColSpan(initialValue.colSpan || 1);

        const tObj = teachers.find((t: any) => t.name === initialValue.teacher);
        const tSubs = tObj?.metadata?.subjectsTaught
          ? tObj.metadata.subjectsTaught.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
        const isCommon = commonSubjects.includes(initialValue.subject);
        setIsCustomSubject(!isCommon && !tSubs.includes(initialValue.subject));
      } else {
        setSubject("");
        setTeacher("");
        setRoom("");
        setColor("blue");
        setColSpan(1);
        setIsCustomSubject(false);
      }
    }
  }, [isOpen, initialValue, teachers, commonSubjects]);

  const handleSave = () => {
    if (!subject.trim()) {
      return;
    }
    onSave({ subject, teacher, room, color, colSpan });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-background border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {initialValue ? "Edit Period Schedule" : "Add Period Schedule"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Set subject, lead instructor, room allocation and accent color for {activeDay} period {activePeriodId}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Teacher Select */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lead Teacher</label>
            <select
              value={teacher}
              onChange={(e) => {
                const chosenTeacher = e.target.value;
                setTeacher(chosenTeacher);
                const tObj = teachers.find((t: any) => t.name === chosenTeacher);
                const firstSub = tObj?.metadata?.subjectsTaught?.split(",")[0]?.trim() || "";
                if (firstSub) {
                  setSubject(firstSub);
                  setIsCustomSubject(false);
                } else {
                  setSubject("");
                }
              }}
              className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="">Select Teacher (Optional)</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.role || t.custom_role || "Teacher"})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subject Name *</label>
            {!isCustomSubject ? (
              <select
                value={subject}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomSubject(true);
                    setSubject("");
                  } else {
                    setSubject(e.target.value);
                  }
                }}
                className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
              >
                <option value="">Select Subject</option>
                {(() => {
                  const tObj = teachers.find((t: any) => t.name === teacher);
                  const tSubs = tObj?.metadata?.subjectsTaught
                    ? tObj.metadata.subjectsTaught.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : [];
                  return (
                    <>
                      {tSubs.length > 0 && (
                        <optgroup label="Teacher's Subjects">
                          {tSubs.map((sub: string) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Common Subjects">
                        {commonSubjects.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </optgroup>
                    </>
                  );
                })()}
                <option value="__custom__">+ Enter Custom Subject...</option>
              </select>
            ) : (
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Organic Chemistry, French"
                  className="h-10 w-full rounded-lg border border-input bg-card pl-3 pr-20 text-xs outline-none transition focus:border-ring"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomSubject(false)}
                  className="absolute right-2 px-2.5 py-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Choose List
                </button>
              </div>
            )}
          </div>

          {/* Classroom Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Classroom / Room</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Lab 201, Room 104"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none transition focus:border-ring focus:ring-2"
            />
          </div>

          {/* Accent Theme Select */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subject Styling Accent</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value as PeriodSlot["color"])}
              className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              {colorOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-2">
          <div>
            {initialValue && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition cursor-pointer"
              >
                Clear Card
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
              className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              Save Slot
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
