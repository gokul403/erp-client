import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  Save,
  Loader2,
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Card } from "@/components/erp/ui";
import { toast } from "sonner";
import {
  useAttendanceQuery,
  useAssignedClassesQuery,
  useStudentsByClassQuery,
  useSaveAttendanceMutation,
  useUpdateAttendanceMutation,
} from "@/hooks/use-api-data";
import { useRole } from "@/lib/role-context";

// Utilities
function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDayName(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0]?.[0]?.toUpperCase() || "?";
}

// Types
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

interface ActiveSession {
  classId: string;
  className: string;
  grade: string;
  section: string;
  periodId: string;
  periodName: string;
  subject: string;
  time: string;
  room: string;
}

export function AttPage() {
  const { user } = useRole();
  const today = getTodayISO();

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [activePeriodId, setActivePeriodId] = useState<string>('');
  
  const dayName = getDayName(selectedDate);

  // Queries
  const { data: assignedClasses = [], isLoading: classesLoading } = useAssignedClassesQuery();

  // Initialize selected class when classes load
  useEffect(() => {
    if (!selectedClassId && assignedClasses.length > 0) {
      setSelectedClassId(assignedClasses[0].id);
    }
  }, [assignedClasses, selectedClassId]);

  const selectedClass = assignedClasses.find((c: any) => c.id === selectedClassId);

  // Generate Schedule Timeline for the selected class on the selected date
  const timeline = useMemo(() => {
    if (!selectedClass) return [];
    
    const targetDayLower = dayName.toLowerCase();
    const schedule: ActiveSession[] = [];
    
    const days: string[] = selectedClass.days || [];
    const dayIndex = days.findIndex((d: string) => d.toLowerCase() === targetDayLower);
    
    if (dayIndex !== -1) {
      const periods: any[] = selectedClass.periods || [];
      const slots: Record<string, any> = selectedClass.slots || {};
      
      periods.forEach((p: any) => {
        const key = `${days[dayIndex]}_${p.id}`;
        const slot = slots[key];
        
        schedule.push({
          classId: selectedClass.id,
          className: selectedClass.section ? `${selectedClass.grade} - Section ${selectedClass.section}` : selectedClass.grade,
          grade: selectedClass.grade,
          section: selectedClass.section,
          periodId: p.id,
          periodName: p.name,
          subject: slot?.subject || (p.isBreak ? p.name : 'Free'),
          time: p.time,
          room: slot?.room || 'TBD',
        });
      });
      schedule.sort((a, b) => a.periodName.localeCompare(b.periodName));
    }
    return schedule;
  }, [selectedClass, dayName]);

  // Auto-select first active period
  useEffect(() => {
    if (timeline.length > 0 && !timeline.find(t => t.periodId === activePeriodId)) {
      // Prefer the first non-break period if possible
      const firstActive = timeline.find(t => t.subject !== 'Lunch Break' && t.subject !== 'Break' && t.subject !== 'Free') || timeline[0];
      setActivePeriodId(firstActive.periodId);
    } else if (timeline.length === 0) {
      setActivePeriodId('');
    }
  }, [timeline, activePeriodId]);

  const activeSession = timeline.find(t => t.periodId === activePeriodId);
  const grade = activeSession?.grade || selectedClass?.grade || "";
  const section = activeSession?.section || selectedClass?.section || undefined;

  const { data: students = [], isLoading: studentsLoading } = useStudentsByClassQuery({ grade, section });
  
  const { data: serverRecords = [], isLoading: recordsLoading } = useAttendanceQuery({
    className: activeSession?.className || "",
    date: selectedDate,
    period: activeSession?.periodName || "",
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const isUpdate = serverRecords.length > 0;

  // Initialize Map
  useEffect(() => {
    if (studentsLoading || recordsLoading || !activeSession) return;

    const initial: Record<string, AttendanceStatus> = {};

    // Default everyone to PRESENT
    students.forEach((s: any) => {
      initial[s.id] = "PRESENT";
    });

    // Override with server records if they exist
    if (serverRecords.length > 0) {
      serverRecords.forEach((rec: any) => {
        if (rec.student_id && rec.status) {
          initial[rec.student_id] = rec.status as AttendanceStatus;
        }
      });
    }

    setAttendanceMap(initial);
  }, [students, serverRecords, studentsLoading, recordsLoading, activeSession]);

  // Mutations
  const saveAttendance = useSaveAttendanceMutation();
  const updateAttendance = useUpdateAttendanceMutation();
  const isSubmitting = saveAttendance.isPending || updateAttendance.isPending;

  // Stats
  const totalStudents = students.length;
  const presentCount = students.filter((s: any) => attendanceMap[s.id] === "PRESENT").length;

  const setAllPresent = () => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      students.forEach((s: any) => {
        next[s.id] = "PRESENT";
      });
      return next;
    });
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleSave = () => {
    if (!activeSession) return;

    const records = students.map((s: any) => ({
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      roll: s.roll_number || s.admission_number,
      status: attendanceMap[s.id] || "PRESENT",
    }));

    const payload = {
      class_name: activeSession.className,
      date: selectedDate,
      period: activeSession.periodName,
      records,
    };

    if (isUpdate) {
      updateAttendance.mutate(payload, {
        onSuccess: () => {
          toast.success("Attendance updated successfully!");
        },
        onError: () => toast.error("Failed to update attendance"),
      });
    } else {
      saveAttendance.mutate(payload, {
        onSuccess: () => {
          toast.success("Attendance saved successfully!");
        },
        onError: () => toast.error("Failed to save attendance"),
      });
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(totalStudents / pageSize) || 1;
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-success/15 text-success uppercase tracking-wider">PRESENT</span>;
      case "ABSENT":
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 uppercase tracking-wider">ABSENT</span>;
      case "LATE":
        return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 uppercase tracking-wider">LATE</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center text-[10px] font-bold text-muted-foreground hover:text-foreground mb-4 uppercase tracking-wider transition">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">Attendance Marking</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {activeSession && <span className="font-semibold text-foreground/70"> • {activeSession.periodName} in progress</span>}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !activeSession}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0051a8] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#0051a8]/90 transition disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Attendance
        </button>
      </div>

      {/* Filter and Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 p-6 flex flex-col sm:flex-row items-end gap-4 shadow-sm border-border">
          <div className="w-full space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Class</label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              >
                {assignedClasses.length === 0 && <option value="">No classes assigned</option>}
                {assignedClasses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.section ? `${c.grade} - Section ${c.section}` : c.grade}
                  </option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
            </div>
          </div>
          
          <div className="w-full space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Academic Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              />
              <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <button className="h-[42px] w-[46px] shrink-0 inline-flex items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-accent transition shadow-sm cursor-pointer">
            <Filter className="h-4 w-4" />
          </button>
        </Card>

        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col justify-center bg-[#0d6efd] border-transparent text-white shadow-md rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Total Students</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold">{totalStudents}</span>
              <span className="text-[10px] font-semibold opacity-80">Registered</span>
            </div>
          </Card>
          <Card className="p-4 flex flex-col justify-center bg-[#198754] border-transparent text-white shadow-md rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Present</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold">{presentCount}</span>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Timeline */}
      <Card className="p-6 border-border shadow-sm overflow-hidden flex items-stretch">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide w-full">
          <div className="shrink-0 flex flex-col justify-center border-r border-border pr-6 my-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Schedule</span>
            <span className="text-[#0d6efd] font-bold text-sm">Today</span>
          </div>

          {classesLoading ? (
             <div className="text-sm font-medium text-muted-foreground flex items-center">
               <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading schedule...
             </div>
          ) : timeline.length === 0 ? (
            <div className="text-sm font-medium text-muted-foreground">No periods scheduled for this date.</div>
          ) : (
            timeline.map((session, idx) => {
              const isActive = session.periodId === activePeriodId;
              const isBreak = session.subject.toLowerCase().includes('break');
              
              return (
                <button
                  key={idx}
                  onClick={() => !isBreak && setActivePeriodId(session.periodId)}
                  className={`shrink-0 flex flex-col text-left py-2 px-1 ${
                    isBreak ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white bg-[#0d6efd] px-2 py-0.5 rounded-full -ml-1 shadow-sm' : 'text-muted-foreground'}`}>
                    {session.periodName} {isActive && '(ACTIVE)'}
                  </span>
                  <div className={`mt-2 rounded-xl px-4 py-3 transition border ${isActive ? 'bg-[#0d6efd] text-white border-transparent shadow-md' : 'bg-transparent text-foreground border-transparent hover:bg-muted/50 group-hover:border-border'}`}>
                    <span className="block text-sm font-bold truncate max-w-[120px]">{session.subject}</span>
                    <span className={`block text-[11px] mt-1 ${isActive ? 'opacity-90 font-medium' : 'text-muted-foreground font-semibold'}`}>
                      {session.time}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Roll Call Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-card gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-foreground">Student Roll Call</h2>
            {selectedClass && (
              <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success uppercase tracking-wider">
                Class {selectedClass.grade.replace('Grade ', '')}-{selectedClass.section}
              </span>
            )}
          </div>
          <button
            onClick={setAllPresent}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-background px-4 text-xs font-bold text-primary hover:bg-primary/5 transition shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> MARK ALL PRESENT
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/10 text-left">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Roll No</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Current Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsLoading || recordsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading students...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No students found in this class.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s: any, idx: number) => {
                  const status = attendanceMap[s.id] || "PRESENT";
                  const isPresent = status === "PRESENT";
                  const isAbsent = status === "ABSENT";
                  const isLate = status === "LATE";
                  const rollStr = String(s.roll_number || s.admission_number || (currentPage - 1) * pageSize + idx + 1).padStart(2, '0');

                  return (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/20 transition group">
                      <td className="px-6 py-4 font-semibold text-muted-foreground text-xs">{rollStr}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                            {getInitials(s.first_name + " " + s.last_name)}
                          </div>
                          <span className="font-semibold text-foreground text-sm">{s.first_name} {s.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground text-xs">{s.id}</td>
                      <td className="px-6 py-4 text-center">
                        {renderBadge(status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setStatus(s.id, "PRESENT")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                              isPresent 
                                ? 'bg-success text-white ring-2 ring-success/20' 
                                : 'bg-background border border-border text-muted-foreground hover:border-success hover:text-success'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => setStatus(s.id, "ABSENT")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                              isAbsent 
                                ? 'bg-red-500 text-white ring-2 ring-red-500/20' 
                                : 'bg-background border border-border text-muted-foreground hover:border-red-500 hover:text-red-500'
                            }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => setStatus(s.id, "LATE")}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                              isLate 
                                ? 'bg-yellow-500 text-white ring-2 ring-yellow-500/20' 
                                : 'bg-background border border-border text-muted-foreground hover:border-yellow-500 hover:text-yellow-500'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-border/80 bg-background gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Showing {Math.min(pageSize, paginatedStudents.length)} of {totalStudents} Students
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 h-8 rounded-lg bg-muted/40 text-[10px] font-bold text-muted-foreground hover:bg-accent transition disabled:opacity-50 cursor-pointer"
            >
              PREVIOUS
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === i + 1 
                    ? 'bg-[#0d6efd] text-white shadow-sm' 
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 h-8 rounded-lg bg-muted/40 text-[10px] font-bold text-muted-foreground hover:bg-accent transition disabled:opacity-50 cursor-pointer"
            >
              NEXT
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
