import React from "react";
import { Search, Grid, List } from "lucide-react";
import { Card } from "@/components/erp/ui";

interface EventFiltersProps {
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  academicYear: string;
  setAcademicYear: (val: string) => void;
  grade: string;
  setGrade: (val: string) => void;
  classId: string;
  setClassId: (val: string) => void;
  creator: string;
  setCreator: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  viewMode: "card" | "list";
  setViewMode: (val: "card" | "list") => void;
  classesList: any[];
  staffList: any[];
}

export function EventFilters({
  category, setCategory,
  status, setStatus,
  academicYear, setAcademicYear,
  grade, setGrade,
  classId, setClassId,
  creator, setCreator,
  startDate, setStartDate,
  endDate, setEndDate,
  search, setSearch,
  viewMode, setViewMode,
  classesList,
  staffList
}: EventFiltersProps) {
  const uniqueGrades = Array.from(new Set(classesList.map((c: any) => c.grade).filter(Boolean)));
  const filteredSections = classesList.filter((c: any) => !grade || c.grade === grade);

  return (
    <Card className="p-4 border border-border bg-card space-y-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex items-center flex-1 min-w-[200px]">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, venues..."
            className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-xs outline-none transition focus:border-ring"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="Events">Events</option>
          <option value="Announcements">Announcements</option>
          <option value="Academic Activities">Academic Activities</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>

        {/* Academic Year */}
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
        >
          <option value="">All Years</option>
          <option value="2025-2026">2025-2026</option>
          <option value="2026-2027">2026-2027</option>
          <option value="2027-2028">2027-2028</option>
        </select>

        {/* Target Grade */}
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setClassId("");
          }}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
        >
          <option value="">All Grades</option>
          {uniqueGrades.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* Target Class/Section */}
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
        >
          <option value="">All Sections</option>
          {filteredSections.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.grade} - Section {c.section}
            </option>
          ))}
        </select>

        {/* Creator */}
        <select
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-xs outline-none focus:border-ring cursor-pointer"
        >
          <option value="">All Creators</option>
          {staffList.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Date Range */}
        <div className="flex items-center gap-1 bg-muted/10 border border-border p-1 rounded-lg">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 bg-transparent border-0 px-1 text-[10px] outline-none cursor-pointer text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-7 bg-transparent border-0 px-1 text-[10px] outline-none cursor-pointer text-foreground"
          />
        </div>

        {/* View Mode */}
        <div className="flex border border-border rounded-lg p-0.5 bg-card shrink-0">
          <button
            onClick={() => setViewMode("card")}
            className={`p-1.5 rounded-md transition ${viewMode === "card" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Card View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
