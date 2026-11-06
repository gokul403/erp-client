import React, { useState } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  Printer, 
  Download, 
  User, 
  MapPin, 
  CheckCircle 
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import { toast } from "sonner";
import { useTeacherTimetablesQuery } from "@/hooks/use-api-data";

interface PeriodConfig {
  id: string;
  name: string;
  time: string;
  isBreak: boolean;
}

interface PeriodSlotData {
  subject: string;
  teacher: string;
  room: string;
  color: "blue" | "orange" | "purple" | "green" | "yellow" | "indigo" | "red" | "cyan" | "gray" | "neutral";
  colSpan?: number;
}

interface TeacherTimetableRecord {
  class_id: string;
  academic_year: string;
  term: string;
  status: string;
  periods: PeriodConfig[];
  days: string[];
  slots: Record<string, PeriodSlotData>;
  grade: string;
  section: string;
  class_teacher: string;
  teacher_name: string;
}

const COLOR_OPTIONS = [
  { value: "blue", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300", border: "border-l-4 border-l-blue-500 border-border" },
  { value: "orange", bg: "bg-orange-500/10 text-orange-700 dark:text-orange-300", border: "border-l-4 border-l-orange-500 border-border" },
  { value: "purple", bg: "bg-purple-500/10 text-purple-700 dark:text-purple-300", border: "border-l-4 border-l-purple-500 border-border" },
  { value: "green", bg: "bg-green-500/10 text-green-700 dark:text-green-300", border: "border-l-4 border-l-green-500 border-border" },
  { value: "yellow", bg: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300", border: "border-l-4 border-l-yellow-500 border-border" },
  { value: "indigo", bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", border: "border-l-4 border-l-indigo-500 border-border" },
  { value: "red", bg: "bg-red-500/10 text-red-700 dark:text-red-300", border: "border-l-4 border-l-red-500 border-border" },
  { value: "cyan", bg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300", border: "border-l-4 border-l-cyan-500 border-border" },
  { value: "gray", bg: "bg-gray-500/10 text-gray-700 dark:text-gray-300", border: "border-l-4 border-l-gray-500 border-border" },
  { value: "neutral", bg: "bg-muted text-muted-foreground", border: "border border-border" }
];

export function TeacherTimetable() {
  const { data: timetables = [], isLoading, error } = useTeacherTimetablesQuery();
  const [selectedRecord, setSelectedRecord] = useState<TeacherTimetableRecord | null>(null);
  const [scheduleFilter, setScheduleFilter] = useState<"My Schedule" | "Class Schedule">("My Schedule");

  // Handle Export of currently selected timetable configuration as JSON
  const handleExport = () => {
    if (!selectedRecord) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `timetable_${selectedRecord.grade}_${selectedRecord.section}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Timetable configuration exported successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <span className="text-sm font-semibold text-destructive">Failed to load timetables</span>
        <span className="text-xs text-muted-foreground">Please try again later.</span>
      </div>
    );
  }

  // --- GRID VIEW ---
  if (selectedRecord) {
    const teacherName = selectedRecord.teacher_name;
    const slots = selectedRecord.slots || {};

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Navigation Return */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRecord(null)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Back to Assigned Classes
          </span>
        </div>

        {/* Page Header */}
        <PageHeader
          title={`${selectedRecord.grade} - Section ${selectedRecord.section || "A"}`}
          subtitle={`Published academic schedule for Term: ${selectedRecord.term} (${selectedRecord.academic_year}).`}
          actions={
            <div className="flex items-center bg-muted/30 border border-border p-1 rounded-xl gap-1">
              <button
                onClick={() => setScheduleFilter("My Schedule")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  scheduleFilter === "My Schedule"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Schedule
              </button>
              <button
                onClick={() => setScheduleFilter("Class Schedule")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  scheduleFilter === "Class Schedule"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Class Schedule
              </button>
            </div>
          }
        />

        {/* Matrix Grid Card */}
        <Card className="border border-border shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden bg-card flex flex-col justify-between">
          {/* Status Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Weekly Timetable Matrix ({scheduleFilter})
              </h2>
              <Badge tone="success">
                PUBLISHED
              </Badge>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Class Teacher: {selectedRecord.class_teacher || "Unassigned"}
            </span>
          </div>

          {/* Timetable Table */}
          <div className="p-6 overflow-hidden">
            <table className="w-full border-collapse border border-border/80 table-fixed">
              <thead>
                <tr className="bg-muted/15 border-b border-border/80">
                  <th className="w-[85px] border border-border/80 px-1 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center bg-muted/5 select-none">
                    DAYS
                  </th>
                  {selectedRecord.periods.map((p) => (
                    <th 
                      key={p.id} 
                      className={`border border-border/80 px-1 py-3 text-center select-none ${
                        p.isBreak ? "w-[60px] bg-muted/30" : ""
                      }`}
                    >
                      <div className="text-[10px] font-bold text-primary tracking-wide leading-relaxed truncate" title={p.name}>
                        {p.name}
                      </div>
                      <div className="text-[9px] font-medium text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5 truncate" title={p.time}>
                        <Clock className="h-2.5 w-2.5 inline text-muted-foreground/75" /> {p.time}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRecord.days.map((day) => (
                  <tr key={day} className="border-b border-border/80 last:border-0 hover:bg-muted/5 transition">
                    {/* Day Row Header */}
                    <td className="border border-border/80 px-2 py-4 text-xs font-bold text-foreground bg-muted/10 text-center select-none w-[85px] truncate" title={day}>
                      {day}
                    </td>

                    {/* Periods */}
                    {selectedRecord.periods.map((p) => {
                      const key = `${day}-${p.id}`;
                      const slot = slots[key];

                      // Break layout
                      if (p.isBreak) {
                        const showBreakSlot = slot && (scheduleFilter === "Class Schedule" || slot.teacher === teacherName);
                        return (
                          <td 
                            key={p.id} 
                            className="border border-border/80 bg-muted/45 p-0.5 text-center select-none w-[60px]"
                          >
                            {showBreakSlot ? (
                              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate px-0.5 py-2" title={slot.subject}>
                                {slot.subject}
                              </div>
                            ) : (
                              <div className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest text-center select-none py-1 truncate">
                                BREAK
                              </div>
                            )}
                          </td>
                        );
                      }

                      // Scheduled slot
                      if (slot) {
                        const isMySlot = slot.teacher === teacherName;
                        const shouldDisplay = scheduleFilter === "Class Schedule" || isMySlot;

                        if (shouldDisplay) {
                          const colorStyling = COLOR_OPTIONS.find(c => c.value === slot.color) || COLOR_OPTIONS[0];

                          return (
                            <td
                              key={p.id}
                              className="border border-border/80 p-1 select-none"
                            >
                              <div className={`p-2 rounded-lg border transition-all ${colorStyling.bg} ${colorStyling.border} ${
                                isMySlot ? "ring-2 ring-primary/20" : ""
                              }`}>
                                <div className="font-bold text-foreground text-[11px] leading-tight truncate" title={slot.subject}>
                                  {slot.subject}
                                </div>
                                
                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground/90 font-semibold mt-1.5 truncate" title={slot.teacher}>
                                  <User className="h-2.5 w-2.5 shrink-0 text-muted-foreground/75" />
                                  <span className="truncate">{slot.teacher}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-[8px] text-muted-foreground mt-1 truncate" title={slot.room}>
                                  <MapPin className="h-2.5 w-2.5 shrink-0 text-muted-foreground/60" />
                                  <span className="truncate">{slot.room}</span>
                                </div>
                              </div>
                            </td>
                          );
                        }
                      }

                      // Empty slot
                      return (
                        <td
                          key={p.id}
                          className="border border-border/80 p-1 text-center select-none bg-muted/5"
                        >
                          <div className="text-[10px] font-medium text-muted-foreground/20 py-4 italic">
                            —
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-end border-t border-border/60 bg-muted/10 px-6 py-4 gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold hover:bg-accent transition text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={handleExport}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold hover:bg-accent transition text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export Config
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // --- CLASSES LIST VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="My Timetables"
        subtitle="View your assigned class timetables and individual teaching schedules."
      />

      {timetables.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border border-border bg-card text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <span className="text-sm font-bold text-foreground">No Assigned Classes Found</span>
          <span className="text-xs text-muted-foreground mt-1 max-w-sm">
            You are not currently scheduled as class teacher or instructor in any published timetables.
          </span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timetables.map((record: TeacherTimetableRecord) => {
            const teacherName = record.teacher_name;
            const slots = record.slots || {};

            // Extract subjects and calculate periods
            const subjectsHandled = new Set<string>();
            let periodCount = 0;
            const periodDetails: string[] = [];

            Object.entries(slots).forEach(([key, value]) => {
              if (value && value.teacher === teacherName) {
                if (value.subject) {
                  subjectsHandled.add(value.subject);
                }
                periodCount++;
                const parts = key.split("-");
                if (parts.length === 2) {
                  periodDetails.push(`${parts[0].slice(0, 3)} ${parts[1]}`);
                }
              }
            });

            const uniqueSubjects = Array.from(subjectsHandled).join(", ") || "Assigned Assistant";

            return (
              <Card 
                key={`${record.class_id}-${record.academic_year}`} 
                className="border border-border bg-card shadow-sm flex flex-col justify-between hover:border-primary/30 transition duration-300 overflow-hidden"
              >
                {/* Card Top / Title */}
                <div className="p-5 border-b border-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone="success">
                      <CheckCircle className="h-3 w-3 inline mr-1 text-success" /> PUBLISHED
                    </Badge>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {record.academic_year}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {record.grade} - Section {record.section || "A"}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Term: {record.term}
                  </span>
                </div>

                {/* Info List */}
                <div className="p-5 space-y-3.5 flex-1 bg-muted/5">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Subjects Handled
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {uniqueSubjects}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Assigned Periods
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {periodCount} period{periodCount === 1 ? "" : "s"} per week
                      </span>
                      {periodDetails.length > 0 && (
                        <span className="text-[10px] text-muted-foreground block max-w-[220px] truncate" title={periodDetails.join(", ")}>
                          ({periodDetails.slice(0, 4).join(", ")}{periodDetails.length > 4 ? "..." : ""})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Button footer */}
                <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setScheduleFilter("My Schedule");
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
                  >
                    View Timetable
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
