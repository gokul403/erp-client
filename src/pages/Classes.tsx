import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search, School, Trash2, Edit, Check, GraduationCap, Building, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/erp/ui";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useClassesQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useClassTimetablesQuery,
  useStaffQuery,
} from "@/hooks/use-api-data";

interface ClassData {
  id: string;
  grade: string;        // Grade/Class Name, e.g. Grade 10
  section: string;      // Section, e.g. A
  batch: string;        // Batch Name, e.g. Science Batch
  academicYear: string; // Academic Year, e.g. 2026-2027
  campus: string;       // Campus / Branch, e.g. Main Campus
  code: string;         // Class Code, e.g. G10-A
  teacher: string;      // Class Teacher (mock)
  room: string;         // Classroom Room (mock)
  students: number;     // Students Count (mock)
}

const DEFAULT_CLASSES: ClassData[] = [
  {
    id: "CL-01",
    grade: "Grade 10",
    section: "A",
    batch: "2026-2027 Batch",
    academicYear: "2026-2027",
    campus: "Main Campus",
    code: "G10-A",
    teacher: "Vikram Iyer",
    room: "R-101",
    students: 32,
  },
  {
    id: "CL-02",
    grade: "Grade 9",
    section: "B",
    batch: "2025-2026 Batch",
    academicYear: "2025-2026",
    campus: "North Campus",
    code: "G9-B",
    teacher: "Neha Aggarwal",
    room: "R-102",
    students: 28,
  },
  {
    id: "CL-03",
    grade: "Grade 11",
    section: "A",
    batch: "Science Batch",
    academicYear: "2026-2027",
    campus: "Main Campus",
    code: "G11-A",
    teacher: "Ravi Kumar",
    room: "R-105",
    students: 30,
  },
  {
    id: "CL-04",
    grade: "Class 5",
    section: "C",
    batch: "General Batch",
    academicYear: "2026-2027",
    campus: "South Campus",
    code: "C5-C",
    teacher: "Priya Sharma",
    room: "R-204",
    students: 25,
  },
];

export function ClassesPage() {
  const { data: classesListRaw = [], isLoading: isClassesLoading } = useClassesQuery();
  const { data: allTimetables = [], isLoading: isTimetablesLoading } = useClassTimetablesQuery();
  const { data: staffList = [] } = useStaffQuery();
  const addClassMutation = useAddClassMutation();
  const updateClassMutation = useUpdateClassMutation();
  const deleteClassMutation = useDeleteClassMutation();

  const isLoading = isClassesLoading || isTimetablesLoading;

  const teachers = staffList.filter(
    (s: any) =>
      s.user_type === 2 ||
      (s.role && (s.role.toLowerCase().includes("teacher") || s.role.toLowerCase().includes("instructor")))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [campusFilter, setCampusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, campusFilter, yearFilter]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [batch, setBatch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [campus, setCampus] = useState("");
  const [code, setCode] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");

  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);

  // Map backend record to frontend interface
  const mapClassRecordToData = (c: any): ClassData => ({
    id: c.id,
    grade: c.grade,
    section: c.section || "",
    batch: c.batch || "",
    academicYear: c.academic_year || c.academicYear || "",
    campus: c.campus,
    code: c.code,
    teacher: c.teacher || "",
    room: c.room || "",
    students: c.students_count !== undefined ? c.students_count : (c.students ?? 0),
  });

  const classesList = classesListRaw.map(mapClassRecordToData);

  // Load configuration lists dynamically from LocalStorage
  useEffect(() => {
    const savedYears = localStorage.getItem("academic_years");
    if (savedYears) {
      try {
        const parsed = JSON.parse(savedYears);
        if (Array.isArray(parsed)) {
          setAcademicYears(parsed.map((ay: any) => ay.name));
        }
      } catch (e) { }
    } else {
      setAcademicYears(["2025-26", "2024-25", "2026-27"]);
    }

    const savedOrgs = localStorage.getItem("organization_list");
    if (savedOrgs) {
      try {
        const parsed = JSON.parse(savedOrgs);
        if (Array.isArray(parsed)) {
          setCampuses(parsed.map((org: any) => org.name).filter(Boolean));
        }
      } catch (e) { }
    } else {
      setCampuses(["Main Campus", "North Campus", "South Campus"]);
    }
  }, []);

  // Update default year/campus when loaded
  useEffect(() => {
    if (!academicYear && academicYears.length > 0) {
      setAcademicYear(academicYears[0]);
    }
    if (!campus && campuses.length > 0) {
      setCampus(campuses[0]);
    }
  }, [academicYears, campuses]);

  // 2. Class Code Auto-Suggestion Logic
  // Suggest G10-A from "Grade 10" and "A", or C5-B from "Class 5" and "B"
  useEffect(() => {
    if (!editingId) {
      const matchGrade = grade.match(/(\d+)/);
      const gradeNum = matchGrade ? matchGrade[0] : "";

      let prefix = "";
      if (grade.toLowerCase().includes("grade")) {
        prefix = "G";
      } else if (grade.toLowerCase().includes("class")) {
        prefix = "C";
      } else {
        prefix = grade.slice(0, 1).toUpperCase();
      }

      const secName = section ? `-${section.toUpperCase()}` : "";

      if (gradeNum) {
        setCode(`${prefix}${gradeNum}${secName}`);
      } else if (grade) {
        setCode(`${grade.replace(/\s+/g, "").slice(0, 4).toUpperCase()}${secName}`);
      } else {
        setCode("");
      }
    }
  }, [grade, section, editingId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setGrade("");
    setSection("");
    setBatch("");
    setAcademicYear(academicYears[0] || "");
    setCampus(campuses[0] || "");
    setCode("");
    setTeacher("");
    setRoom("");
    setIsOpen(true);
  };

  const handleOpenEdit = (c: ClassData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setGrade(c.grade);
    setSection(c.section);
    setBatch(c.batch);
    setAcademicYear(c.academicYear);
    setCampus(c.campus);
    setCode(c.code);
    setTeacher(c.teacher);
    setRoom(c.room);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade.trim()) {
      toast.error("Class/Grade Name is required");
      return;
    }
    if (!academicYear.trim()) {
      toast.error("Academic Year is required");
      return;
    }
    if (!campus.trim()) {
      toast.error("Campus / Branch is required");
      return;
    }

    // Chosen teacher is optional, chosen room fallback if blank
    const chosenTeacher = teacher.trim();
    const chosenRoom = room.trim() || `R-${Math.floor(100 + Math.random() * 400)}`;

    try {
      if (editingId) {
        // Edit mode
        await updateClassMutation.mutateAsync({
          id: editingId,
          data: {
            grade: grade.trim(),
            section: section.trim().toUpperCase(),
            batch: batch.trim(),
            academic_year: academicYear,
            campus,
            code: code.trim(),
            teacher: chosenTeacher,
            room: chosenRoom,
          },
        });
        toast.success("Class section updated successfully!");
      } else {
        // Create mode
        await addClassMutation.mutateAsync({
          grade: grade.trim(),
          section: section.trim().toUpperCase(),
          batch: batch.trim(),
          academic_year: academicYear,
          campus,
          code: code.trim(),
          teacher: chosenTeacher,
          room: chosenRoom,
          students_count: Math.floor(20 + Math.random() * 15),
        });
        toast.success("New class section created successfully!");
      }
      setIsOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save class section");
    }
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteClassMutation.mutateAsync(id);
        toast.success(`Class ${name} deleted successfully`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to delete class section");
      }
    }
  };

  // Filter list
  const filteredClasses = classesList.filter((c) => {
    const matchesSearch =
      c.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCampus = campusFilter === "All" || c.campus === campusFilter;
    const matchesYear = yearFilter === "All" || c.academicYear === yearFilter;

    return matchesSearch && matchesCampus && matchesYear;
  });

  const itemsPerPage = 6;
  const totalItems = filteredClasses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Back to Settings
        </span>
      </div>

      <PageHeader
        title="Classes & Sections"
        subtitle="Configure grades, organize classroom branches, and allocate batches."
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Class
          </button>
        }
      />

      {/* Search and Filters */}
      <Card className="p-4 flex flex-wrap gap-4 items-center justify-between border border-border">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by class name, code, batch..."
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Campus:</span>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="All">All Campuses</option>
              {campuses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Academic Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
            >
              <option value="All">All Years</option>
              {academicYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Classes Cards Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border border-dashed border-border bg-muted/10">
          <School className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-base font-bold">No Classes Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search criteria or register a new class section.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedClasses.map((c) => {
              // Find timetable for this class
              const classTT = allTimetables.find((t: any) => t.class_id === c.id);

              // Compute status badge details
              const ttStatus = classTT?.status || "Draft";

              // Calculate assigned periods (scheduled slots vs total active periods) based on current day of the week
              let periodsAssignedText = "0 / 8";
              if (classTT) {
                const activePeriods = classTT.periods ? classTT.periods.filter((p: any) => !p.isBreak) : [];
                const totalActiveCount = activePeriods.length || 8;

                // Get current weekday name (e.g. "Monday", "Tuesday")
                const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const todayIdx = new Date().getDay();
                const currentDayName = todayIdx === 0 ? "Monday" : daysOfWeek[todayIdx];

                // Count filled slots for the current weekday
                const filledCount = activePeriods.filter((p: any) => {
                  const slotKey = `${currentDayName}-${p.id}`;
                  return classTT.slots && classTT.slots[slotKey] && classTT.slots[slotKey].subject;
                }).length;

                periodsAssignedText = `${filledCount} / ${totalActiveCount}`;
              } else {
                // Fallback default mock adjusted for today's weekday
                const todayIdx = new Date().getDay();
                if (todayIdx === 2) {
                  // Tuesday mocks
                  periodsAssignedText = c.id === 'CL-01' ? '6 / 8' : c.id === 'CL-02' ? '6 / 8' : '3 / 8';
                } else {
                  periodsAssignedText = c.id === 'CL-01' ? '8 / 8' : c.id === 'CL-02' ? '5 / 8' : '2 / 8';
                }
              }

              // Get last updated date dynamically
              const lastUpdatedDate = classTT?.updated_at
                ? new Date(classTT.updated_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
                : ((c as any).created_at
                  ? new Date((c as any).created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                  : "15 Jul 2026");

              return (
                <Card
                  key={c.id}
                  className="p-4 border border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] transition flex flex-col justify-between bg-card hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] duration-300 rounded-xl animate-in fade-in"
                >
                  <div>
                    {/* Card Title Header */}
                    <div className="border-b border-border/50 pb-2 mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold tracking-tight text-foreground truncate max-w-[120px]" title={`${c.grade} ${c.section ? `- Section ${c.section}` : ""}`}>
                        {c.grade} {c.section ? `- Sec ${c.section}` : ""}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge tone={ttStatus === "Published" ? "success" : "muted"}>
                          {ttStatus.toUpperCase()}
                        </Badge>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === c.id ? null : c.id);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer animate-in fade-in"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {menuOpenId === c.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                }}
                              />
                              <div className="absolute right-0 mt-1 w-28 origin-top-right rounded-lg border border-border bg-card p-0.5 shadow-lg z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(c, e);
                                    setMenuOpenId(null);
                                  }}
                                  className="flex w-full items-center rounded-md px-2 py-1 text-[11px] font-bold text-foreground hover:bg-accent transition-all cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(c.id, `${c.grade} ${c.section}`, e);
                                    setMenuOpenId(null);
                                  }}
                                  className="flex w-full items-center rounded-md px-2 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key-Value details */}
                    <div className="space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Academic Year</span>
                        <span className="font-bold text-foreground">{c.academicYear}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Periods Assigned</span>
                        <span className="font-bold text-foreground">{periodsAssignedText}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Lead Teacher</span>
                        <span className="font-bold text-foreground truncate max-w-[120px]">{c.teacher || "Unassigned"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Last Updated</span>
                        <span className="font-bold text-foreground">{lastUpdatedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <Link
                      to="/timetable"
                      search={{ classId: c.id }}
                      className="w-full inline-flex h-8 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground shadow-[0_2px_8px_rgba(var(--primary-glow),0.08)] hover:opacity-95 active:scale-98 transition-all cursor-pointer text-center"
                    >
                      View Timetable
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-4 sm:px-6 mt-6 bg-card rounded-xl border select-none">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-semibold text-foreground">{totalItems}</span> classes
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm gap-1" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-lg border border-border bg-background p-1.5 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const active = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "relative inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold transition cursor-pointer",
                            active
                              ? "z-10 bg-primary border-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-lg border border-border bg-background p-1.5 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] bg-background border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {editingId ? "Edit Class Section" : "Add New Class"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Add class naming codes, select academic years, batch parameters, and branch campuses.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Class/Grade Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Class / Grade Name *
              </label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade 10, Class 5"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Section Name & suggested Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Section Name (Optional)
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A, B, C"
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Class Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. G10-A"
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            {/* Batch Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Batch Name (Optional)
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 2026-2027 Batch, Science Batch"
                className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Academic Year & Campus */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Academic Year *
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                >
                  <option value="">Select Year</option>
                  {academicYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Campus / Branch *
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 cursor-pointer"
                >
                  <option value="">Select Campus</option>
                  {campuses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mock variables for UI card styling consistency */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 mt-3">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">
                  Class Teacher (Optional)
                </label>
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3.5 text-xs outline-none focus:border-ring cursor-pointer"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.role || t.custom_role || "Teacher"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">
                  Classroom Room (Optional)
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. R-101"
                  className="h-9 w-full rounded-lg border border-input bg-card px-3.5 text-xs outline-none focus:border-ring"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-card px-4 text-xs font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer"
              >
                {editingId ? "Save Changes" : "Create Class"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
