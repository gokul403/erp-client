import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Printer, 
  Download, 
  User, 
  MapPin, 
  History,
  Trash2,
  Sparkles
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import { toast } from "sonner";
import { Route } from "../routes/timetable";
import { useClassesQuery, useClassTimetableQuery, useClassTimetablesQuery, useUpsertClassTimetableMutation, useStaffQuery } from "@/hooks/use-api-data";
import { useRole } from "../lib/role-context";
import { TeacherTimetable } from "./TeacherTimetable";

import { SlotDialog, PeriodSlot } from "@/components/timetable/SlotDialog";
import { AddPeriodDialog } from "@/components/timetable/AddPeriodDialog";
import { EditPeriodDialog, PeriodConfig } from "@/components/timetable/EditPeriodDialog";
import { AddRowDialog } from "@/components/timetable/AddRowDialog";

interface PeriodSlotData {
  subject: string;
  teacher: string;
  room: string;
  color: "blue" | "orange" | "purple" | "green" | "yellow" | "indigo" | "red" | "cyan" | "gray" | "neutral";
  colSpan?: number;
}

interface TimetableData {
  status: "Draft" | "Published";
  lastSaved: string;
  periods: PeriodConfig[];
  days: string[];
  slots: Record<string, PeriodSlotData>; // Key: "DayName-PeriodId"
}

const DEFAULT_PERIODS: PeriodConfig[] = [
  { id: "P1", name: "PERIOD 1", time: "08:00 - 08:45", isBreak: false },
  { id: "P2", name: "PERIOD 2", time: "08:45 - 09:30", isBreak: false },
  { id: "P3", name: "PERIOD 3", time: "09:30 - 10:15", isBreak: false },
  { id: "B1", name: "SHORT BREAK", time: "10:15 - 10:30", isBreak: true },
  { id: "P4", name: "PERIOD 4", time: "10:30 - 11:15", isBreak: false },
  { id: "P5", name: "PERIOD 5", time: "11:15 - 12:00", isBreak: false },
  { id: "P6", name: "PERIOD 6", time: "12:00 - 12:45", isBreak: false },
  { id: "P7", name: "PERIOD 7", time: "01:30 - 02:15", isBreak: false },
  { id: "P8", name: "PERIOD 8", time: "02:15 - 03:00", isBreak: false },
];

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const COLOR_OPTIONS: { value: PeriodSlotData["color"]; label: string; bg: string; border: string }[] = [
  { value: "blue", label: "Blue (Math)", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300", border: "border-l-4 border-l-blue-500 border-border" },
  { value: "orange", label: "Orange (Science/Physics)", bg: "bg-orange-500/10 text-orange-700 dark:text-orange-300", border: "border-l-4 border-l-orange-500 border-border" },
  { value: "purple", label: "Purple (Language/English)", bg: "bg-purple-500/10 text-purple-700 dark:text-purple-300", border: "border-l-4 border-l-purple-500 border-border" },
  { value: "green", label: "Green (Humanities/History)", bg: "bg-green-500/10 text-green-700 dark:text-green-300", border: "border-l-4 border-l-green-500 border-border" },
  { value: "yellow", label: "Yellow (P.E./Activities)", bg: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300", border: "border-l-4 border-l-yellow-500 border-border" },
  { value: "indigo", label: "Indigo (Projects/Clubs)", bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", border: "border-l-4 border-l-indigo-500 border-border" },
  { value: "red", label: "Red (Chemistry)", bg: "bg-red-500/10 text-red-700 dark:text-red-300", border: "border-l-4 border-l-red-500 border-border" },
  { value: "cyan", label: "Cyan (Computers/IT)", bg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300", border: "border-l-4 border-l-cyan-500 border-border" },
  { value: "gray", label: "Gray (Study/Break)", bg: "bg-gray-500/10 text-gray-700 dark:text-gray-300", border: "border-l-4 border-l-gray-500 border-border" },
  { value: "neutral", label: "Neutral", bg: "bg-muted text-muted-foreground", border: "border border-border" }
];

export function AdminTimetable() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { classId?: string };
  const { data: classesList = [], isLoading: isClassesLoading } = useClassesQuery();
  const { user, role } = useRole();
  const isTeacher = role === "teacher";

  const filteredClasses = isTeacher
    ? classesList.filter((c: any) => c.teacher === user?.name)
    : classesList;

  // Filters State
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2026-2027");
  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const [selectedClassId, setSelectedClassId] = useState("");

  // Timetable API queries & mutations
  const { data: dbTimetableData, isLoading: isTimetableLoading, error: timetableError } = 
    useClassTimetableQuery(selectedClassId, selectedAcademicYear, selectedTerm);
  const { data: allTimetablesList = [] } = useClassTimetablesQuery();
  const { data: staffList = [] } = useStaffQuery();
  const upsertMutation = useUpsertClassTimetableMutation();

  // Timetable State
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);

  // Dialog Visibility States
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [isEditPeriodOpen, setIsEditPeriodOpen] = useState(false);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);

  // Dialog Context States
  const [activeDay, setActiveDay] = useState("");
  const [activePeriodId, setActivePeriodId] = useState("");
  const [editingPeriod, setEditingPeriod] = useState<PeriodConfig | null>(null);

  const teachers = staffList.filter(
    (s: any) =>
      s.user_type === 2 ||
      (s.role && (s.role.toLowerCase().includes("teacher") || s.role.toLowerCase().includes("instructor")))
  );

  const commonSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education",
    "Art",
    "Music"
  ];

  // Determine current class from list or search query
  useEffect(() => {
    if (filteredClasses.length > 0) {
      if (search.classId && filteredClasses.some(c => c.id === search.classId)) {
        setSelectedClassId(search.classId);
      } else {
        setSelectedClassId(filteredClasses[0].id);
      }
    }
  }, [filteredClasses, search.classId]);

  // Load timetable data whenever selected parameters change
  useEffect(() => {
    if (selectedClassId) {
      if (dbTimetableData) {
        setTimetableData({
          status: dbTimetableData.status || "Draft",
          lastSaved: dbTimetableData.updated_at 
            ? `Saved at ${new Date(dbTimetableData.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
            : "Loaded from Database",
          periods: dbTimetableData.periods || DEFAULT_PERIODS,
          days: dbTimetableData.days || DEFAULT_DAYS,
          slots: dbTimetableData.slots || {}
        });
      } else if (timetableError || (!isTimetableLoading && !dbTimetableData)) {
        // Initialize with default template if not found in db (without dummy data)
        setTimetableData({
          status: "Draft",
          lastSaved: "Not saved to database yet",
          periods: DEFAULT_PERIODS,
          days: DEFAULT_DAYS,
          slots: {}
        });
      }
    }
  }, [dbTimetableData, isTimetableLoading, timetableError, selectedClassId, selectedAcademicYear, selectedTerm]);

  // Retrieve current active class object
  const currentClass = filteredClasses.find((c) => c.id === selectedClassId);

  // Handle saving the schedule data (Draft or Published) to backend database
  const saveSchedule = async (newStatus?: "Draft" | "Published") => {
    if (!selectedClassId || !timetableData) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lastSavedText = `Saved at ${timeStr}`;

    const statusVal = newStatus || timetableData.status;

    try {
      await upsertMutation.mutateAsync({
        class_id: selectedClassId,
        academic_year: selectedAcademicYear,
        term: selectedTerm,
        status: statusVal,
        periods: timetableData.periods,
        days: timetableData.days,
        slots: timetableData.slots
      });

      setTimetableData({
        ...timetableData,
        status: statusVal,
        lastSaved: lastSavedText
      });
      toast.success(`Schedule saved as ${statusVal === "Published" ? "Published" : "Draft"} successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save schedule to database");
    }
  };

  // Open slot editor
  const handleOpenSlot = (day: string, periodId: string) => {
    if (!timetableData) return;
    setActiveDay(day);
    setActivePeriodId(periodId);
    setIsSlotDialogOpen(true);
  };

  // Save slot changes
  const handleSaveSlot = (payload: { subject: string; teacher: string; room: string; color: PeriodSlot["color"]; colSpan: number }) => {
    if (!timetableData || !activeDay || !activePeriodId) return;

    const key = `${activeDay}-${activePeriodId}`;

    // Validate teacher conflict on frontend
    if (payload.teacher && payload.teacher.trim() !== "") {
      const selectedTeacher = payload.teacher.trim();
      const conflict = allTimetablesList.find((t: any) => {
        if (t.academic_year !== selectedAcademicYear || t.status !== "Published") return false;
        if (t.class_id === selectedClassId) return false;
        
        const otherSlot = t.slots?.[key];
        return otherSlot && otherSlot.teacher && otherSlot.teacher.trim() === selectedTeacher;
      });

      if (conflict) {
        const confClass = classesList.find((c: any) => c.id === conflict.class_id);
        const periodDef = timetableData.periods.find(p => p.id === activePeriodId);
        const timeRange = periodDef?.time || "";
        const periodName = periodDef?.name || `Period ${activePeriodId}`;
        const errorMsg = `Teacher is already assigned to Class ${confClass?.grade || conflict.class_id} - Section ${confClass?.section || "A"} during ${periodName} (${timeRange}). Please select another teacher or change the period.`;
        toast.error(errorMsg);
        return;
      }
    }

    const updatedSlots = { ...timetableData.slots };

    updatedSlots[key] = {
      subject: payload.subject.trim(),
      teacher: payload.teacher.trim(),
      room: payload.room.trim(),
      color: payload.color,
      colSpan: payload.colSpan > 1 ? payload.colSpan : undefined
    };

    // Handle colSpan overrides if spanning columns
    if (payload.colSpan > 1) {
      const periodIdx = timetableData.periods.findIndex(p => p.id === activePeriodId);
      if (periodIdx !== -1) {
        for (let i = 1; i < payload.colSpan; i++) {
          const nextPeriod = timetableData.periods[periodIdx + i];
          if (nextPeriod) {
            // Delete next slots to clear space for span
            delete updatedSlots[`${activeDay}-${nextPeriod.id}`];
          }
        }
      }
    }

    setTimetableData({
      ...timetableData,
      slots: updatedSlots
    });
    setIsSlotDialogOpen(false);
  };

  // Delete slot
  const handleDeleteSlot = () => {
    if (!timetableData || !activeDay || !activePeriodId) return;
    const key = `${activeDay}-${activePeriodId}`;
    const updatedSlots = { ...timetableData.slots };
    delete updatedSlots[key];
    setTimetableData({
      ...timetableData,
      slots: updatedSlots
    });
    setIsSlotDialogOpen(false);
  };

  // Create new period (Column)
  const handleAddPeriod = (period: { name: string; start: string; end: string; isBreak: boolean }) => {
    if (!timetableData) return;
    const newId = `P-${Date.now().toString().slice(-4)}`;
    const newPeriod: PeriodConfig = {
      id: newId,
      name: period.name.trim().toUpperCase(),
      time: `${period.start} - ${period.end}`,
      isBreak: period.isBreak
    };

    setTimetableData({
      ...timetableData,
      periods: [...timetableData.periods, newPeriod]
    });
    setIsAddPeriodOpen(false);
    toast.success("New period column added successfully!");
  };

  // Open Edit Period Column
  const handleOpenEditPeriod = (p: PeriodConfig) => {
    setEditingPeriod(p);
    setIsEditPeriodOpen(true);
  };

  // Save changes to Period Column
  const handleSaveEditPeriod = (updatedPeriod: PeriodConfig) => {
    if (!timetableData) return;

    const updatedPeriods = timetableData.periods.map(p => 
      p.id === updatedPeriod.id ? updatedPeriod : p
    );

    setTimetableData({
      ...timetableData,
      periods: updatedPeriods
    });
    setIsEditPeriodOpen(false);
    setEditingPeriod(null);
    toast.success("Period column updated successfully!");
  };

  // Delete Period Column
  const handleDeletePeriod = (id: string) => {
    if (!timetableData) return;
    if (window.confirm("Are you sure you want to delete this period column? Associated cells will be cleared.")) {
      const updatedPeriods = timetableData.periods.filter(p => p.id !== id);
      const updatedSlots = { ...timetableData.slots };
      
      // Clean up key pairs
      Object.keys(updatedSlots).forEach(key => {
        if (key.endsWith(`-${id}`)) {
          delete updatedSlots[key];
        }
      });

      setTimetableData({
        ...timetableData,
        periods: updatedPeriods,
        slots: updatedSlots
      });
      setIsEditPeriodOpen(false);
      setEditingPeriod(null);
      toast.success("Period column deleted successfully");
    }
  };

  // Create new Custom Day (Row)
  const handleAddRow = (name: string) => {
    if (!timetableData) return;
    setTimetableData({
      ...timetableData,
      days: [...timetableData.days, name.trim()]
    });
    setIsAddRowOpen(false);
    toast.success("New day/row appended successfully!");
  };

  // Delete Day/Row
  const handleDeleteRow = (dayName: string) => {
    if (!timetableData) return;
    if (window.confirm(`Are you sure you want to delete the row "${dayName}"?`)) {
      const updatedDays = timetableData.days.filter(d => d !== dayName);
      const updatedSlots = { ...timetableData.slots };

      Object.keys(updatedSlots).forEach(key => {
        if (key.startsWith(`${dayName}-`)) {
          delete updatedSlots[key];
        }
      });

      setTimetableData({
        ...timetableData,
        days: updatedDays,
        slots: updatedSlots
      });
      toast.success(`Row "${dayName}" removed successfully.`);
    }
  };

  // Automatically generate schedule using registered teachers and their subjects/departments
  const handleAutoGenerate = () => {
    if (!timetableData) return;
    if (window.confirm("Automatically fill all empty slots with smart schedules using registered teachers and their subjects?")) {
      const newSlots = { ...timetableData.slots };
      const colors: PeriodSlotData["color"][] = ["blue", "orange", "purple", "green", "yellow", "indigo", "red", "cyan"];

      const activeTeachers = teachers.map((t: any) => {
        const subs = t.metadata?.subjectsTaught
          ? t.metadata.subjectsTaught.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
        return {
          name: t.name,
          dept: t.dept || "General",
          subjects: subs.length > 0 ? subs : ["General Studies"]
        };
      });

      timetableData.days.forEach(day => {
        timetableData.periods.forEach(p => {
          if (p.isBreak) return;
          const key = `${day}-${p.id}`;
          
          if (!newSlots[key]) {
            if (activeTeachers.length > 0) {
              const randomTeacher = activeTeachers[Math.floor(Math.random() * activeTeachers.length)];
              const randomSubject = randomTeacher.subjects[Math.floor(Math.random() * randomTeacher.subjects.length)];
              
              let roomNum = "Room 101";
              if (randomTeacher.dept.toLowerCase().includes("science") || randomTeacher.dept.toLowerCase().includes("physics") || randomTeacher.dept.toLowerCase().includes("chemistry")) {
                roomNum = `Lab ${100 + Math.floor(Math.random() * 200)}`;
              } else {
                roomNum = `Room ${100 + Math.floor(Math.random() * 300)}`;
              }

              const colorVal = colors[Math.floor(Math.random() * colors.length)];

              newSlots[key] = {
                subject: randomSubject,
                teacher: randomTeacher.name,
                room: roomNum,
                color: colorVal
              };
            } else {
              const fallbackSubjects = ["General Education", "Library", "Study Hall"];
              newSlots[key] = {
                subject: fallbackSubjects[Math.floor(Math.random() * fallbackSubjects.length)],
                teacher: "Unassigned",
                room: `Room ${100 + Math.floor(Math.random() * 300)}`,
                color: "neutral"
              };
            }
          }
        });
      });

      setTimetableData({
        ...timetableData,
        slots: newSlots
      });
      toast.success("Schedule populated automatically using registered teachers!");
    }
  };

  // Download timetable schema as JSON
  const handleExport = () => {
    if (!timetableData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timetableData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `timetable_${currentClass?.code || 'class'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Timetable configuration exported successfully!");
  };

  // Print timetable
  const handlePrint = () => {
    window.print();
  };

  if (isClassesLoading || !timetableData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Navigation Return */}
      <div className="flex items-center gap-2">
        <Link
          to="/classes"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Back to Classes
        </span>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Class Timetable Management"
        subtitle="Design, optimize, and publish weekly academic schedules."
        actions={
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => toast.info("Activity logs under construction")} 
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold hover:bg-accent transition cursor-pointer"
            >
              <History className="h-4 w-4 text-muted-foreground" /> Logs
            </button>
            {!isTeacher && (
              <button 
                type="button" 
                onClick={() => setIsAddPeriodOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary-glow),0.15)] hover:opacity-95 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" /> Create New Schedule
              </button>
            )}
          </div>
        }
      />

      {/* Filter Selection Panel */}
      <Card className="p-4 border border-border bg-card">
        <div className="flex flex-wrap gap-4 items-center">
          
          {/* Academic Year select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Academic Year</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="h-9 w-36 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
            </select>
          </div>

          {/* Term Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="h-9 w-32 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Final Term">Final Term</option>
            </select>
          </div>

          {/* Classes selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                navigate({ to: "/timetable", search: { classId: e.target.value } });
              }}
              className="h-9 w-44 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              {filteredClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} {c.section ? `– ${c.section}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Designer Grid Wrapper */}
      <Card className="border border-border shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden bg-card flex flex-col justify-between">
        
        {/* Status Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {currentClass ? `${currentClass.grade} - Section ${currentClass.section || 'A'}` : 'Class'} Schedule
            </h2>
            <Badge tone={timetableData.status === "Published" ? "success" : "warning"}>
              {timetableData.status.toUpperCase()}
            </Badge>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Last saved: {timetableData.lastSaved}
          </span>
        </div>

        {/* Timetable Matrix */}
        <div className="p-6 overflow-hidden">
          <table className="w-full border-collapse border border-border/80 table-fixed">
            <thead>
              <tr className="bg-muted/15 border-b border-border/80">
                <th className="w-[85px] border border-border/80 px-1 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center bg-muted/5 select-none">
                  DAYS
                </th>
                {timetableData.periods.map((p) => (
                  <th 
                    key={p.id} 
                    onClick={isTeacher ? undefined : () => handleOpenEditPeriod(p)}
                    className={`border border-border/80 px-1 py-3 text-center transition group select-none ${
                      !isTeacher ? "cursor-pointer hover:bg-accent/40" : ""
                    } ${
                      p.isBreak ? "w-[60px] bg-muted/30" : ""
                    }`}
                  >
                    <div className={`text-[10px] font-bold text-primary tracking-wide leading-relaxed truncate ${!isTeacher ? "group-hover:underline" : ""}`} title={p.name}>
                      {p.name}
                    </div>
                    <div className="text-[9px] font-medium text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5 truncate" title={p.time}>
                      <Clock className="h-2.5 w-2.5 inline text-muted-foreground/75" /> {p.time}
                    </div>
                  </th>
                ))}
                
                {/* Column Adder */}
                {!isTeacher && (
                  <th className="w-[45px] border border-border/80 p-2 text-center bg-muted/5">
                    <button
                      type="button"
                      onClick={() => setIsAddPeriodOpen(true)}
                      className="h-8 w-8 rounded-lg border border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary transition hover:bg-primary/5 cursor-pointer"
                      title="Add Period Column"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {timetableData.days.map((day) => (
                <tr key={day} className="border-b border-border/80 last:border-0 hover:bg-muted/5 transition">
                  
                  {/* Day Row Header */}
                  <td className="border border-border/80 px-2 py-4 text-xs font-bold text-foreground bg-muted/10 text-center select-none relative group w-[85px]">
                    <span className="truncate block" title={day}>{day}</span>
                    {!isTeacher && timetableData.days.length > 5 && (
                      <button
                        onClick={() => handleDeleteRow(day)}
                        className="absolute right-1 top-1 p-0.5 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                        title={`Delete row ${day}`}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </td>

                  {/* Dynamic Periods loop */}
                  {timetableData.periods.map((p) => {
                    const key = `${day}-${p.id}`;
                    const slot = timetableData.slots[key];

                    // Break layout
                    if (p.isBreak) {
                      return (
                        <td 
                          key={p.id} 
                          onClick={isTeacher ? undefined : () => handleOpenSlot(day, p.id)}
                          className={`border border-border/80 bg-muted/45 p-0.5 select-none w-[60px] ${!isTeacher ? "cursor-pointer hover:bg-muted/65" : ""}`}
                        >
                          {slot ? (
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

                    // Scheduled slot card
                    if (slot) {
                      const colorStyling = COLOR_OPTIONS.find(c => c.value === slot.color) || COLOR_OPTIONS[0];

                      return (
                        <td
                          key={p.id}
                          onClick={isTeacher ? undefined : () => handleOpenSlot(day, p.id)}
                          className={`border border-border/80 p-1 transition ${!isTeacher ? "cursor-pointer" : ""}`}
                        >
                          <div className={`p-2 rounded-lg border transition-all hover:border-primary/20 ${colorStyling.bg} ${colorStyling.border}`}>
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

                    // Empty slot card
                    return (
                      <td
                        key={p.id}
                        onClick={isTeacher ? undefined : () => handleOpenSlot(day, p.id)}
                        className={`border border-border/80 p-1 transition bg-muted/5 ${!isTeacher ? "cursor-pointer hover:bg-muted/15" : "text-center select-none"}`}
                      >
                        {!isTeacher ? (
                          <div className="h-16 border border-dashed border-border/60 rounded-lg flex items-center justify-center hover:border-primary/50 text-muted-foreground/40 hover:text-primary transition-all duration-200">
                            <Plus className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="text-[10px] font-medium text-muted-foreground/30 py-4 italic">
                            Empty
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {!isTeacher && <td className="border border-border/80 px-1 w-12 bg-muted/5 animate-in fade-in"></td>}
                </tr>
              ))}

              {/* Row appending placeholder */}
              {!isTeacher && (
                <tr className="border-b border-border/80 last:border-0 hover:bg-muted/5 transition">
                  <td className="border border-border/80 p-3 text-center bg-muted/10">
                    <button
                      type="button"
                      onClick={() => setIsAddRowOpen(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase border border-dashed border-primary/40 px-2 py-1 rounded-md hover:bg-primary/5 cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Row
                    </button>
                  </td>
                  {timetableData.periods.map((p) => (
                    <td key={p.id} className="border border-border/80 p-2 bg-muted/5">
                      <div className="text-[10px] font-medium text-muted-foreground/40 text-center select-none py-4 italic">
                        —
                      </div>
                    </td>
                  ))}
                  <td className="border border-border/80 p-2 bg-muted/5 w-12"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-border/60 bg-muted/10 px-6 py-4 gap-4">
          <div className="flex items-center gap-2">
            {!isTeacher && (
              <>
                <button
                  onClick={() => saveSchedule("Draft")}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-border/80 bg-background hover:bg-accent text-foreground transition cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleAutoGenerate}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-4 text-xs font-bold text-primary hover:bg-primary/15 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" /> Generate Automatically
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
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
              <Download className="h-4 w-4" /> Export
            </button>
            {!isTeacher && (
              <button
                onClick={() => saveSchedule("Published")}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary-glow),0.15)] hover:opacity-95 transition cursor-pointer active:scale-98"
              >
                Publish Timetable
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Modal Dialogs extracted to sub-components */}
      <SlotDialog
        isOpen={isSlotDialogOpen}
        onOpenChange={setIsSlotDialogOpen}
        activeDay={activeDay}
        activePeriodId={activePeriodId}
        initialValue={activeDay && activePeriodId ? (timetableData?.slots[`${activeDay}-${activePeriodId}`] || null) : null}
        teachers={teachers}
        commonSubjects={commonSubjects}
        colorOptions={COLOR_OPTIONS}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
      />

      <AddPeriodDialog
        isOpen={isAddPeriodOpen}
        onOpenChange={setIsAddPeriodOpen}
        onAdd={handleAddPeriod}
      />

      <EditPeriodDialog
        isOpen={isEditPeriodOpen}
        onOpenChange={setIsEditPeriodOpen}
        period={editingPeriod}
        onSave={handleSaveEditPeriod}
        onDelete={handleDeletePeriod}
      />

      <AddRowDialog
        isOpen={isAddRowOpen}
        onOpenChange={setIsAddRowOpen}
        onAdd={handleAddRow}
      />
    </div>
  );
}

export function TTPage() {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherTimetable />;
  }

  return <AdminTimetable />;
}
